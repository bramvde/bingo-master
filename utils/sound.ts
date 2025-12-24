let audioCtx: AudioContext | null = null;
let voices: SpeechSynthesisVoice[] = [];
let ambienceNodes: { stop: () => void } | null = null;

// Initialize voice loading immediately to handle async loading in browsers like Chrome
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    voices = window.speechSynthesis.getVoices();
  };
  
  loadVoices();
  
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const initAudio = () => {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  
  // Ensure voices are loaded when user interacts
  if (voices.length === 0 && 'speechSynthesis' in window) {
    voices = window.speechSynthesis.getVoices();
  }
};

export const playTick = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Woodblock / Click sound
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(t + 0.05);
  } catch (e) {
    // Ignore audio errors
  }
};

export const playJingle = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Create a burst of high frequency sounds to simulate sleigh bells
    const frequencies = [2000, 2400, 3000, 4200, 6000];
    
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Randomize frequency slightly for realism
      osc.frequency.value = freq + (Math.random() * 200 - 100);
      
      // Randomize start time slightly (within 20ms) to create "shaking" effect
      const startOffset = Math.random() * 0.02;

      gain.gain.setValueAtTime(0, t);
      // Fast attack, medium decay
      gain.gain.linearRampToValueAtTime(0.03, t + startOffset + 0.01); 
      gain.gain.exponentialRampToValueAtTime(0.001, t + startOffset + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t + startOffset);
      osc.stop(t + startOffset + 0.35);
    });

  } catch (e) {
    // Ignore
  }
};

export const startChristmasAmbience = () => {
  if (ambienceNodes) return; // Already playing

  try {
    const ctx = getCtx();
    
    // 1. Wind Noise
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.value = 0.02; // Very quiet wind

    // LFO to modulate wind frequency slightly (swirling effect)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Slow wave (10 seconds)
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200; // Modulate filter by +/- 200Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    lfo.start();

    // 2. Occasional Wind Chimes
    let chimeTimeout: number;
    const playRandomChime = () => {
        if (!ambienceNodes) return; // Stop if stopped

        const now = ctx.currentTime;
        // Pentatonic scale notes (C, E, G, B, C, E)
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51]; 
        const freq = notes[Math.floor(Math.random() * notes.length)];
        
        const osc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.05, now + 0.05);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 3); // Long tail
        
        osc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 3);

        // Schedule next chime between 2 and 7 seconds
        chimeTimeout = window.setTimeout(playRandomChime, 2000 + Math.random() * 5000);
    };

    playRandomChime();

    // Store stop function
    ambienceNodes = {
        stop: () => {
            try {
              noise.stop();
              lfo.stop();
              clearTimeout(chimeTimeout);
              gain.disconnect();
              // lfoGain.disconnect(); // Optional cleanup
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

    // Pleasant "pop" or "ding"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.1);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(t + 0.5);
  } catch (e) {
    // Ignore
  }
};

export const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel(); // Stop any current speech
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'nl-NL';
  utterance.rate = 0.85; // Slightly slower for clarity
  utterance.pitch = 1.0;

  // Double check voices if empty
  if (voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }

  // Improved selection strategy for Dutch voices
  const dutchVoice = voices.find(v => v.lang === 'nl-NL' && v.name.includes('Google'))
    || voices.find(v => v.lang === 'nl-NL' && v.name.includes('Microsoft'))
    || voices.find(v => v.lang === 'nl-NL')
    || voices.find(v => v.lang.startsWith('nl'));
  
  if (dutchVoice) {
    utterance.voice = dutchVoice;
    utterance.lang = dutchVoice.lang;
  } else {
    console.log("No specific Dutch voice found. Using default voice with nl-NL locale hint.");
  }

  window.speechSynthesis.speak(utterance);
};