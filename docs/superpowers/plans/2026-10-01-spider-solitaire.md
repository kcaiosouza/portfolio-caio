# Windows XP Retro Spider Solitaire Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a fully functional, authentic Windows XP Spider Solitaire (Paciência Spider) with 104-card rules, 1/2/4 suit modes, drag-and-drop & double-click movements, complete-run collection, and the iconic 60 FPS HTML5 Canvas card-waterfall victory animation.

**Architecture:** A pure, testable game engine (`spiderEngine.ts`) managing the 104-card deck, tableau, stock, move validation, auto-reveal, and undo history; paired with a modular React visual hierarchy (`SpiderSolitaireApp.tsx`, `SpiderTableau.tsx`, `PlayingCard.tsx`, `SpiderStock.tsx`, `VictoryCanvas.tsx`) styled with classic green felt (`#007A33`) and integrated into the OS shell via Start Menu, Desktop, Task Manager, and CMD.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React (Spade), HTML5 Canvas, Vitest, React Testing Library.

## Global Constraints

- **Exact Card Counts**: Exactly 104 cards (2 decks of 52 cards). Initial deal must have 54 cards across 10 tableau columns (columns 0..3 have 6 cards, 4..9 have 5 cards; top card face up, rest face down). Exactly 50 cards remaining in stock (5 deals of 10 cards).
- **Default Mode**: 1 Suit (Spades ♠), with options for 2 Suits and 4 Suits.
- **Victory Condition**: Reaching 8 completed runs (104 cards cleared) immediately triggers the victory state.
- **Victory Animation**: An HTML5 `<canvas>` rendering bouncing cards with gravity and rebound physics that intentionally preserve prior frames (`ctx.drawImage` without `clearRect`), replicating the legendary Windows XP card waterfall trail.
- **Testing & Safety**: Do NOT run heavy integration test suites; run targeted unit tests (`spiderEngine.test.ts` and `SpiderSolitaireApp.test.tsx`) and verify build via `npm run build`.

---

### Task 1: Type Definitions and Data Models

**Files:**
- Create: `src/types/spider.ts`
- Modify: `src/types/index.ts:20-28`
- Modify: `src/utils/data.ts:45-55`

**Interfaces:**
- Consumes: `DesktopIconItem` in `src/types/index.ts`.
- Produces: `Suit`, `Rank`, `Card`, `Difficulty`, `SpiderGameState`, and updated `DesktopIconItem.iconType` with `'spider'`.

- [ ] **Step 1: Create `src/types/spider.ts`**

```typescript
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
```

- [ ] **Step 2: Update `DesktopIconItem` in `src/types/index.ts`**

Add `'spider'` to `iconType`:

```typescript
export interface DesktopIconItem {
  id: string;
  title: string;
  iconType: 'trash' | 'pdf' | 'notepad' | 'folder' | 'browser' | 'smartphone' | 'cmd' | 'taskmgr' | 'spider';
  windowId: string;
}
```

- [ ] **Step 3: Add Paciência Spider desktop icon in `src/utils/data.ts`**

In `src/utils/data.ts`, add the desktop icon:

```typescript
export const DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'recycle-bin', title: 'Lixeira', iconType: 'trash', windowId: 'recycle-bin-window' },
  { id: 'cv', title: 'caio-cv.pdf', iconType: 'pdf', windowId: 'cv-window' },
  { id: 'about', title: 'sobre-caio.txt', iconType: 'notepad', windowId: 'about-window' },
  { id: 'cmd', title: 'Prompt de comando', iconType: 'cmd', windowId: 'cmd-window' },
  { id: 'spider', title: 'Paciência Spider', iconType: 'spider', windowId: 'spider-solitaire-window' },
  { id: 'projects', title: 'projetos', iconType: 'folder', windowId: 'projects-window' },
  { id: 'hobbies', title: 'hobbies', iconType: 'folder', windowId: 'hobbies-window' }
];
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/types/spider.ts src/types/index.ts src/utils/data.ts
git commit -m "feat(spider): define Spider Solitaire data models and register desktop icon"
```

---

### Task 2: Spider Solitaire Pure Game Engine & Comprehensive Tests

**Files:**
- Create: `src/utils/spiderEngine.ts`
- Create: `src/test/spiderEngine.test.ts`

**Interfaces:**
- Consumes: Types from `src/types/spider.ts`.
- Produces: `createInitialGameState`, `dealFromStock`, `moveCards`, `canMoveCards`, `getMovableSequence`, `checkAndCollectRuns`, `undoMove`.

- [ ] **Step 1: Write unit tests in `src/test/spiderEngine.test.ts`**

```typescript
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
  });

  it('automatically detects and collects a full K-to-A run of the same suit', () => {
    const fullRun: Card[] = [];
    for (let r = 13; r >= 1; r--) {
      fullRun.push({ id: `c-${r}`, suit: 'spades', rank: r as any, isFaceUp: true });
    }
    const state = createInitialGameState('1-suit');
    state.tableau[0] = fullRun;

    const { state: updatedState, collected } = checkAndCollectRuns(state);
    expect(collected).toBe(1);
    expect(updatedState.completedRuns).toBe(1);
    expect(updatedState.tableau[0].length).toBe(0);
  });

  it('supports undoing previous moves', () => {
    const state = createInitialGameState('1-suit');
    const dealtState = dealFromStock(state);
    expect(dealtState.moves).toBe(1);
    const reverted = undoMove(dealtState);
    expect(reverted.stock.length).toBe(5);
    expect(reverted.moves).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify failure before implementation**

Run: `npx vitest run src/test/spiderEngine.test.ts`
Expected: FAIL ("Cannot find module '../utils/spiderEngine'").

- [ ] **Step 3: Implement `src/utils/spiderEngine.ts`**

Create `src/utils/spiderEngine.ts`:

```typescript
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
  const cardsToMove = getMovableSequence(state.tableau[fromColIdx], cardIndex);
  if (!cardsToMove) return state;

  const targetCol = state.tableau[toColIdx];
  if (!canMoveCards(cardsToMove, targetCol)) return state;

  const historySnapshot = snapshotState(state);

  const newTableau = state.tableau.map(col => col.map(c => ({ ...c })));
  const moved = newTableau[fromColIdx].splice(cardIndex, cardsToMove.length);
  newTableau[toColIdx].push(...moved);

  // Auto-flip exposed top card in source column
  const sourceCol = newTableau[fromColIdx];
  if (sourceCol.length > 0 && !sourceCol[sourceCol.length - 1].isFaceUp) {
    sourceCol[sourceCol.length - 1].isFaceUp = true;
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
    const column = newTableau[col];
    if (column.length < 13) continue;

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
```

- [ ] **Step 4: Run test to verify PASS**

Run: `npx vitest run src/test/spiderEngine.test.ts`
Expected: PASS with 6/6 tests passing.

- [ ] **Step 5: Commit changes**

```bash
git add src/utils/spiderEngine.ts src/test/spiderEngine.test.ts
git commit -m "feat(spider): implement Spider Solitaire engine and unit tests"
```

---

### Task 3: OS Shell Integration & Icons

**Files:**
- Modify: `src/context/WindowContext.tsx:160-185`
- Modify: `src/components/windows/WindowFrame.tsx:250-270`
- Modify: `src/components/desktop/DesktopIcon.tsx:15-35`
- Modify: `src/components/desktop/Taskbar.tsx:35-50`
- Modify: `src/components/desktop/StartMenu.tsx:180-210`
- Modify: `src/utils/cmdEngine.ts:90-130`

**Interfaces:**
- Consumes: `useWindowManager`, `executeCommand`.
- Produces: `spider-solitaire-window` window registration, Spade outline icon in Desktop, taskbar, start menu, and CMD command launcher.

- [ ] **Step 1: Register window in `src/context/WindowContext.tsx`**

Add `spider-solitaire-window` to `DEFAULT_WINDOWS`:

```typescript
{
  id: 'spider-solitaire-window',
  title: 'Paciência Spider',
  icon: 'spider',
  isOpen: false,
  isMinimized: false,
  isMaximized: false,
  zIndex: 10,
  position: { x: 70, y: 30, width: 840, height: 600 },
  defaultPosition: { x: 70, y: 30, width: 840, height: 600 }
}
```

- [ ] **Step 2: Add `spider` icon to `WindowFrame.tsx` and `Taskbar.tsx`**

In `WindowFrame.tsx` and `Taskbar.tsx`, add case `'spider'`:

```tsx
case 'spider':
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.5 7 4 11 4 15.5C4 18.5 6.5 21 9.5 21C10.7 21 11.5 20.2 12 19.5C12.5 20.2 13.3 21 14.5 21C17.5 21 20 18.5 20 15.5C20 11 14.5 7 12 2Z" fill="#1A1A1A" />
      <path d="M10 19L8 23H16L14 19H10Z" fill="#1A1A1A" />
    </svg>
  );
```

- [ ] **Step 3: Add `spider` icon to `DesktopIcon.tsx`**

Import `Spade` from `lucide-react` and add case:

```tsx
case 'spider':
  return <Spade className="w-9 h-9 text-emerald-300 drop-shadow-md" data-testid="icon-spider" />;
```

- [ ] **Step 4: Add "Paciência Spider" item in `StartMenu.tsx`**

Add button right alongside Minesweeper:

```tsx
<button
  type="button"
  data-testid="start-menu-spider"
  onClick={() => {
    openWindow('spider-solitaire-window');
    onClose();
  }}
  className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
>
  <div className="w-5 h-5 flex items-center justify-center text-sm flex-shrink-0">
    ♠️
  </div>
  <div className="leading-tight">
    <span className="font-semibold block">Paciência Spider</span>
    <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Jogo clássico de cartas</span>
  </div>
</button>
```

- [ ] **Step 5: Support `spider` command in `src/utils/cmdEngine.ts`**

Add case:

```typescript
case 'spider':
case 'paciencia':
case 'solitaire':
  ctx.openWindow('spider-solitaire-window');
  return { output: ['Iniciando Paciência Spider...'] };
```

- [ ] **Step 6: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit changes**

```bash
git add src/context/WindowContext.tsx src/components/windows/WindowFrame.tsx src/components/desktop/DesktopIcon.tsx src/components/desktop/Taskbar.tsx src/components/desktop/StartMenu.tsx src/utils/cmdEngine.ts
git commit -m "feat(spider): integrate Paciência Spider across window context, desktop, start menu, and cmd"
```

---

### Task 4: Card Component, Stock/Foundations & Tableau

**Files:**
- Create: `src/components/windows/spider/PlayingCard.tsx`
- Create: `src/components/windows/spider/SpiderStock.tsx`
- Create: `src/components/windows/spider/SpiderTableau.tsx`

**Interfaces:**
- Consumes: `Card`, `Suit`, `Rank`.
- Produces: Reusable playing card with authentic XP blue back and front glyphs, stock deal pile, foundations, and 10 tableau columns with drag & double-click handlers.

- [ ] **Step 1: Create `src/components/windows/spider/PlayingCard.tsx`**

```tsx
import React from 'react';
import { Card } from '../../../types/spider';

interface PlayingCardProps {
  card: Card;
  isDragging?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  spades: { symbol: '♠', color: '#000000' },
  hearts: { symbol: '♥', color: '#D80000' },
  diamonds: { symbol: '♦', color: '#D80000' },
  clubs: { symbol: '♣', color: '#000000' }
};

const RANK_LABELS: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K'
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isDragging,
  className = '',
  style,
  onClick,
  onDoubleClick
}) => {
  if (!card.isFaceUp) {
    // Authentic retro blue patterned card back
    return (
      <div
        style={style}
        onClick={onClick}
        className={`w-16 h-24 sm:w-20 sm:h-28 rounded-md border-2 border-white shadow-md bg-[#0B409C] flex items-center justify-center select-none overflow-hidden ${className} ${
          isDragging ? 'opacity-60' : ''
        }`}
      >
        <div className="w-full h-full m-1 border border-white/60 rounded-xs bg-[radial-gradient(#1E6CE8_1.5px,transparent_1.5px)] [background-size:6px_6px] flex items-center justify-center">
          <div className="w-6 h-8 rounded-full border border-white/80 bg-[#003080] flex items-center justify-center text-white/90 text-xs font-serif shadow-inner">
            ✦
          </div>
        </div>
      </div>
    );
  }

  const { symbol, color } = SUIT_SYMBOLS[card.suit];
  const rankLabel = RANK_LABELS[card.rank];

  return (
    <div
      style={{ ...style, color }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={`card-${card.suit}-${card.rank}`}
      className={`w-16 h-24 sm:w-20 sm:h-28 rounded-md border border-gray-400 bg-white shadow-md select-none flex flex-col justify-between p-1.5 font-sans cursor-pointer transition-transform ${className} ${
        isDragging ? 'opacity-60 scale-105' : 'hover:brightness-95'
      }`}
    >
      {/* Top Left Corner */}
      <div className="flex flex-col items-center leading-none w-4">
        <span className="font-bold text-xs sm:text-sm">{rankLabel}</span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>

      {/* Center Center Symbol or Royal Face */}
      <div className="flex items-center justify-center text-xl sm:text-2xl font-bold opacity-90 select-none">
        {card.rank >= 11 ? rankLabel : symbol}
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className="flex flex-col items-center leading-none w-4 self-end rotate-180">
        <span className="font-bold text-xs sm:text-sm">{rankLabel}</span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create `src/components/windows/spider/SpiderStock.tsx`**

```tsx
import React from 'react';
import { Card } from '../../../types/spider';

interface SpiderStockProps {
  stockCount: number;
  completedRuns: number;
  onDeal: () => void;
}

export const SpiderStock: React.FC<SpiderStockProps> = ({
  stockCount,
  completedRuns,
  onDeal
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-green-800 bg-[#006020]/40">
      {/* Left: Completed Foundation Runs */}
      <div className="flex items-center space-x-1 sm:space-x-1.5" data-testid="spider-foundations">
        {Array.from({ length: 8 }).map((_, idx) => {
          const isCollected = idx < completedRuns;
          return (
            <div
              key={idx}
              className={`w-10 h-14 sm:w-12 sm:h-16 rounded border ${
                isCollected
                  ? 'border-yellow-300 bg-white shadow-md flex flex-col items-center justify-center text-black'
                  : 'border-green-800/80 bg-green-900/30'
              } flex items-center justify-center text-xs font-bold`}
            >
              {isCollected ? (
                <>
                  <span className="text-[10px] leading-tight">K</span>
                  <span className="text-sm">♠</span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Right: Stock Deal Pile */}
      <div className="flex items-center space-x-2">
        <span className="text-white text-xs font-bold drop-shadow">
          Restam: {stockCount}
        </span>
        <button
          type="button"
          disabled={stockCount === 0}
          onClick={onDeal}
          data-testid="spider-stock-button"
          title={stockCount > 0 ? 'Comprar 10 cartas' : 'Estoque vazio'}
          className="relative w-12 h-16 sm:w-14 sm:h-20 rounded border-2 border-white shadow-lg bg-[#0B409C] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          {stockCount > 0 && (
            <div className="w-full h-full p-1 bg-[radial-gradient(#1E6CE8_1px,transparent_1px)] [background-size:4px_4px] flex items-center justify-center text-white text-xs">
              🂠
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Create `src/components/windows/spider/SpiderTableau.tsx`**

```tsx
import React, { useState } from 'react';
import { Card } from '../../../types/spider';
import { PlayingCard } from './PlayingCard';
import { getMovableSequence, canMoveCards } from '../../../utils/spiderEngine';

interface SpiderTableauProps {
  tableau: Card[][];
  onMove: (fromCol: number, cardIdx: number, toCol: number) => void;
}

export const SpiderTableau: React.FC<SpiderTableauProps> = ({ tableau, onMove }) => {
  const [dragInfo, setDragInfo] = useState<{ colIdx: number; cardIdx: number } | null>(null);

  const handleCardDoubleClick = (colIdx: number, cardIdx: number) => {
    const cardsToMove = getMovableSequence(tableau[colIdx], cardIdx);
    if (!cardsToMove) return;

    // Find the first valid destination column
    for (let targetCol = 0; targetCol < 10; targetCol++) {
      if (targetCol === colIdx) continue;
      if (canMoveCards(cardsToMove, tableau[targetCol])) {
        onMove(colIdx, cardIdx, targetCol);
        return;
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, colIdx: number, cardIdx: number) => {
    const seq = getMovableSequence(tableau[colIdx], cardIdx);
    if (!seq) {
      e.preventDefault();
      return;
    }
    setDragInfo({ colIdx, cardIdx });
    e.dataTransfer.setData('text/plain', JSON.stringify({ colIdx, cardIdx }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColIdx: number) => {
    e.preventDefault();
    if (!dragInfo) return;
    onMove(dragInfo.colIdx, dragInfo.cardIdx, targetColIdx);
    setDragInfo(null);
  };

  return (
    <div className="flex-1 grid grid-cols-10 gap-1 sm:gap-2 p-2 sm:p-3 overflow-x-auto min-h-0">
      {tableau.map((column, colIdx) => (
        <div
          key={colIdx}
          data-testid={`tableau-column-${colIdx}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, colIdx)}
          className="relative min-h-[320px] rounded border border-green-800/40 bg-green-900/10 flex flex-col items-center"
        >
          {column.length === 0 ? (
            <div className="w-16 h-24 sm:w-20 sm:h-28 rounded border border-dashed border-green-600/40 m-1" />
          ) : (
            column.map((card, cardIdx) => {
              const isTop = cardIdx === column.length - 1;
              const isMovable = getMovableSequence(column, cardIdx) !== null;

              return (
                <div
                  key={card.id}
                  draggable={isMovable}
                  onDragStart={(e) => handleDragStart(e, colIdx, cardIdx)}
                  style={{
                    position: cardIdx === 0 ? 'relative' : 'absolute',
                    top: cardIdx === 0 ? 0 : `${cardIdx * (card.isFaceUp ? 22 : 12)}px`,
                    zIndex: cardIdx + 1
                  }}
                >
                  <PlayingCard
                    card={card}
                    onDoubleClick={() => handleCardDoubleClick(colIdx, cardIdx)}
                  />
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/windows/spider/PlayingCard.tsx src/components/windows/spider/SpiderStock.tsx src/components/windows/spider/SpiderTableau.tsx
git commit -m "feat(spider): create PlayingCard, SpiderStock, and SpiderTableau components"
```

---

### Task 5: Victory Cascade Canvas Animation

**Files:**
- Create: `src/components/windows/spider/VictoryCanvas.tsx`

**Interfaces:**
- Consumes: Window size and restart game callback.
- Produces: 60 FPS HTML5 canvas card waterfall animation with rebounding physics and persistent card trails.

- [ ] **Step 1: Create `src/components/windows/spider/VictoryCanvas.tsx`**

```tsx
import React, { useEffect, useRef } from 'react';

interface VictoryCanvasProps {
  onRestart: () => void;
}

interface BouncingCard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  suit: string;
  rank: string;
}

export const VictoryCanvas: React.FC<VictoryCanvasProps> = ({ onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 550);

    const cards: BouncingCard[] = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];

    let cardCounter = 0;
    const totalCardsToDrop = 104;

    const spawnCard = () => {
      if (cardCounter >= totalCardsToDrop) return;
      const rank = ranks[cardCounter % 13];
      const suit = suits[Math.floor(cardCounter / 26) % 4];
      cards.push({
        x: Math.random() * (width - 100) + 50,
        y: 80,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 8 + 6),
        width: 60,
        height: 84,
        suit,
        rank
      });
      cardCounter++;
    };

    // Spawn 1 card every 120ms
    const spawner = setInterval(spawnCard, 120);

    const gravity = 0.55;
    const bounceDamping = 0.82;

    const render = () => {
      // NOTE: Intentionally do NOT clearRect to create the legendary Windows XP card trail!
      for (const card of cards) {
        card.vy += gravity;
        card.x += card.vx;
        card.y += card.vy;

        // Ground collision
        if (card.y + card.height >= height) {
          card.y = height - card.height;
          card.vy = -card.vy * bounceDamping;
          card.vx *= 0.98; // slight rolling friction
        }

        // Wall collision
        if (card.x <= 0 || card.x + card.width >= width) {
          card.vx = -card.vx;
        }

        // Draw card onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(card.x, card.y, card.width, card.height, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = card.suit === '♥' || card.suit === '♦' ? '#D80000' : '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(card.rank, card.x + 5, card.y + 15);
        ctx.fillText(card.suit, card.x + 5, card.y + 28);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(spawner);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between pointer-events-auto">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 mt-6 bg-[#ECE9D8] border-2 border-white shadow-2xl p-4 rounded text-center max-w-sm">
        <h2 className="text-xl font-bold text-green-900 mb-1">Parabéns! Você venceu!</h2>
        <p className="text-xs text-gray-700 mb-3">
          Todas as 8 sequências de cartas foram organizadas com sucesso!
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="px-4 py-1.5 text-xs font-bold text-black bg-gradient-to-b from-white via-[#ECE9D8] to-[#D8D4C8] border border-[#003C74] rounded hover:border-[#F2A000] active:scale-95 shadow"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/components/windows/spider/VictoryCanvas.tsx
git commit -m "feat(spider): implement VictoryCanvas with physics and persistent card trails"
```

---

### Task 6: SpiderSolitaireApp Window & Component Tests

**Files:**
- Create: `src/components/windows/SpiderSolitaireApp.tsx`
- Create: `src/test/SpiderSolitaireApp.test.tsx`
- Modify: `src/components/desktop/Desktop.tsx:50-70`

**Interfaces:**
- Consumes: `WindowFrame`, `useWindowManager`, `spiderEngine`.
- Produces: `SpiderSolitaireApp` mounted in `Desktop.tsx`.

- [ ] **Step 1: Write component tests in `src/test/SpiderSolitaireApp.test.tsx`**

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpiderSolitaireApp } from '../components/windows/SpiderSolitaireApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('SpiderSolitaireApp', () => {
  it('renders green table, 10 tableau columns, and stock pile', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <SpiderSolitaireApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText(/Paciência Spider/i)).toBeInTheDocument();
    expect(screen.getByText(/Pontuação:/i)).toBeInTheDocument();
    expect(screen.getByText(/Movimentos:/i)).toBeInTheDocument();

    for (let col = 0; col < 10; col++) {
      expect(screen.getByTestId(`tableau-column-${col}`)).toBeInTheDocument();
    }

    expect(screen.getByTestId('spider-stock-button')).toBeInTheDocument();
  });

  it('deals cards when clicking the stock button', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <SpiderSolitaireApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    const stockBtn = screen.getByTestId('spider-stock-button');
    fireEvent.click(stockBtn);

    expect(screen.getByText(/Movimentos: 1/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create `src/components/windows/SpiderSolitaireApp.tsx`**

```tsx
import React, { useState } from 'react';
import { WindowFrame } from './WindowFrame';
import { SpiderTableau } from './spider/SpiderTableau';
import { SpiderStock } from './spider/SpiderStock';
import { VictoryCanvas } from './spider/VictoryCanvas';
import {
  createInitialGameState,
  dealFromStock,
  moveCards,
  undoMove
} from '../../utils/spiderEngine';
import { Difficulty, SpiderGameState } from '../../types/spider';

interface SpiderSolitaireAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const SpiderSolitaireApp: React.FC<SpiderSolitaireAppProps> = ({
  id = 'spider-solitaire-window',
  isOpen,
  onClose
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('1-suit');
  const [gameState, setGameState] = useState<SpiderGameState>(() =>
    createInitialGameState('1-suit')
  );
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleRestart = (newDiff: Difficulty = difficulty) => {
    setDifficulty(newDiff);
    setGameState(createInitialGameState(newDiff));
    setActiveMenu(null);
  };

  const handleMove = (fromCol: number, cardIdx: number, toCol: number) => {
    setGameState(prev => moveCards(prev, fromCol, cardIdx, toCol));
  };

  const handleDeal = () => {
    setGameState(prev => dealFromStock(prev));
  };

  const handleUndo = () => {
    setGameState(prev => undoMove(prev));
    setActiveMenu(null);
  };

  return (
    <WindowFrame
      id={id}
      title="Paciência Spider"
      icon="spider"
      isOpen={isOpen}
      onClose={onClose}
      initialPosition={{ x: 70, y: 30, width: 840, height: 600 }}
    >
      <div className="flex flex-col h-full bg-[#007A33] font-tahoma select-none overflow-hidden relative">
        {/* Menu Bar */}
        <div className="flex items-center px-1.5 py-0.5 bg-[#ECE9D8] border-b border-[#D8D4C8] text-xs text-black">
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'jogo' ? null : 'jogo')}
              className={`px-2 py-0.5 rounded-sm hover:bg-[#316AC5] hover:text-white ${
                activeMenu === 'jogo' ? 'bg-[#316AC5] text-white' : ''
              }`}
            >
              Jogo
            </button>
            {activeMenu === 'jogo' && (
              <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#7F9DB9] shadow-md py-1 min-w-[160px] z-50 text-black">
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={() => handleRestart(difficulty)}
                >
                  Novo jogo (F2)
                </div>
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={handleUndo}
                >
                  Desfazer (Ctrl+Z)
                </div>
                <div className="border-t border-[#D8D4C8] my-1" />
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer font-bold"
                  onClick={() => handleRestart('1-suit')}
                >
                  Fácil (1 Naipe) {difficulty === '1-suit' && '✓'}
                </div>
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={() => handleRestart('2-suits')}
                >
                  Médio (2 Naipes) {difficulty === '2-suits' && '✓'}
                </div>
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={() => handleRestart('4-suits')}
                >
                  Difícil (4 Naipes) {difficulty === '4-suits' && '✓'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 10 Tableau Columns */}
        <SpiderTableau tableau={gameState.tableau} onMove={handleMove} />

        {/* Stock & Foundations */}
        <SpiderStock
          stockCount={gameState.stock.length * 10}
          completedRuns={gameState.completedRuns}
          onDeal={handleDeal}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#ECE9D8] border-t border-[#D8D4C8] text-xs text-gray-700">
          <span>Pontuação: {gameState.score}</span>
          <span>Movimentos: {gameState.moves}</span>
        </div>

        {/* Victory Screen with Bouncing Card Cascade Canvas */}
        {gameState.isWon && <VictoryCanvas onRestart={() => handleRestart(difficulty)} />}
      </div>
    </WindowFrame>
  );
};
```

- [ ] **Step 3: Mount `<SpiderSolitaireApp />` in `src/components/desktop/Desktop.tsx`**

In `src/components/desktop/Desktop.tsx`:
Add import:
```tsx
import { SpiderSolitaireApp } from '../windows/SpiderSolitaireApp';
```
And mount `<SpiderSolitaireApp />` alongside `<MinesweeperApp />`:
```tsx
<MinesweeperApp />
<SpiderSolitaireApp />
```

- [ ] **Step 4: Run unit tests**

Run: `npx vitest run src/test/SpiderSolitaireApp.test.tsx`
Expected: PASS with 2/2 tests passing.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/windows/SpiderSolitaireApp.tsx src/test/SpiderSolitaireApp.test.tsx src/components/desktop/Desktop.tsx
git commit -m "feat(spider): implement SpiderSolitaireApp and mount on Desktop"
```

---

### Task 7: Full Verification & Remote Deployment

**Files:**
- Remote: `origin/main`

- [ ] **Step 1: Run TypeScript verification**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run targeted unit tests**

Run: `npx vitest run src/test/spiderEngine.test.ts src/test/SpiderSolitaireApp.test.tsx`
Expected: All 8 tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: `✓ built in ...ms` with code 0.

- [ ] **Step 4: Push to `origin main`**

Run: `git push origin main`
Expected: Clean push to GitHub `main`.
