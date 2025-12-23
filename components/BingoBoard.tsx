import React from 'react';
import { LETTERS, TOTAL_NUMBERS, getLetterForNumber } from '../constants';

interface BingoBoardProps {
  history: number[];
}

export const BingoBoard: React.FC<BingoBoardProps> = ({ history }) => {
  // Group numbers by Letter
  const numbersByLetter: Record<string, number[]> = {
    B: [], I: [], N: [], G: [], O: []
  };

  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    const letter = getLetterForNumber(i);
    numbersByLetter[letter].push(i);
  }

  return (
    <div className="bg-bingo-panel h-full flex flex-col rounded-xl shadow-xl border border-gray-700 overflow-hidden">
      <div className="p-3 bg-gray-800 border-b border-gray-700 text-center font-bold text-gray-400 text-sm tracking-wider uppercase">
        Spelbord
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-5 gap-2 h-full">
          {LETTERS.map((letter) => (
            <div key={letter} className="flex flex-col gap-1.5 h-full">
              {/* Header Letter */}
              <div className={`
                aspect-square flex items-center justify-center rounded-lg font-black text-xl shadow-md mb-1
                ${letter === 'B' ? 'bg-blue-600 text-white' : ''}
                ${letter === 'I' ? 'bg-red-600 text-white' : ''}
                ${letter === 'N' ? 'bg-emerald-600 text-white' : ''}
                ${letter === 'G' ? 'bg-yellow-500 text-black' : ''}
                ${letter === 'O' ? 'bg-purple-600 text-white' : ''}
              `}>
                {letter}
              </div>

              {/* Column Numbers */}
              <div className="flex flex-col gap-1.5 flex-1">
                {numbersByLetter[letter].map((num) => {
                  const isPlayed = history.includes(num);
                  const isLatest = history[history.length - 1] === num;
                  
                  return (
                    <div 
                      key={num} 
                      className={`
                        flex-1 min-h-[24px] flex items-center justify-center rounded text-xs font-bold transition-all duration-300
                        ${isPlayed 
                          ? (isLatest 
                              ? 'bg-white text-gray-900 ring-2 ring-yellow-400 shadow-lg z-10 scale-105' 
                              : 'bg-gray-600 text-gray-100 opacity-100')
                          : 'bg-gray-800/40 text-gray-600 opacity-60'}
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