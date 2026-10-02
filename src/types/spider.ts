export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13; // 1 = A, 11 = J, 12 = Q, 13 = K

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export type Difficulty = '1-suit' | '2-suits' | '4-suits';

export interface SpiderSnapshot {
  tableau: Card[][];
  stock: Card[][];
  completedRuns: number;
  moves: number;
  score: number;
}

export interface SpiderGameState {
  tableau: Card[][];       // 10 columns
  stock: Card[][];         // 5 deals of 10 cards
  completedRuns: number;   // 0 to 8
  moves: number;
  score: number;
  difficulty: Difficulty;
  history: SpiderSnapshot[];
  isWon: boolean;
}
