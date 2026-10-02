# Design Spec: Windows XP Retro Spider Solitaire (Paciência Spider)

**Date:** 2026-10-01  
**Status:** Approved  
**Author:** Antigravity & Caio Souza  

## 1. Overview & Objectives

Implement an authentic, retro Windows XP Spider Solitaire (Paciência Spider) game inside the Caio XP portfolio with:
1. **Accurate Card Counts & Rules**:
   - 104 cards total (2 decks of 52 cards).
   - 10 tableau columns containing exactly 54 cards (first 4 columns have 6 cards, next 6 columns have 5 cards; top card face up, rest face down).
   - 50 cards in stock pile, dealt in 5 rounds of 10 cards (1 per column).
   - Modes: 1 Suit (Spades ♠ - Default / Easy), 2 Suits (Medium), 4 Suits (Hard).
   - Sequences from King down to Ace (13 cards) of the same suit are completed and moved to the 8 foundation slots.
2. **Fluid Interaction**:
   - Drag & drop movement for cards and valid descending same-suit runs.
   - Click / double-click to automatically move a card/run to the first valid column.
   - Stock deal button (deal 1 card to each column).
   - Undo functionality (revert moves).
3. **Iconic Windows XP Card Waterfall Victory Animation**:
   - Full 60 FPS HTML5 Canvas animation upon winning (all 8 foundation sets completed).
   - Cards cascade and bounce with physics ($g$, friction, rebound) leaving persistent card trails across the screen, mimicking the iconic Windows XP win screen.
4. **Operating System Integration**:
   - Registered window in `WindowContext`: `spider-solitaire-window`.
   - Entry points: Start Menu ("Paciência Spider"), Desktop icon ("Paciência Spider"), and CMD terminal command (`spider`, `paciencia`).
   - Task Manager integration: Listed as `spider.exe` with CPU & memory simulation while active.

---

## 2. Architecture & File Structure

```
portfolio-caio/
├── src/
│   ├── types/
│   │   ├── index.ts                     # Adds 'spider' to DesktopIconItem and WindowItem icons
│   │   └── spider.ts                    # Card, Suit, Rank, Column, GameState interfaces
│   ├── utils/
│   │   ├── spiderEngine.ts              # Pure game logic: deck gen, deal, move validation, auto-complete, undo
│   │   └── cmdEngine.ts                 # Adds 'spider' launcher command
│   ├── components/
│   │   ├── windows/
│   │   │   ├── SpiderSolitaireApp.tsx   # Window frame wrapper & menu bar
│   │   │   ├── spider/
│   │   │   │   ├── SpiderTableau.tsx    # 10 columns rendering & drag-drop targets
│   │   │   │   ├── PlayingCard.tsx      # SVG/CSS Card front and classic XP blue back
│   │   │   │   ├── SpiderStock.tsx      # Stock pile & 8 foundation slots
│   │   │   │   └── VictoryCanvas.tsx    # 60fps canvas card bounce & waterfall trails
│   │   │   └── WindowFrame.tsx          # Supports 'spider' icon in titlebar
│   │   └── desktop/
│   │       ├── Desktop.tsx              # Mounts <SpiderSolitaireApp />
│   │       ├── DesktopIcon.tsx          # Renders Lucide outline icon for Spider
│   │       ├── Taskbar.tsx              # Renders taskbar tab for Spider
│   │       └── StartMenu.tsx            # Adds "Paciência Spider" in Start Menu
│   └── test/
│       ├── spiderEngine.test.ts         # Unit tests for card counts, deal, move validation, run completion
│       └── SpiderSolitaireApp.test.tsx  # Component tests for board rendering, deal stock, win triggering
```

---

## 3. Detailed Specifications

### 3.1 Game Engine (`spiderEngine.ts`)

#### Card Data Model:
```typescript
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13; // 1 = A, 11 = J, 12 = Q, 13 = K

export interface Card {
  id: string; // unique e.g. "card-spades-13-1"
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export type Difficulty = '1-suit' | '2-suits' | '4-suits';

export interface SpiderGameState {
  tableau: Card[][];       // 10 columns
  stock: Card[][];         // 5 packs of 10 cards each
  completedRuns: number;   // 0 to 8
  moves: number;
  score: number;
  difficulty: Difficulty;
  history: SpiderGameStateSnapshot[];
}
```

#### Exact Card Count Invariants:
- Total cards in game: exactly 104 cards.
- Initial deal:
  - Columns 0..3: 6 cards each (5 face down, 1 face up) = 24 cards.
  - Columns 4..9: 5 cards each (4 face down, 1 face up) = 30 cards.
  - Total tableau cards: 54 cards.
  - Stock: 50 cards remaining, grouped into 5 deals of 10 cards each.
  - $54 + 50 = 104$ cards total.
- Victory condition:
  - `completedRuns === 8` (104 cards cleared into foundations).

#### Movement Rules:
- A card can be placed onto a column whose top card has `rank === targetCard.rank + 1` (regardless of suit).
- A group of cards can only be moved if they form an unbroken descending sequence of the *same suit* (e.g. ♠7, ♠6, ♠5).
- Any card or valid sequence can be moved to an empty column.
- When a move uncovers a face-down card, it automatically turns face up.
- When an unbroken sequence from King (13) to Ace (1) of the same suit is formed in any column, it is immediately removed from the column and `completedRuns` increments by 1.

### 3.2 Visual Component (`SpiderSolitaireApp.tsx` & subcomponents)

- **Colors & Atmosphere**:
  - Classic Windows XP table green felt: `#007A33` with subtle interior shadow.
  - Classic menus: `Jogo`, `Opções`, `Ajuda`.
  - Classic status bar: `Pontuação: 500   |   Movimentos: 0`.
- **Card Rendering**:
  - Front: Crisp white with red/black rank numbers and SVG suit glyphs.
  - Back: Classic Windows XP retro blue geometric patterned card back.
  - Sizing: Proportional card width (~8-9% of board width) with responsive overlap.
- **Victory Canvas (`VictoryCanvas.tsx`)**:
  - Full-board overlay HTML5 `<canvas>`.
  - Uses `requestAnimationFrame`.
  - Simulates gravity ($0.5$), initial velocity ($V_x \in [-8, 8]$, $V_y \in [-18, -10]$), ground bounce damping ($0.85$).
  - Does NOT clear the canvas between frames, producing the legendary persistent cascading card trail.

### 3.3 Operating System Integration

- **Window Registration**:
  - `id: 'spider-solitaire-window'`
  - `title: 'Paciência Spider'`
  - `icon: 'spider'`
  - `position: { x: 70, y: 30, width: 840, height: 600 }`
- **Start Menu**:
  - Shortcut "Paciência Spider" in the program column with cards/spider icon.
- **Desktop Icon**:
  - "Paciência Spider" with outline Lucide `Spade` icon matching the other desktop icons.
- **CMD**:
  - `spider`, `paciencia`, `solitaire` open `'spider-solitaire-window'`.
- **Task Manager**:
  - Appears in Task list as "Paciência Spider" and Process list as `spider.exe`.

---

## 4. Testing & Verification

1. **`spiderEngine.test.ts`**:
   - Verifies exactly 104 cards are generated in 1-suit, 2-suit, and 4-suit modes.
   - Verifies initial deal: columns 0-3 have 6 cards, 4-9 have 5 cards, stock has 50 cards.
   - Verifies valid move descending ranks, invalid move rejection.
   - Verifies same-suit sequence group movement.
   - Verifies complete K-to-A run detection and removal into foundations.
   - Verifies stock deal distributes 1 card to each column.
   - Verifies undo functionality restores previous snapshot.
2. **`SpiderSolitaireApp.test.tsx`**:
   - Renders 10 tableau columns and stock pile.
   - Dealing stock updates column card count.
   - Triggering 8 completed runs activates the victory screen.
3. **Build & Typecheck**:
   - `npx tsc --noEmit` exits with 0 errors.
   - `npm run build` succeeds cleanly.
