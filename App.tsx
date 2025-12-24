import React, { useState, useEffect, useCallback } from 'react';
import { TOTAL_NUMBERS, getLetterForNumber } from './constants';
import { BINGO_PHRASES } from './constants/phrases';
import { BingoBoard } from './components/BingoBoard';
import { BingoMachine } from './components/BingoMachine';
import { Controls } from './components/Controls';
import { LastBalls } from './components/LastBalls';
import { ChristmasScene } from './components/ChristmasScene';
import { Fireworks } from './components/Fireworks';
import { initAudio, playPop, playTick, playJingle, speakText, startChristmasAmbience, stopChristmasAmbience } from './utils/sound';
import { generateBingoCardsPdf } from './utils/cardGenerator';
import { Theme } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [generatedPhrase, setGeneratedPhrase] = useState<string | null>(null);
  const [fireworkTrigger, setFireworkTrigger] = useState(0);
  
  // Settings
  const [showPhrases, setShowPhrases] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [theme, setTheme] = useState<Theme>('default');

  const isXmas = theme === 'christmas';

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bingoState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.history || []);
        setCurrentBall(parsed.currentBall || null);
        setGeneratedPhrase(parsed.generatedPhrase || null);
        if (parsed.theme) setTheme(parsed.theme);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('bingoState', JSON.stringify({
      history,
      currentBall,
      generatedPhrase,
      theme
    }));
  }, [history, currentBall, generatedPhrase, theme]);

  // Manage Ambient Sound
  useEffect(() => {
    if (isXmas && soundEnabled) {
      // Audio Context must be resumed by interaction first, but we attempt to start it.
      startChristmasAmbience();
    } else {
      stopChristmasAmbience();
    }
    return () => stopChristmasAmbience();
  }, [isXmas, soundEnabled]);

  const handleDraw = useCallback(() => {
    if (history.length >= TOTAL_NUMBERS) return;

    initAudio();
    setIsAnimating(true);
    setGeneratedPhrase(null);

    // Calculate available numbers
    const available = [];
    for (let i = 1; i <= TOTAL_NUMBERS; i++) {
      if (!history.includes(i)) available.push(i);
    }

    const nextNum = available[Math.floor(Math.random() * available.length)];

    // Sound Loop during animation
    const tickInterval = setInterval(() => {
      if (soundEnabled) {
        if (isXmas) {
          playJingle();
        } else {
          playTick();
        }
      }
    }, 120);

    // Trigger Fireworks Launch (1.5s into animation, so they fly for 1s and explode at 2.5s)
    setTimeout(() => {
      setFireworkTrigger(t => t + 1);
    }, 1500);

    // Final Reveal (2.5s)
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsAnimating(false);
      setCurrentBall(nextNum);
      setHistory(prev => [...prev, nextNum]);

      const phrase = BINGO_PHRASES[nextNum] || `Nummer ${nextNum}`;
      
      if (showPhrases) {
        setGeneratedPhrase(phrase);
      }

      // Final reveal effects
      if (soundEnabled) playPop();

      if (voiceEnabled) {
        const letter = getLetterForNumber(nextNum);
        const textToSpeak = showPhrases 
          ? `${letter} ${nextNum}. ${phrase}`
          : `${letter} ${nextNum}`;
        speakText(textToSpeak);
      }

    }, 2500); 

  }, [history, showPhrases, soundEnabled, voiceEnabled, isXmas]);

  const handleReset = useCallback(() => {
    if (window.confirm("Weet je zeker dat je een nieuw spel wilt starten?")) {
      setHistory([]);
      setCurrentBall(null);
      setGeneratedPhrase(null);
      window.speechSynthesis.cancel();
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    
    const prevBall = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
    setCurrentBall(prevBall);
    
    if (prevBall && showPhrases) {
       setGeneratedPhrase(BINGO_PHRASES[prevBall] || `Nummer ${prevBall}`);
    } else {
       setGeneratedPhrase(null);
    }
  }, [history, showPhrases]);

  const handlePrintCards = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); 
      generateBingoCardsPdf();
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("Er ging iets mis bij het maken van de kaarten.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, []);

  const toggleTheme = () => {
    initAudio(); 
    setTheme(prev => prev === 'default' ? 'christmas' : 'default');
  };

  const Toggle = ({ label, checked, onChange, icon }: { label: string, checked: boolean, onChange: (v: boolean) => void, icon: React.ReactNode }) => (
    <label className="flex items-center cursor-pointer gap-2 select-none group" title={label}>
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={checked}
          onChange={(e) => {
            initAudio(); 
            onChange(e.target.checked);
          }}
        />
        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
      </div>
      <div className="text-gray-400 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-gray-300 font-medium hidden lg:inline text-sm">{label}</span>
    </label>
  );

  return (
    <div className={`h-screen w-screen text-white flex flex-col overflow-hidden transition-all duration-700 relative ${isXmas ? 'bg-slate-900' : 'bg-bingo-dark'}`}>
      
      {/* Dynamic Background Layer */}
      <ChristmasScene active={isXmas} />
      
      {/* Fireworks Layer (always rendered, transparent when inactive) */}
      <Fireworks trigger={fireworkTrigger} theme={theme} />

      {/* Compact Header */}
      <header className={`h-14 min-h-[56px] px-4 border-b flex items-center justify-between shrink-0 z-20 backdrop-blur-sm transition-colors duration-500 ${isXmas ? 'bg-red-950/60 border-red-900' : 'bg-gray-900/50 border-gray-800'}`}>
        <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shrink-0 ${isXmas ? 'bg-gradient-to-br from-red-500 to-green-600 border border-yellow-400' : 'bg-gradient-to-br from-pink-500 to-purple-600'}`}>
             {isXmas ? '🎄' : 'B'}
           </div>
           <h1 className={`text-xl font-bold bg-clip-text text-transparent hidden sm:block ${isXmas ? 'bg-gradient-to-r from-red-400 to-green-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`}>
             {isXmas ? 'Kerst Bingo' : 'Bingo Master'}
           </h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
          
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${isXmas ? 'bg-white/10 hover:bg-white/20 text-yellow-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'}`}
            title="Wissel Thema"
          >
             {isXmas ? '❄️' : '🎨'}
          </button>

          <button 
            onClick={handlePrintCards}
            disabled={isGeneratingPdf}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border
              transition-all text-gray-300 hover:text-white
              ${isGeneratingPdf ? 'opacity-50 cursor-wait' : isXmas ? 'border-red-700 hover:bg-red-900' : 'border-gray-700 hover:bg-gray-800 hover:border-gray-500'}
            `}
            title="Genereer en print 4 Bingo kaarten"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.875 1.5a.75.75 0 01.75.75v2.25h6.75a.75.75 0 01.75.75v3h3.75a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-1.5v2.25a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-2.25H1.5a.75.75 0 01-.75-.75v-6.75a.75.75 0 01.75-.75h3.75v-3a.75.75 0 01.75-.75h.75zM6 6v1.5h12V6H6zm11.25 6.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15.75 16.5h-7.5v4.5h7.5v-4.5z" clipRule="evenodd" />
            </svg>
            <span className="hidden xs:inline">{isGeneratingPdf ? 'Bezig...' : 'Print Kaarten'}</span>
          </button>

          <div className={`px-3 py-1 rounded-full border hidden md:block ${isXmas ? 'bg-red-900/30 border-red-800' : 'bg-gray-800 border-gray-700'}`}>
            <span className="text-gray-400 mr-2">Ballen:</span>
            <span className="font-bold text-white">{history.length} / {TOTAL_NUMBERS}</span>
          </div>

          <div className={`flex items-center gap-3 sm:gap-4 border-l pl-3 sm:pl-4 ${isXmas ? 'border-red-900' : 'border-gray-700'}`}>
            
            <Toggle 
              label="Zinnen" 
              checked={showPhrases} 
              onChange={setShowPhrases}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                </svg>
              }
            />

            <Toggle 
              label="Geluid" 
              checked={soundEnabled} 
              onChange={setSoundEnabled}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                </svg>
              }
            />

            <Toggle 
              label="Stem" 
              checked={voiceEnabled} 
              onChange={setVoiceEnabled}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
              }
            />
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 flex overflow-hidden z-10">
        
        {/* LEFT: Game Stage (Flexible width) */}
        <div className="flex-[2] flex flex-col items-center justify-between p-4 gap-4 relative">
          
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-6">
            <BingoMachine 
              currentBall={currentBall} 
              isAnimating={isAnimating}
              generatedPhrase={generatedPhrase}
              theme={theme}
            />
            
            <Controls 
              onDraw={handleDraw}
              onReset={handleReset}
              onUndo={handleUndo}
              canDraw={history.length < TOTAL_NUMBERS}
              canUndo={history.length > 0}
              isAnimating={isAnimating}
              gameActive={history.length > 0}
              theme={theme}
            />
          </div>

          {/* Last 5 Balls at the bottom */}
          <div className="w-full flex justify-center pb-2 shrink-0 h-32">
            <LastBalls history={history} currentBall={currentBall} theme={theme} />
          </div>
        </div>

        {/* RIGHT: Tracker Sidebar (Fixed width on desktop, flex on smaller) */}
        <div className={`w-64 sm:w-80 md:w-96 border-l h-full p-2 shrink-0 z-10 shadow-2xl transition-colors duration-500 backdrop-blur-sm ${isXmas ? 'bg-green-950/80 border-green-900' : 'bg-gray-900 border-gray-800'}`}>
          <BingoBoard history={history} theme={theme} />
        </div>
        
      </main>
    </div>
  );
};

export default App;