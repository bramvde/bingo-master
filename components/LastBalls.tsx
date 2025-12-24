import React from 'react';
import { Ball } from './Ball';
import { Theme } from '../types';

interface LastBallsProps {
  history: number[];
  currentBall: number | null;
  theme: Theme;
}

export const LastBalls: React.FC<LastBallsProps> = ({ history, currentBall, theme }) => {
  const isXmas = theme === 'christmas';
  
  // We want to show the balls BEFORE the current one.
  // If currentBall is history[last], we want history[last-1], history[last-2]...
  
  // Filter out the current ball if it's in the history to avoid duplication in display
  // (though functionally it is in history).
  const pastBalls = currentBall 
    ? history.slice(0, -1).reverse().slice(0, 5) 
    : history.slice().reverse().slice(0, 5);

  if (pastBalls.length === 0) return null;

  return (
    <div className={`
      w-full max-w-2xl rounded-xl border p-4 flex flex-col items-center pt-6
      ${isXmas ? 'bg-green-950/50 border-green-800' : 'bg-gray-900/50 border-gray-700/50'}
    `}>
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isXmas ? 'text-red-200' : 'text-gray-400'}`}>Vorige Nummers</h3>
      <div className="flex gap-4 items-center justify-center">
        {pastBalls.map((num, index) => (
          <div key={`${num}-${index}`} className="opacity-90 hover:opacity-100 transition-opacity animate-pop" style={{ animationDelay: `${index * 0.1}s` }}>
             <Ball number={num} size="md" showLetter={false} theme={theme} />
          </div>
        ))}
        {/* Fillers to keep spacing if fewer than 5 */}
        {Array.from({ length: Math.max(0, 5 - pastBalls.length) }).map((_, i) => (
          <div key={`empty-${i}`} className={`w-12 h-12 rounded-full border-2 ${isXmas ? 'border-green-900 bg-green-950/30' : 'border-gray-800 bg-gray-900/30'}`}></div>
        ))}
      </div>
    </div>
  );
};