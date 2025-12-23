import React, { useEffect, useState } from 'react';
import { Ball } from './Ball';
import { TOTAL_NUMBERS } from '../constants';

interface BingoMachineProps {
  currentBall: number | null;
  isAnimating: boolean;
  generatedPhrase: string | null;
}

export const BingoMachine: React.FC<BingoMachineProps> = ({ 
  currentBall, 
  isAnimating, 
  generatedPhrase
}) => {
  const [shuffleNumber, setShuffleNumber] = useState<number>(1);

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
    <div className="flex flex-col items-center justify-center p-6 bg-bingo-panel rounded-2xl shadow-2xl border border-gray-700 w-full max-w-lg relative overflow-hidden min-h-[300px]">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)] animate-spin-slow"></div>
      </div>

      <div className="z-10 flex flex-col items-center justify-center w-full">
        {isAnimating ? (
          <div className="flex flex-col items-center relative">
            {/* Spinning Cage Visual Effect */}
             <div className="w-48 h-48 rounded-full border-4 border-gray-600/50 bg-gray-800/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow pointer-events-none"></div>
             
             {/* Shuffling Ball with Rumble Effect */}
             <div className="animate-rumble filter blur-[0.5px]">
               <Ball number={shuffleNumber} size="xl" showLetter={true} />
             </div>
             
             <p className="mt-6 text-xl font-bold text-gray-300 tracking-wider animate-pulse uppercase">Husselen...</p>
          </div>
        ) : currentBall ? (
          <div className="flex flex-col items-center w-full">
            {/* Zoom In animation for the final reveal */}
            <div className="animate-zoom-in">
               <Ball number={currentBall} size="xl" showLetter={true} />
            </div>
            
            <div className="mt-6 h-16 w-full flex items-center justify-center text-center px-4">
              {generatedPhrase && (
                <p className="text-2xl font-serif italic text-yellow-400 drop-shadow-md animate-slide-up">
                  "{generatedPhrase}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center opacity-40">
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-600 flex items-center justify-center mb-4 mx-auto animate-pulse-fast">
              <span className="text-4xl text-gray-600">?</span>
            </div>
            <p className="text-lg font-medium text-gray-400">Klaar voor de start</p>
          </div>
        )}
      </div>
    </div>
  );
};