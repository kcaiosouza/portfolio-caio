import { Card, Suit, Rank, Difficulty, SpiderGameState, SpiderSnapshot } from '../types/spider';

export function createDeck(difficulty: Difficulty): Card[] {
  const cards: Card[] = [];
  let suits: Suit[] = [];

  if (difficulty === '1-suit') {
    suits = ['spades', 'spades', 'spades', 'spades', 'spades', 'spades', 'spades', 'spades'];
  } else if (difficulty === '2-suits') {
    suits = ['spades', 'spades', 'spades', 'spades', 'hearts', 'hearts', 'hearts', 'hearts'];
  } else {
    suits = ['spades', 'spades', 'hearts', 'hearts', 'diamonds', 'diamonds', 'clubs', 'clubs'];
  }

  let counter = 1;
  for (const suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({
        id: `card-${suit}-${rank}-${counter++}`,
        suit,
        rank: rank as Rank,
        isFaceUp: false
      });
    }
  }

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function createInitialGameState(difficulty: Difficulty = '1-suit'): SpiderGameState {
  const deck = createDeck(difficulty);
  const tableau: Card[][] = Array.from({ length: 10 }, () => []);

  // Columns 0..3 get 6 cards each (24 cards)
  // Columns 4..9 get 5 cards each (30 cards)
  let cardIndex = 0;
  for (let col = 0; col < 10; col++) {
    const count = col < 4 ? 6 : 5;
    for (let i = 0; i < count; i++) {
      const card = { ...deck[cardIndex++] };
      card.isFaceUp = i === count - 1; // Top card is face up
      tableau[col].push(card);
    }
  }

  // Remaining 50 cards go into 5 batches of 10 cards each
  const stock: Card[][] = [];
  for (let batch = 0; batch < 5; batch++) {
    const batchCards: Card[] = [];
    for (let i = 0; i < 10; i++) {
      batchCards.push({ ...deck[cardIndex++], isFaceUp: false });
    }
    stock.push(batchCards);
  }

  return {
    tableau,
    stock,
    completedRuns: 0,
    moves: 0,
    score: 500,
    difficulty,
    history: [],
    isWon: false
  };
}

export function snapshotState(state: SpiderGameState): SpiderSnapshot {
  return {
    tableau: state.tableau.map(col => col.map(c => ({ ...c }))),
    stock: state.stock.map(batch => batch.map(c => ({ ...c }))),
    completedRuns: state.completedRuns,
    moves: state.moves,
    score: state.score
  };
}

export function canMoveCards(cardsToMove: Card[], targetColumn: Card[]): boolean {
  if (cardsToMove.length === 0) return false;
  if (targetColumn.length === 0) return true; // Empty column accepts anything

  const targetCard = targetColumn[targetColumn.length - 1];
  return targetCard.rank === cardsToMove[0].rank + 1;
}

export function getMovableSequence(column: Card[], fromIndex: number): Card[] | null {
  if (fromIndex < 0 || fromIndex >= column.length) return null;
  const startCard = column[fromIndex];
  if (!startCard.isFaceUp) return null;

  // Validate that from fromIndex to column end, cards form a descending same-suit sequence
  for (let i = fromIndex; i < column.length - 1; i++) {
    const current = column[i];
    const next = column[i + 1];
    if (!next.isFaceUp || current.suit !== next.suit || current.rank !== next.rank + 1) {
      return null;
    }
  }

  return column.slice(fromIndex);
}

export function moveCards(
  state: SpiderGameState,
  fromColIdx: number,
  cardIndex: number,
  toColIdx: number
): SpiderGameState {
  if (fromColIdx === toColIdx) return state;
  if (fromColIdx < 0 || fromColIdx >= 10 || toColIdx < 0 || toColIdx >= 10) return state;

  const sourceCol = state.tableau[fromColIdx];
  if (!sourceCol) return state;

  const cardsToMove = getMovableSequence(sourceCol, cardIndex);
  if (!cardsToMove) return state;

  const targetCol = state.tableau[toColIdx];
  if (!canMoveCards(cardsToMove, targetCol)) return state;

  const historySnapshot = snapshotState(state);

  const newTableau = state.tableau.map(col => col.map(c => ({ ...c })));
  const moved = newTableau[fromColIdx].splice(cardIndex, cardsToMove.length);
  newTableau[toColIdx].push(...moved);

  // Auto-flip exposed top card in source column
  const newSourceCol = newTableau[fromColIdx];
  if (newSourceCol.length > 0 && !newSourceCol[newSourceCol.length - 1].isFaceUp) {
    newSourceCol[newSourceCol.length - 1].isFaceUp = true;
  }

  const newState: SpiderGameState = {
    ...state,
    tableau: newTableau,
    moves: state.moves + 1,
    score: Math.max(0, state.score - 1),
    history: [...state.history, historySnapshot]
  };

  const { state: finalState } = checkAndCollectRuns(newState);
  return finalState;
}

export function checkAndCollectRuns(state: SpiderGameState): { state: SpiderGameState; collected: number } {
  let collected = 0;
  const newTableau = state.tableau.map(col => col.map(c => ({ ...c })));

  for (let col = 0; col < 10; col++) {
    let checkedColumn = true;
    while (checkedColumn) {
      checkedColumn = false;
      const column = newTableau[col];
      if (column.length < 13) break;

      // Check last 13 cards for King (13) down to Ace (1) of the same suit
      let isRun = true;
      const suit = column[column.length - 1].suit;
      for (let i = 0; i < 13; i++) {
        const card = column[column.length - 1 - i];
        if (!card.isFaceUp || card.suit !== suit || card.rank !== i + 1) {
          isRun = false;
          break;
        }
      }

      if (isRun) {
        column.splice(column.length - 13, 13);
        if (column.length > 0 && !column[column.length - 1].isFaceUp) {
          column[column.length - 1].isFaceUp = true;
        }
        collected++;
        checkedColumn = true;
      }
    }
  }

  const newCompletedRuns = state.completedRuns + collected;
  const isWon = newCompletedRuns >= 8;

  return {
    state: {
      ...state,
      tableau: newTableau,
      completedRuns: newCompletedRuns,
      score: state.score + collected * 100,
      isWon
    },
    collected
  };
}

export function dealFromStock(state: SpiderGameState): SpiderGameState {
  if (state.stock.length === 0) return state;

  const historySnapshot = snapshotState(state);
  const newStock = state.stock.map(b => b.map(c => ({ ...c })));
  const batch = newStock.pop()!;

  const newTableau = state.tableau.map(col => col.map(c => ({ ...c })));
  for (let col = 0; col < 10; col++) {
    const card = { ...batch[col], isFaceUp: true };
    newTableau[col].push(card);
  }

  const newState: SpiderGameState = {
    ...state,
    tableau: newTableau,
    stock: newStock,
    moves: state.moves + 1,
    score: Math.max(0, state.score - 1),
    history: [...state.history, historySnapshot]
  };

  const { state: finalState } = checkAndCollectRuns(newState);
  return finalState;
}

export function undoMove(state: SpiderGameState): SpiderGameState {
  if (state.history.length === 0) return state;

  const previous = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  return {
    ...state,
    tableau: previous.tableau.map(col => col.map(c => ({ ...c }))),
    stock: previous.stock.map(batch => batch.map(c => ({ ...c }))),
    completedRuns: previous.completedRuns,
    moves: previous.moves,
    score: previous.score,
    history: newHistory,
    isWon: false
  };
}
