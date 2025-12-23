export type BingoLetter = 'B' | 'I' | 'N' | 'G' | 'O';

export interface BingoBallData {
  number: number;
  letter: BingoLetter;
  color: string;
}

export interface GameState {
  history: number[];
  currentBall: number | null;
  isAnimating: boolean;
  generatedPhrase: string | null;
  isLoadingPhrase: boolean;
}