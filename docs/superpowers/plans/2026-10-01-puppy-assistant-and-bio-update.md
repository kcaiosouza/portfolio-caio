# Puppy Assistant & Bio Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Windows XP low-poly beagle puppy assistant (Rover) fixed at the bottom-right desktop with an XP speech balloon and conversational input, and update `sobre-caio.txt` with the complete bio from `SOBRE-CAIO (1).txt`.

**Architecture:** A lightweight companion component (`PuppyAssistant.tsx`) mounted on `Desktop.tsx` rendered with classic XP balloon styling (`#FFFFE1`, border, tail pointer, `[×]` close button). Conversation state is isolated in `assistantService.ts`, which tracks full multi-turn dialog history behind the scenes while visually displaying only the latest speech. `sobre-caio.txt` is updated in `data.ts` and `NotepadApp.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest, React Testing Library.

## Global Constraints

- Authentic Windows XP look and feel: balloon background `#FFFFE1`, border `#7A7A7A`, Tahoma font.
- Speech bubble displays only the puppy's current message and the input field. Full history is kept in memory.
- Puppy image placed in `public/assets/beagle-puppy.png`.
- Temporary file `SOBRE-CAIO (1).txt` must be deleted after updating the codebase.
- Zero regressions: all existing 62 Vitest tests must pass.

---

### Task 1: Assets Setup & Bio Update

**Files:**
- Create: `public/assets/beagle-puppy.png` (copy from `Low-Poly Beagle Puppy Asset.png`)
- Modify: `src/utils/data.ts`
- Modify: `src/components/windows/NotepadApp.tsx:24-71`
- Delete: `SOBRE-CAIO (1).txt`
- Test: `src/test/NotepadApp.test.tsx`

**Interfaces:**
- Produces:
  - File `/assets/beagle-puppy.png` accessible by browser.
  - `generateNotepadText()` in `NotepadApp.tsx` returning the updated `SOBRE-CAIO.TXT` content.

- [ ] **Step 1: Write failing test for updated bio content**

Edit `src/test/NotepadApp.test.tsx` to assert that `generateNotepadText()` contains the new role and information:
```typescript
import { describe, it, expect } from 'vitest';
import { generateNotepadText } from '../components/windows/NotepadApp';

describe('NotepadApp Bio Text', () => {
  it('contains updated Pleno III role and Single Software information', () => {
    const text = generateNotepadText();
    expect(text).toContain('Desenvolvedor Full Stack (Pleno III)');
    expect(text).toContain('Single Software');
    expect(text).toContain('HINÁRIO EAV');
    expect(text).toContain('IGCGMUSIC BETA');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/NotepadApp.test.tsx`  
Expected: FAIL (does not contain "Desenvolvedor Full Stack (Pleno III)").

- [ ] **Step 3: Setup assets directory, copy puppy image, update `data.ts` and `NotepadApp.tsx`, and delete temporary file**

Copy `Low-Poly Beagle Puppy Asset.png` to `public/assets/beagle-puppy.png`.
Update `generateNotepadText` in `src/components/windows/NotepadApp.tsx` to return the new text verbatim from `SOBRE-CAIO (1).txt`.
Update `PORTFOLIO_DATA` in `src/utils/data.ts` to match the updated profile (Pleno III, Single Software, etc.).
Delete `SOBRE-CAIO (1).txt`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/NotepadApp.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/assets/beagle-puppy.png src/utils/data.ts src/components/windows/NotepadApp.tsx src/test/NotepadApp.test.tsx
git rm "SOBRE-CAIO (1).txt"
git commit -m "feat(bio): update sobre-caio text and setup puppy asset"
```

---

### Task 2: Assistant Service (`assistantService.ts`)

**Files:**
- Create: `src/services/assistantService.ts`
- Test: `src/test/assistantService.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: number;
  }
  export const INITIAL_ASSISTANT_MESSAGE: string;
  export function getInitialMessages(): ChatMessage[];
  export function sendAssistantMessage(
    history: ChatMessage[],
    userText: string
  ): Promise<{ reply: string; updatedHistory: ChatMessage[] }>;
  ```

- [ ] **Step 1: Write failing unit test for `assistantService`**

Create `src/test/assistantService.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import {
  INITIAL_ASSISTANT_MESSAGE,
  getInitialMessages,
  sendAssistantMessage
} from '../services/assistantService';

describe('assistantService', () => {
  it('returns the initial greeting message', () => {
    const history = getInitialMessages();
    expect(history.length).toBe(1);
    expect(history[0].role).toBe('assistant');
    expect(history[0].content).toBe(INITIAL_ASSISTANT_MESSAGE);
    expect(history[0].content).toContain('Como posso te ajudar hoje?');
  });

  it('appends user message and returns assistant response with full history', async () => {
    const initial = getInitialMessages();
    const result = await sendAssistantMessage(initial, 'Quais são os projetos do Caio?');
    expect(result.reply).toBeDefined();
    expect(result.updatedHistory.length).toBe(3); // [assistant greeting, user msg, assistant reply]
    expect(result.updatedHistory[1].role).toBe('user');
    expect(result.updatedHistory[1].content).toBe('Quais são os projetos do Caio?');
    expect(result.updatedHistory[2].role).toBe('assistant');
    expect(result.updatedHistory[2].content).toBe(result.reply);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/assistantService.test.ts`  
Expected: FAIL ("Cannot find module '../services/assistantService'").

- [ ] **Step 3: Implement `src/services/assistantService.ts`**

Implement `ChatMessage` interface, initial greeting constant, and `sendAssistantMessage`:
- Keeps track of conversation history behind the scenes.
- Contextual mock responses that answer questions about Caio (projects, stack, contact, etc.) and navigation in the XP desktop.
- Includes commented-out `fetch` template ready for the user's AI backend endpoint.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/assistantService.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/assistantService.ts src/test/assistantService.test.ts
git commit -m "feat(assistant): implement assistantService with conversation state and mock replies"
```

---

### Task 3: Puppy Assistant UI Component (`PuppyAssistant.tsx`)

**Files:**
- Create: `src/components/assistant/PuppyAssistant.tsx`
- Test: `src/test/PuppyAssistant.test.tsx`

**Interfaces:**
- Consumes: `getInitialMessages`, `sendAssistantMessage` from `src/services/assistantService.ts`.
- Produces:
  ```typescript
  export const PuppyAssistant: React.FC<{ defaultOpen?: boolean }>;
  ```

- [ ] **Step 1: Write failing component test**

Create `src/test/PuppyAssistant.test.tsx`:
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PuppyAssistant } from '../components/assistant/PuppyAssistant';

describe('PuppyAssistant', () => {
  it('renders puppy image and speech balloon with initial message', () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const puppyImg = screen.getByAltText(/Cachorro Ajudante/i);
    expect(puppyImg).toBeInTheDocument();
    expect(screen.getByText(/Como posso te ajudar hoje\?/i)).toBeInTheDocument();
  });

  it('can close balloon via close button and reopen by clicking puppy', () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const closeBtn = screen.getByRole('button', { name: /Fechar balão/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Como posso te ajudar hoje\?/i)).not.toBeInTheDocument();

    const puppyImg = screen.getByAltText(/Cachorro Ajudante/i);
    fireEvent.click(puppyImg);
    expect(screen.getByText(/Como posso te ajudar hoje\?/i)).toBeInTheDocument();
  });

  it('sends user message and updates speech bubble with new reply', async () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const input = screen.getByPlaceholderText(/Pergunte algo\.\.\./i);
    const sendBtn = screen.getByRole('button', { name: /Enviar/i });

    fireEvent.change(input, { target: { value: 'Qual a sua stack?' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      // Input should be cleared
      expect(input).toHaveValue('');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/PuppyAssistant.test.tsx`  
Expected: FAIL ("Cannot find module '../components/assistant/PuppyAssistant'").

- [ ] **Step 3: Implement `PuppyAssistant.tsx`**

Implement `src/components/assistant/PuppyAssistant.tsx`:
- Positioned fixed in bottom-right corner (`bottom-10 right-4 md:bottom-12 md:right-8 z-40`).
- Low-poly beagle puppy image with subtle hover/idle animation.
- Windows XP balloon tooltip:
  - Yellow background `#FFFFE1`, border `1px solid #7A7A7A`, shadow.
  - Tail SVG pointer pointing down towards puppy.
  - Header with `[×]` close button.
  - Body displaying ONLY the puppy's latest speech.
  - Footer with text input and XP-style "Enviar" button.
  - Handles Enter key submission and prevents event bubbling to desktop.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/PuppyAssistant.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/assistant/PuppyAssistant.tsx src/test/PuppyAssistant.test.tsx
git commit -m "feat(assistant): implement PuppyAssistant component with XP speech balloon"
```

---

### Task 4: Mount on Desktop & Full Verification

**Files:**
- Modify: `src/components/desktop/Desktop.tsx`
- Test: All vitest suites (`npx vitest run`)

**Interfaces:**
- Mounts `<PuppyAssistant />` inside `Desktop.tsx`.

- [ ] **Step 1: Mount `PuppyAssistant` in `src/components/desktop/Desktop.tsx`**

Import `PuppyAssistant` and render it above the window layer:
```tsx
import { PuppyAssistant } from '../assistant/PuppyAssistant';
...
<PuppyAssistant />
```

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`  
Expected: All tests pass (62 existing + new tests).

- [ ] **Step 3: Run production build verification**

Run: `npm run build`  
Expected: Build succeeds with zero TypeScript / lint errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/desktop/Desktop.tsx
git commit -m "feat(desktop): mount PuppyAssistant on desktop"
```
