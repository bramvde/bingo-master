import React from 'react';
import { LETTERS, TOTAL_NUMBERS, getLetterForNumber } from '../constants';
import { Theme } from '../types';

interface BingoBoardProps {
  history: number[];
  theme: Theme;
}

export const BingoBoard: React.FC<BingoBoardProps> = ({ history, theme }) => {
  const isXmas = theme === 'christmas';

  // Group numbers by Letter
  const numbersByLetter: Record<string, number[]> = {
    B: [], I: [], N: [], G: [], O: []
  };

  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    const letter = getLetterForNumber(i);
    numbersByLetter[letter].push(i);
  }

  return (
    <div className={`
      h-full flex flex-col rounded-xl shadow-xl border overflow-hidden transition-colors duration-500
      ${isXmas ? 'bg-green-950 border-green-800' : 'bg-bingo-panel border-gray-700'}
    `}>
      <div className={`
        p-3 border-b text-center font-bold text-sm tracking-wider uppercase
        ${isXmas ? 'bg-red-900 border-red-800 text-red-100' : 'bg-gray-800 border-gray-700 text-gray-400'}
      `}>
        {isXmas ? '🎄 Bingo Kaart 🎄' : 'Spelbord'}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-5 gap-2 h-full">
          {LETTERS.map((letter) => (
            <div key={letter} className="flex flex-col gap-1.5 h-full">
              {/* Header Letter */}
              <div className={`
                aspect-square flex items-center justify-center rounded-lg font-black text-xl shadow-md mb-1 relative
                ${isXmas ? 'snow-top mt-1' : ''}
                ${letter === 'B' ? 'bg-blue-600 text-white' : ''}
                ${letter === 'I' ? 'bg-red-600 text-white' : ''}
                ${letter === 'N' ? 'bg-emerald-600 text-white' : ''}
                ${letter === 'G' ? 'bg-yellow-500 text-black' : ''}
                ${letter === 'O' ? 'bg-purple-600 text-white' : ''}
              `}>
                <span className="relative z-10">{letter}</span>
              </div>

              {/* Column Numbers */}
              <div className="flex flex-col gap-1.5 flex-1">
                {numbersByLetter[letter].map((num) => {
                  const isPlayed = history.includes(num);
                  const isLatest = history[history.length - 1] === num;
                  
                  // Styles for default vs Xmas
                  const playedStyle = isXmas 
                     ? (isLatest 
                          ? 'bg-yellow-400 text-red-900 ring-2 ring-white shadow-lg scale-105' 
                          : 'bg-red-700 text-red-100 opacity-100 border border-red-600')
                     : (isLatest
                          ? 'bg-white text-gray-900 ring-2 ring-yellow-400 shadow-lg scale-105'
                          : 'bg-gray-600 text-gray-100 opacity-100');

                  const unplayedStyle = isXmas
                     ? 'bg-green-900/40 text-green-600/60'
                     : 'bg-gray-800/40 text-gray-600 opacity-60';

                  return (
                    <div 
                      key={num} 
                      className={`
                        flex-1 min-h-[24px] flex items-center justify-center rounded text-xs font-bold transition-all duration-300 z-0
                        ${isPlayed ? `${playedStyle} z-10` : unplayedStyle}
                      `}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};