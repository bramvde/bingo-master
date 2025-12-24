let audioCtx: AudioContext | null = null;
let voices: SpeechSynthesisVoice[] = [];
let ambienceNodes: { stop: () => void } | null = null;

// Absolute path is standard for public assets
const SANTA_SOUND_URL = '/sounds/santa-claus.mp3';

let santaBuffer: AudioBuffer | null = null;
let santaLoading = false;
let santaAudioFailed = false;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Fallback Synth if file is missing/broken
const playSynthSanta = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    
    // Deep "Ho Ho Ho" pattern
    [0, 0.6, 1.2].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t + offset); 
        osc.frequency.linearRampToValueAtTime(80, t + offset + 0.3); 

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t + offset);
        filter.frequency.linearRampToValueAtTime(400, t + offset + 0.3);

        gain.gain.setValueAtTime(0, t + offset);
        gain.gain.linearRampToValueAtTime(0.5, t + offset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + offset);
        osc.stop(t + offset + 0.5);
    });
  } catch (e) {
    console.error("Synth failed", e);
  }
};

const loadSantaSound = async () => {
  if (santaBuffer || santaLoading || santaAudioFailed) return;
  
  santaLoading = true;
  try {
    const ctx = getCtx();
    const response = await fetch(SANTA_SOUND_URL);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    santaBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.log("Santa audio loaded successfully via Web Audio API");
  } catch (error) {
    console.warn("Failed to load Santa MP3 buffer. Using synth fallback.", error);
    santaAudioFailed = true;
  } finally {
    santaLoading = false;
  }
};

export const initAudio = () => {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  
  // Start loading the MP3 immediately
  loadSantaSound();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const loadVoices = () => {
      voices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }
};

export const playTick = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(t + 0.05);
  } catch (e) {}
};

export const playJingle = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const frequencies = [2000, 2400, 3000, 4200, 6000];
    
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq + (Math.random() * 200 - 100);
      
      const startOffset = Math.random() * 0.02;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.03, t + startOffset + 0.01); 
      gain.gain.exponentialRampToValueAtTime(0.001, t + startOffset + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t + startOffset);
      osc.stop(t + startOffset + 0.35);
    });

  } catch (e) {}
};

export const playSanta = () => {
  if (typeof window === 'undefined') return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // 1. If buffer is ready, play it
  if (santaBuffer) {
    try {
      const ctx = getCtx();
      const source = ctx.createBufferSource();
      source.buffer = santaBuffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.error("Error playing Santa buffer", e);
      playSynthSanta();
    }
    return;
  }

  // 2. If failed, use synth
  if (santaAudioFailed) {
    playSynthSanta();
    return;
  }

  // 3. If still loading or not started, try loading again and play synth for now
  loadSantaSound();
  playSynthSanta();
};

export const startChristmasAmbience = () => {
  if (ambienceNodes) return;

  try {
    const ctx = getCtx();
    
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.value = 0.02;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    lfo.start();

    let chimeTimeout: number;
    const playRandomChime = () => {
        if (!ambienceNodes) return;

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51]; 
        const freq = notes[Math.floor(Math.random() * notes.length)];
        
        const osc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.05, now + 0.05);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        
        osc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 3);

        chimeTimeout = window.setTimeout(playRandomChime, 2000 + Math.random() * 5000);
    };

    playRandomChime();

    ambienceNodes = {
        stop: () => {
            try {
              noise.stop();
              lfo.stop();
              clearTimeout(chimeTimeout);
              gain.disconnect();
            } catch(e) {}
            ambienceNodes = null;
        }
    };

  } catch (e) {
     console.error("Ambience error", e);
  }
};

export const stopChristmasAmbience = () => {
    if (ambienceNodes) {
        ambienceNodes.stop();
    }
};

export const playPop = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.1);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(t + 0.5);
  } catch (e) {}
};

export const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'nl-NL';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;

  if (voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }

  const dutchVoice = voices.find(v => v.lang === 'nl-NL' && v.name.includes('Google'))
    || voices.find(v => v.lang === 'nl-NL' && v.name.includes('Microsoft'))
    || voices.find(v => v.lang === 'nl-NL')
    || voices.find(v => v.lang.startsWith('nl'));
  
  if (dutchVoice) {
    utterance.voice = dutchVoice;
    utterance.lang = dutchVoice.lang;
  }

  window.speechSynthesis.speak(utterance);
};