import React from 'react';
import { Ball } from './Ball';

interface LastBallsProps {
  history: number[];
  currentBall: number | null;
}

export const LastBalls: React.FC<LastBallsProps> = ({ history, currentBall }) => {
  // We want to show the balls BEFORE the current one.
  // If currentBall is history[last], we want history[last-1], history[last-2]...
  
  // Filter out the current ball if it's in the history to avoid duplication in display
  // (though functionally it is in history).
  const pastBalls = currentBall 
    ? history.slice(0, -1).reverse().slice(0, 5) 
    : history.slice().reverse().slice(0, 5);

  if (pastBalls.length === 0) return null;

  return (
    <div className="w-full max-w-2xl bg-gray-900/50 rounded-xl border border-gray-700/50 p-4 flex flex-col items-center">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Vorige Nummers</h3>
      <div className="flex gap-4 items-center justify-center">
        {pastBalls.map((num, index) => (
          <div key={`${num}-${index}`} className="opacity-90 hover:opacity-100 transition-opacity animate-pop" style={{ animationDelay: `${index * 0.1}s` }}>
             <Ball number={num} size="md" showLetter={false} />
          </div>
        ))}
        {/* Fillers to keep spacing if fewer than 5 */}
        {Array.from({ length: Math.max(0, 5 - pastBalls.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-12 h-12 rounded-full border-2 border-gray-800 bg-gray-900/30"></div>
        ))}
      </div>
    </div>
  );
};