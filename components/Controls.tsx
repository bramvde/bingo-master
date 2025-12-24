import React from 'react';
import { Theme } from '../types';

interface ControlsProps {
  onDraw: () => void;
  onReset: () => void;
  onUndo: () => void;
  canDraw: boolean;
  canUndo: boolean;
  isAnimating: boolean;
  gameActive: boolean;
  theme: Theme;
}

export const Controls: React.FC<ControlsProps> = ({
  onDraw,
  onReset,
  onUndo,
  canDraw,
  canUndo,
  isAnimating,
  gameActive,
  theme
}) => {
  const isXmas = theme === 'christmas';

  return (
    <div className="flex flex-wrap gap-4 justify-center w-full z-10 pt-4"> {/* Added padding top for ornament clearance */}
      <div className={`p-2 rounded-2xl border flex gap-3 ${isXmas ? 'bg-red-950/50 border-red-800' : 'bg-gray-800/50 border-gray-700/50'}`}>
        <button
          onClick={onDraw}
          disabled={!canDraw || isAnimating}
          className={`
            px-8 py-3 rounded-xl font-bold text-lg uppercase tracking-wide transition-all shadow-lg transform active:scale-95
            ${!canDraw || isAnimating 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : isXmas 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-900/40 border border-red-500'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-900/20 hover:shadow-green-500/30'
            }
          `}
        >
          {isAnimating ? 'Rollen...' : isXmas ? '🎄 Trekken 🎄' : 'Bal Trekken'}
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo || isAnimating}
          className={`
            px-4 py-3 rounded-xl font-semibold text-white transition-all transform active:scale-95
            ${!canUndo || isAnimating
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : isXmas
                ? 'bg-green-800 hover:bg-green-700 border border-green-600'
                : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
            }
          `}
          title="Laatste bal ongedaan maken"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>

        <button
          onClick={onReset}
          disabled={!gameActive || isAnimating}
          className={`
            px-4 py-3 rounded-xl font-semibold text-white transition-all transform active:scale-95
            ${!gameActive || isAnimating
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-red-900/80 hover:bg-red-800 border border-red-800'}
          `}
          title="Spel resetten"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};