import React from 'react';
import { getLetterForNumber, getColorForLetter } from '../constants';

interface BallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLetter?: boolean;
}

export const Ball: React.FC<BallProps> = ({ number, size = 'md', className = '', showLetter = false }) => {
  const letter = getLetterForNumber(number);
  const colorClass = getColorForLetter(letter);

  let sizeClasses = '';
  let textClasses = '';
  let letterClasses = '';

  switch (size) {
    case 'sm':
      sizeClasses = 'w-8 h-8 border-2 shadow-sm';
      textClasses = 'text-sm font-bold';
      letterClasses = 'text-[0.6rem] mb-[-2px]';
      break;
    case 'md':
      sizeClasses = 'w-12 h-12 border-4 shadow-md';
      textClasses = 'text-xl font-bold';
      letterClasses = 'text-xs mb-[-4px]';
      break;
    case 'lg':
      sizeClasses = 'w-24 h-24 border-8 shadow-lg';
      textClasses = 'text-5xl font-black';
      letterClasses = 'text-sm mb-1 font-medium opacity-90';
      break;
    case 'xl':
      sizeClasses = 'w-48 h-48 border-[12px] shadow-2xl';
      textClasses = 'text-8xl font-black';
      letterClasses = 'text-2xl mb-2 font-medium opacity-90';
      break;
  }

  return (
    <div className={`rounded-full flex flex-col items-center justify-center select-none transform transition-transform ${colorClass} ${sizeClasses} ${className} relative overflow-hidden`}>
      {/* 3D Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/20 pointer-events-none rounded-full"></div>
      <div className="absolute top-[10%] left-[15%] w-[30%] h-[20%] bg-white/30 blur-[2px] rounded-full transform -rotate-45 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {showLetter && (
          <span className={letterClasses}>{letter}</span>
        )}
        <span className={textClasses}>{number}</span>
      </div>
    </div>
  );
};