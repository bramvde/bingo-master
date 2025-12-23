let audioCtx: AudioContext | null = null;
let voices: SpeechSynthesisVoice[] = [];

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
  // 1. Google Dutch (often high quality)
  // 2. Microsoft Dutch
  // 3. Exact locale match
  // 4. Loose language match
  const dutchVoice = voices.find(v => v.lang === 'nl-NL' && v.name.includes('Google'))
    || voices.find(v => v.lang === 'nl-NL' && v.name.includes('Microsoft'))
    || voices.find(v => v.lang === 'nl-NL')
    || voices.find(v => v.lang.startsWith('nl'));
  
  if (dutchVoice) {
    utterance.voice = dutchVoice;
    // Explicitly set the lang of the utterance to match the voice
    utterance.lang = dutchVoice.lang;
  } else {
    // Fallback info for debugging
    console.log("No specific Dutch voice found. Using default voice with nl-NL locale hint.");
  }

  window.speechSynthesis.speak(utterance);
};