import { BingoBallData, BingoLetter } from './types';

export const TOTAL_NUMBERS = 75;

export const LETTERS: BingoLetter[] = ['B', 'I', 'N', 'G', 'O'];

export const getLetterForNumber = (num: number): BingoLetter => {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
};

export const getColorForLetter = (letter: BingoLetter): string => {
  switch (letter) {
    case 'B': return 'bg-blue-500 border-blue-600 text-white';
    case 'I': return 'bg-red-500 border-red-600 text-white';
    case 'N': return 'bg-emerald-500 border-emerald-600 text-white';
    case 'G': return 'bg-yellow-400 border-yellow-500 text-black'; // Yellow usually needs black text
    case 'O': return 'bg-purple-500 border-purple-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const getColorHexForLetter = (letter: BingoLetter): string => {
  switch (letter) {
    case 'B': return '#3b82f6';
    case 'I': return '#ef4444';
    case 'N': return '#10b981';
    case 'G': return '#facc15';
    case 'O': return '#a855f7';
    default: return '#6b7280';
  }
};

export const getAllBalls = (): BingoBallData[] => {
  return Array.from({ length: TOTAL_NUMBERS }, (_, i) => {
    const num = i + 1;
    const letter = getLetterForNumber(num);
    const color = getColorForLetter(letter);
    return { number: num, letter, color };
  });
};