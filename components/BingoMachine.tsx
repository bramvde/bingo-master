import React, { useEffect, useState } from 'react';
import { Ball } from './Ball';
import { TOTAL_NUMBERS } from '../constants';
import { Theme } from '../types';

interface BingoMachineProps {
  currentBall: number | null;
  isAnimating: boolean;
  generatedPhrase: string | null;
  theme: Theme;
}

export const BingoMachine: React.FC<BingoMachineProps> = ({ 
  currentBall, 
  isAnimating, 
  generatedPhrase,
  theme
}) => {
  const [shuffleNumber, setShuffleNumber] = useState<number>(1);
  const isXmas = theme === 'christmas';

  // Effect to drive the shuffling animation when isAnimating is true
  useEffect(() => {
    let interval: number;
    if (isAnimating) {
      interval = window.setInterval(() => {
        // Pick a random number between 1 and TOTAL_NUMBERS
        setShuffleNumber(Math.floor(Math.random() * TOTAL_NUMBERS) + 1);
      }, 50); // Faster cycle speed (50ms) for smoother blur effect
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className={`
      flex flex-col items-center justify-center p-6 rounded-2xl shadow-2xl border w-full max-w-lg relative overflow-hidden min-h-[300px] transition-colors duration-500
      ${isXmas 
        ? 'bg-gradient-to-br from-green-900 via-green-950 to-gray-900 border-green-800 snow-top mt-2' 
        : 'bg-bingo-panel border-gray-700'}
    `}>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)] animate-spin-slow"></div>
      </div>

      {/* Falling Snow Effect for Xmas */}
      {isXmas && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="absolute text-white animate-snow-fall" style={{ 
               left: `${15 + i * 15}%`, 
               fontSize: `${10 + Math.random() * 10}px`,
               animationDuration: `${2 + Math.random() * 2}s`,
               animationDelay: `${Math.random() * 2}s`
             }}>❄</div>
          ))}
        </div>
      )}

      <div className="z-10 flex flex-col items-center justify-center w-full">
        {isAnimating ? (
          <div className="flex flex-col items-center relative">
            {/* Spinning Cage Visual Effect */}
             <div className={`
               w-48 h-48 rounded-full border-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow pointer-events-none
               ${isXmas ? 'border-yellow-500/30 bg-red-900/10' : 'border-gray-600/50 bg-gray-800/50'}
             `}></div>
             
             {/* Shuffling Ball with Rumble Effect */}
             <div className="animate-rumble filter blur-[0.5px]">
               <Ball number={shuffleNumber} size="xl" showLetter={true} theme={theme} />
             </div>
             
             <p className={`mt-6 text-xl font-bold tracking-wider animate-pulse uppercase ${isXmas ? 'text-red-300' : 'text-gray-300'}`}>
               Husselen...
             </p>
          </div>
        ) : currentBall ? (
          <div className="flex flex-col items-center w-full">
            {/* Zoom In animation for the final reveal */}
            <div className="animate-zoom-in pt-4"> {/* Added padding for ornament top */}
               <Ball number={currentBall} size="xl" showLetter={true} theme={theme} />
            </div>
            
            <div className="mt-6 h-16 w-full flex items-center justify-center text-center px-4">
              {generatedPhrase && (
                <p className={`text-2xl font-serif italic drop-shadow-md animate-slide-up ${isXmas ? 'text-yellow-300' : 'text-yellow-400'}`}>
                  "{generatedPhrase}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center opacity-40">
            <div className={`
              w-40 h-40 rounded-full border-4 border-dashed flex items-center justify-center mb-4 mx-auto animate-pulse-fast
              ${isXmas ? 'border-green-600 text-green-600' : 'border-gray-600 text-gray-600'}
            `}>
              <span className="text-4xl">?</span>
            </div>
            <p className="text-lg font-medium text-gray-400">Klaar voor de start</p>
          </div>
        )}
      </div>
    </div>
  );
};