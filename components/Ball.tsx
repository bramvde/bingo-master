import React from 'react';
import { getLetterForNumber, getColorForLetter } from '../constants';
import { Theme } from '../types';

interface BallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLetter?: boolean;
  theme?: Theme;
}

export const Ball: React.FC<BallProps> = ({ 
  number, 
  size = 'md', 
  className = '', 
  showLetter = false,
  theme = 'default' 
}) => {
  const letter = getLetterForNumber(number);
  const colorClass = getColorForLetter(letter);
  const isXmas = theme === 'christmas';

  let sizeClasses = '';
  let textClasses = '';
  let letterClasses = '';
  let capSize = '';
  let capTop = '';

  switch (size) {
    case 'sm':
      sizeClasses = 'w-8 h-8 border-2 shadow-sm';
      textClasses = 'text-sm font-bold';
      letterClasses = 'text-[0.6rem] mb-[-2px]';
      capSize = 'w-2 h-1.5'; 
      capTop = '-top-1';
      break;
    case 'md':
      sizeClasses = 'w-12 h-12 border-4 shadow-md';
      textClasses = 'text-xl font-bold';
      letterClasses = 'text-xs mb-[-4px]';
      capSize = 'w-3 h-2'; 
      capTop = '-top-1.5';
      break;
    case 'lg':
      sizeClasses = 'w-24 h-24 border-8 shadow-lg';
      textClasses = 'text-5xl font-black';
      letterClasses = 'text-sm mb-1 font-medium opacity-90';
      capSize = 'w-5 h-3.5'; 
      capTop = '-top-2.5';
      break;
    case 'xl':
      sizeClasses = 'w-48 h-48 border-[12px] shadow-2xl';
      textClasses = 'text-8xl font-black';
      letterClasses = 'text-2xl mb-2 font-medium opacity-90';
      capSize = 'w-10 h-6'; 
      capTop = '-top-5';
      break;
  }

  return (
    <div className={`relative flex justify-center group ${className}`}>
      {/* Christmas Ornament Cap */}
      {isXmas && (
        <div className={`absolute ${capTop} z-0 flex flex-col items-center`}>
          {/* The Loop */}
          <div className={`rounded-full border-2 border-yellow-500 w-[50%] h-full absolute -top-1/2 left-[25%]`}></div>
          {/* The Cap */}
          <div className={`${capSize} bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-sm shadow-sm relative z-10 border border-yellow-700`}></div>
        </div>
      )}

      {/* The Ball Itself */}
      <div className={`
        rounded-full flex flex-col items-center justify-center select-none transform transition-transform 
        ${colorClass} ${sizeClasses} relative overflow-hidden z-10
        ${isXmas ? 'ring-2 ring-inset ring-white/20' : ''}
      `}>
        {/* 3D Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/20 pointer-events-none rounded-full"></div>
        <div className="absolute top-[10%] left-[15%] w-[30%] h-[20%] bg-white/30 blur-[2px] rounded-full transform -rotate-45 pointer-events-none"></div>
        
        {/* Extra Christmas Sparkle */}
        {isXmas && (
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none"></div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center drop-shadow-md">
          {showLetter && (
            <span className={letterClasses}>{letter}</span>
          )}
          <span className={textClasses}>{number}</span>
        </div>
      </div>
    </div>
  );
};