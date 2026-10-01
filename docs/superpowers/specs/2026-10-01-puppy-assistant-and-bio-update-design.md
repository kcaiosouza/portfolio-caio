# Design Spec: Puppy Assistant (Windows XP Rover) & Bio Update

**Date:** 2026-10-01  
**Status:** Approved  
**Author:** Antigravity & Caio Souza  

## 1. Overview & Objectives

1. **Windows XP Desktop Puppy Assistant**:
   - Provide a nostalgic, interactive assistant (inspired by Rover / Search Companion from Windows XP) fixed in the bottom-right corner of the desktop, just above the taskbar.
   - Use the 3D low-poly beagle puppy asset provided by the user.
   - Display a classic Windows XP speech balloon (`#FFFFE1`, 1px border, tail pointing to the puppy, `[×]` close button).
   - Conversational chat interface:
     - Welcome message: *"Como posso te ajudar hoje? Alguma dúvida sobre como mexer no portfólio ou alguma pergunta sobre o Caio?"*
     - Single-message display: Only the puppy's current statement is displayed visually, but complete conversational history (`ChatMessage[]`) is maintained in memory behind the scenes.
     - Input field & send button inside the balloon.
     - Mock/generic responses currently, with clean `assistantService.ts` ready to connect to an external AI backend.
     - Re-opening balloon by clicking on the puppy when closed.
2. **Bio & Notepad Content Update**:
   - Update `sobre-caio.txt` to match the exact content of `SOBRE-CAIO (1).txt`.
   - Remove temporary `SOBRE-CAIO (1).txt` file after migration.

---

## 2. Architecture & File Structure

```
portfolio-caio/
├── public/
│   └── assets/
│       └── beagle-puppy.png       # Copied from "Low-Poly Beagle Puppy Asset.png"
├── src/
│   ├── components/
│   │   ├── assistant/
│   │   │   └── PuppyAssistant.tsx  # Puppy rendering + XP Speech balloon + Input
│   │   └── desktop/
│   │       └── Desktop.tsx         # Mounts <PuppyAssistant />
│   ├── services/
│   │   └── assistantService.ts     # Conversation state, mock reply generator, API hook
│   ├── utils/
│   │   └── data.ts                 # Updated PORTFOLIO_DATA & sobre-caio text
│   └── components/windows/
│       └── NotepadApp.tsx          # Uses updated bio text
```

---

## 3. Detailed Component & Service Design

### 3.1 `assistantService.ts`
- **Interface**:
  ```typescript
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: number;
  }
  ```
- **Functions**:
  - `getInitialMessage(): string`: Returns *"Como posso te ajudar hoje? Alguma dúvida sobre como mexer no portfólio ou alguma pergunta sobre o Caio?"*.
  - `sendAssistantMessage(history: ChatMessage[], userMessage: string): Promise<string>`:
    - Appends user message to history.
    - Simulates network/typing latency (300-600ms).
    - Generates friendly contextual mock response (e.g. mentions projects, sobre-caio, or notes that Caio is connecting the AI backend soon).
    - Contains commented/ready-to-use `fetch('/api/chat', ...)` placeholder for Caio's AI backend.

### 3.2 `PuppyAssistant.tsx`
- **Placement**: Fixed `bottom-12 right-6 z-40 select-none`.
- **Puppy Asset**:
  - Rendered with `src="/assets/beagle-puppy.png"`.
  - Dimensions: ~90px-100px width/height, preserving aspect ratio.
  - Hover / Idle: CSS micro-animations (`animate-pulse-subtle` or gentle hover tilt `hover:scale-105 transition-transform`).
  - Click handler: toggles balloon visibility if balloon was closed.
- **XP Balloon Tooltip**:
  - Position: Positioned above the puppy, aligned to the right.
  - Styling:
    - Background: `#FFFFE1` (authentic Windows XP tooltip yellow).
    - Border: `1px solid #7A7A7A` with subtle box-shadow `rgba(0, 0, 0, 0.25) 2px 2px 6px`.
    - Border-radius: `6px`.
    - Tail: Downward pointing triangle pseudo-element / SVG pointing directly to the puppy's head.
    - Header: Small `[×]` close button in top right (`text-gray-500 hover:text-black hover:bg-[#E8E4C9] rounded px-1`).
    - Body:
      - Message text rendered in classic Tahoma 12px / 11px, dark gray/black (`#000000`).
      - Loading indicator when `isThinking` is true.
    - Footer Input Area:
      - Embedded input with XP-style inset border (`border-[#7F9DB9] border`).
      - "Enviar" button styled with XP Luna button gradient or classic flat button.
      - Handles `Enter` keydown.

### 3.3 Bio Content (`sobre-caio.txt`)
- Reflects the new information:
  - Role: Desenvolvedor Full Stack (Pleno III) at Single Software.
  - +6 anos no mercado | programando desde os 12 anos.
  - Hinário EAV, IGCG Music, IGCG Music Beta, WhatWatch.
  - Unifacisa Sistemas de Informação (2023 - 2027).
  - Curiosidades (IA com spec e plano, esports, água).
  - Contacts & TODO.txt.

---

## 4. Verification & Testing

1. **Unit Tests**:
   - `PuppyAssistant.test.tsx`:
     - Test that puppy renders with initial welcome message.
     - Test that submitting a message updates the displayed speech balloon.
     - Test closing the balloon with `[×]` and re-opening by clicking the puppy.
     - Test that full conversation history is stored across turns.
   - `NotepadApp.test.tsx`:
     - Test that `sobre-caio.txt` contains updated text (Single Software, Pleno III, etc.).
2. **Build and Verification**:
   - Run `npx vitest run` to ensure all tests pass (existing 62 + new tests).
   - Run `npm run build` to guarantee clean TypeScript compilation.
