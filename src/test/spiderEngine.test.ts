import { describe, it, expect } from 'vitest';
import {
  createDeck,
  createInitialGameState,
  dealFromStock,
  canMoveCards,
  getMovableSequence,
  moveCards,
  checkAndCollectRuns,
  undoMove
} from '../utils/spiderEngine';
import { Card } from '../types/spider';

describe('spiderEngine', () => {
  it('creates exactly 104 cards for 1-suit, 2-suit, and 4-suit modes', () => {
    const deck1 = createDeck('1-suit');
    expect(deck1.length).toBe(104);
    expect(deck1.every(c => c.suit === 'spades')).toBe(true);

    const deck2 = createDeck('2-suits');
    expect(deck2.length).toBe(104);
    expect(deck2.filter(c => c.suit === 'spades').length).toBe(52);
    expect(deck2.filter(c => c.suit === 'hearts').length).toBe(52);

    const deck4 = createDeck('4-suits');
    expect(deck4.length).toBe(104);
    expect(deck4.filter(c => c.suit === 'spades').length).toBe(26);
    expect(deck4.filter(c => c.suit === 'hearts').length).toBe(26);
    expect(deck4.filter(c => c.suit === 'diamonds').length).toBe(26);
    expect(deck4.filter(c => c.suit === 'clubs').length).toBe(26);
  });

  it('initializes game with exactly 54 cards on tableau and 50 in stock (total 104)', () => {
    const state = createInitialGameState('1-suit');
    expect(state.tableau.length).toBe(10);
    // Columns 0..3 have 6 cards, 4..9 have 5 cards
    expect(state.tableau[0].length).toBe(6);
    expect(state.tableau[1].length).toBe(6);
    expect(state.tableau[2].length).toBe(6);
    expect(state.tableau[3].length).toBe(6);
    expect(state.tableau[4].length).toBe(5);
    expect(state.tableau[9].length).toBe(5);

    const totalTableauCards = state.tableau.reduce((acc, col) => acc + col.length, 0);
    expect(totalTableauCards).toBe(54);

    expect(state.stock.length).toBe(5);
    expect(state.stock.every(batch => batch.length === 10)).toBe(true);
    const totalStockCards = state.stock.reduce((acc, batch) => acc + batch.length, 0);
    expect(totalStockCards).toBe(50);
    expect(totalTableauCards + totalStockCards).toBe(104);

    expect(state.score).toBe(500);
    expect(state.moves).toBe(0);
    expect(state.completedRuns).toBe(0);
    expect(state.isWon).toBe(false);

    // Top cards must be face up, prior cards face down
    state.tableau.forEach(col => {
      expect(col[col.length - 1].isFaceUp).toBe(true);
      for (let i = 0; i < col.length - 1; i++) {
        expect(col[i].isFaceUp).toBe(false);
      }
    });
  });

  it('deals 1 card to each column from stock', () => {
    const state = createInitialGameState('1-suit');
    const newState = dealFromStock(state);
    expect(newState.stock.length).toBe(4);
    expect(newState.tableau[0].length).toBe(7);
    expect(newState.tableau[9].length).toBe(6);
    expect(newState.moves).toBe(1);
    expect(newState.score).toBe(499);
  });

  it('validates moving descending sequences to target columns', () => {
    const targetCol: Card[] = [{ id: '1', suit: 'spades', rank: 8, isFaceUp: true }];
    const movingCards: Card[] = [
      { id: '2', suit: 'spades', rank: 7, isFaceUp: true },
      { id: '3', suit: 'spades', rank: 6, isFaceUp: true }
    ];
    expect(canMoveCards(movingCards, targetCol)).toBe(true);

    const invalidTarget: Card[] = [{ id: '4', suit: 'spades', rank: 9, isFaceUp: true }];
    expect(canMoveCards(movingCards, invalidTarget)).toBe(false); // 7 cannot go on 9

    const emptyCol: Card[] = [];
    expect(canMoveCards(movingCards, emptyCol)).toBe(true); // empty accepts anything
  });

  it('detects movable descending same-suit sequences', () => {
    const col: Card[] = [
      { id: '1', suit: 'spades', rank: 9, isFaceUp: false },
      { id: '2', suit: 'spades', rank: 8, isFaceUp: true },
      { id: '3', suit: 'spades', rank: 7, isFaceUp: true },
      { id: '4', suit: 'spades', rank: 6, isFaceUp: true }
    ];
    expect(getMovableSequence(col, 0)).toBeNull(); // face down card
    const seq = getMovableSequence(col, 1);
    expect(seq).toHaveLength(3);
    expect(seq?.[0].rank).toBe(8);

    // Sequence with different suit or non-descending
    const mixedCol: Card[] = [
      { id: '1', suit: 'spades', rank: 8, isFaceUp: true },
      { id: '2', suit: 'hearts', rank: 7, isFaceUp: true }
    ];
    expect(getMovableSequence(mixedCol, 0)).toBeNull();
  });

  it('moves cards between columns and auto-flips exposed card', () => {
    const state = createInitialGameState('1-suit');
    // Prepare column 0 and column 1
    state.tableau[0] = [
      { id: 'c-down', suit: 'spades', rank: 10, isFaceUp: false },
      { id: 'c-7', suit: 'spades', rank: 7, isFaceUp: true }
    ];
    state.tableau[1] = [
      { id: 'c-8', suit: 'spades', rank: 8, isFaceUp: true }
    ];

    const nextState = moveCards(state, 0, 1, 1);
    expect(nextState.tableau[1].length).toBe(2);
    expect(nextState.tableau[1][1].rank).toBe(7);
    expect(nextState.tableau[0].length).toBe(1);
    // Exposed card should now be face up
    expect(nextState.tableau[0][0].isFaceUp).toBe(true);
    expect(nextState.moves).toBe(1);
    expect(nextState.score).toBe(499);
  });

  it('automatically detects and collects a full K-to-A run of the same suit and triggers win at 8 runs', () => {
    const fullRun: Card[] = [];
    for (let r = 13; r >= 1; r--) {
      fullRun.push({ id: `c-${r}`, suit: 'spades', rank: r as any, isFaceUp: true });
    }
    const state = createInitialGameState('1-suit');
    state.tableau[0] = [
      { id: 'base', suit: 'spades', rank: 10, isFaceUp: false },
      ...fullRun
    ];

    const { state: updatedState, collected } = checkAndCollectRuns(state);
    expect(collected).toBe(1);
    expect(updatedState.completedRuns).toBe(1);
    expect(updatedState.tableau[0].length).toBe(1);
    expect(updatedState.tableau[0][0].isFaceUp).toBe(true); // exposed base flipped
    expect(updatedState.score).toBe(600); // 500 + 100
    expect(updatedState.isWon).toBe(false);

    // Test run triggering isWon when 8th run collected
    const stateNearWin = { ...state, completedRuns: 7 };
    stateNearWin.tableau[0] = [...fullRun];
    const { state: finalWinState } = checkAndCollectRuns(stateNearWin);
    expect(finalWinState.completedRuns).toBe(8);
    expect(finalWinState.isWon).toBe(true);
  });

  it('supports undoing previous moves', () => {
    const state = createInitialGameState('1-suit');
    const dealtState = dealFromStock(state);
    expect(dealtState.moves).toBe(1);
    const reverted = undoMove(dealtState);
    expect(reverted.stock.length).toBe(5);
    expect(reverted.moves).toBe(0);
    expect(reverted.tableau[0].length).toBe(6);
  });
});
