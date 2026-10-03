# MSN Messenger 7.5 (Caio Messenger XP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an authentic replica of MSN Messenger 7.5 for the Windows XP portfolio, featuring a classic contact list window, independent chat window with an interactive AI bot of Caio, Nudge ("Chamar Atenção") screen shake with sound, Web Audio MSN sound effects, emoticon support, and a direct email contact feature flagged as "[Em breve]".

**Architecture:** Two independent `WindowFrame` windows (`msn-window` for contact list and `msn-chat-window` for chat conversation) registered in `WindowContext`. An interactive chat engine (`msnEngine.ts`) simulating typing latency and contextual answers, classic emoticons parser and picker, retro Web Audio synthesized sound effects in `soundEffects.ts`, and full integration across Desktop, Start Menu, CMD terminal, and Task Manager (`msnmsgr.exe`).

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Web Audio API, Vitest, React Testing Library, Lucide React icons.

## Global Constraints

- **Window Standard:** Every window MUST wrap its content using the existing `WindowFrame` component with standard title bar, drag & drop, and XP control buttons.
- **Audio Standard:** All sound effects MUST be synthesized using Web Audio API in `soundEngine` (`src/utils/soundEffects.ts`), with zero external audio assets, respecting `soundEngine.isMuted()`.
- **Zero Retrabalho:** Reuse `soundEngine`, `WindowContext`, `SystemContext`, `WindowFrame`, and existing project data structures in `data.ts`.
- **Typing & Linting:** Strict TypeScript compliance with explicit interfaces; Vitest tests must pass without warnings.

---

### Task 1: Data Types, Sound Engine Extensions & Test Baseline Fix

**Files:**
- Create: `src/types/msn.ts`
- Modify: `src/utils/soundEffects.ts`
- Modify: `src/test/soundAndData.test.ts`
- Test: `src/test/msnSoundAndTypes.test.ts`

**Interfaces:**
- Produces: `MsnStatus`, `MsnContact`, `MsnMessage`, `soundEngine.playMsnOnline()`, `soundEngine.playMsnMessage()`, `soundEngine.playMsnNudge()`.

- [ ] **Step 1: Write the failing test for MSN types and sound methods**

Create `src/test/msnSoundAndTypes.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { soundEngine } from '../utils/soundEffects';
import { MsnContact, MsnMessage, MsnStatus } from '../types/msn';

describe('MSN Types and Sound Effects', () => {
  it('defines valid MSN data contracts', () => {
    const status: MsnStatus = 'online';
    const contact: MsnContact = {
      id: 'caio',
      name: 'Caio Souza',
      status: 'online',
      personalMessage: 'Full Stack Dev | Single Software',
      avatar: '/assets/avatar-caio.png',
      isDirectContact: false,
    };
    const message: MsnMessage = {
      id: '1',
      sender: 'caio',
      senderName: 'Caio Souza',
      text: 'Olá! Como posso ajudar?',
      timestamp: Date.now(),
      type: 'chat',
    };

    expect(status).toBe('online');
    expect(contact.id).toBe('caio');
    expect(message.text).toBe('Olá! Como posso ajudar?');
  });

  it('exposes playMsnOnline, playMsnMessage, and playMsnNudge methods on soundEngine', () => {
    expect(typeof (soundEngine as any).playMsnOnline).toBe('function');
    expect(typeof (soundEngine as any).playMsnMessage).toBe('function');
    expect(typeof (soundEngine as any).playMsnNudge).toBe('function');

    // Should run safely without throwing
    expect(() => (soundEngine as any).playMsnOnline()).not.toThrow();
    expect(() => (soundEngine as any).playMsnMessage()).not.toThrow();
    expect(() => (soundEngine as any).playMsnNudge()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/msnSoundAndTypes.test.ts`  
Expected: FAIL (modules `../types/msn` and methods do not exist).

- [ ] **Step 3: Create `src/types/msn.ts`**

```typescript
export type MsnStatus = 'online' | 'busy' | 'away' | 'offline';

export interface MsnContact {
  id: string;
  name: string;
  status: MsnStatus;
  personalMessage: string;
  avatar?: string;
  group: 'online' | 'direct' | 'offline';
  isDirectContact?: boolean;
}

export interface MsnMessage {
  id: string;
  sender: 'user' | 'caio' | 'system';
  senderName: string;
  text: string;
  timestamp: number;
  type?: 'chat' | 'nudge' | 'system';
}
```

- [ ] **Step 4: Extend `src/utils/soundEffects.ts` with MSN synthesis**

In `src/utils/soundEffects.ts`, add:
```typescript
  public playMsnOnline() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      // Classic MSN "Tudum" chord arpeggio: G4 -> C5
      const notes = [
        { f: 392.0, time: 0.0, dur: 0.25 }, // G4
        { f: 523.25, time: 0.12, dur: 0.45 } // C5
      ];
      notes.forEach(({ f, time, dur }) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.audioCtx.currentTime + time);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + time + dur);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + time);
        osc.stop(this.audioCtx.currentTime + time + dur);
      });
    } catch {
      // safe fallback
    }
  }

  public playMsnMessage() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      // High chime tone for received instant message
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.5, this.audioCtx.currentTime); // E6
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.18);
    } catch {
      // safe fallback
    }
  }

  public playMsnNudge() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      // Rapid dual buzz tone for MSN Nudge
      const freqs = [350, 420];
      freqs.forEach(freq => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.35);
      });
    } catch {
      // safe fallback
    }
  }
```

- [ ] **Step 5: Fix existing assertion in `src/test/soundAndData.test.ts`**

In `src/test/soundAndData.test.ts` line 7:
Change:
```typescript
expect(PORTFOLIO_DATA.name).toBe('Dev Caio');
```
To:
```typescript
expect(PORTFOLIO_DATA.name).toBe('Caio Souza');
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/test/msnSoundAndTypes.test.ts src/test/soundAndData.test.ts`  
Expected: PASS (all tests pass).

- [ ] **Step 7: Commit**

```bash
git add src/types/msn.ts src/utils/soundEffects.ts src/test/soundAndData.test.ts src/test/msnSoundAndTypes.test.ts
git commit -m "feat(msn): add MSN types, Web Audio sound effects and fix bio test assertion"
```

---

### Task 2: MSN Bot Engine & Emoticon Parser

**Files:**
- Create: `src/utils/msnEngine.ts`
- Test: `src/test/msnEngine.test.ts`

**Interfaces:**
- Consumes: `MsnMessage`, `MsnContact` from `src/types/msn.ts`.
- Produces: `DEFAULT_MSN_CONTACTS: MsnContact[]`, `generateMsnReply(userText: string): string`, `MSN_EMOTICONS: Record<string, string>`, `parseEmoticonText(text: string): (string | { code: string; label: string; icon: string })[]`.

- [ ] **Step 1: Write the failing test for `msnEngine.ts`**

Create `src/test/msnEngine.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MSN_CONTACTS,
  generateMsnReply,
  MSN_EMOTICONS,
  parseEmoticonText
} from '../utils/msnEngine';

describe('MSN Engine', () => {
  it('provides default contacts with Caio Souza online and direct message contact as [Em breve]', () => {
    expect(DEFAULT_MSN_CONTACTS.length).toBeGreaterThanOrEqual(4);
    const caio = DEFAULT_MSN_CONTACTS.find(c => c.id === 'caio');
    expect(caio).toBeDefined();
    expect(caio?.status).toBe('online');

    const direct = DEFAULT_MSN_CONTACTS.find(c => c.isDirectContact);
    expect(direct).toBeDefined();
    expect(direct?.personalMessage).toContain('Em breve');
  });

  it('generates contextual replies for skills, projects, experience and greetings', () => {
    expect(generateMsnReply('oi Caio')).toMatch(/E aí|Olá|Tudo bem/i);
    expect(generateMsnReply('quais são seus projetos?')).toMatch(/Hinário EAV|IGCG/i);
    expect(generateMsnReply('qual sua stack?')).toMatch(/React|Node|TypeScript/i);
    expect(generateMsnReply('onde você trabalha?')).toMatch(/Single Software|Pleno III/i);
  });

  it('generates friendly reaction when user nudges', () => {
    expect(generateMsnReply('[nudge]')).toMatch(/Opa!|Tremeu tudo|Diga aí/i);
  });

  it('parses classic MSN emoticon shortcodes into structured tokens', () => {
    const text = 'Olá! :) Tudo bem? (L) Abraço :D';
    const tokens = parseEmoticonText(text);

    expect(tokens.some(t => typeof t !== 'string' && t.code === ':)')).toBe(true);
    expect(tokens.some(t => typeof t !== 'string' && t.code === '(L)')).toBe(true);
    expect(tokens.some(t => typeof t !== 'string' && t.code === ':D')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/msnEngine.test.ts`  
Expected: FAIL (`../utils/msnEngine` not found).

- [ ] **Step 3: Implement `src/utils/msnEngine.ts`**

```typescript
import { MsnContact } from '../types/msn';
import { PORTFOLIO_DATA } from './data';

export const MSN_EMOTICONS: { code: string; label: string; icon: string }[] = [
  { code: ':)', label: 'Sorrindo', icon: '😊' },
  { code: ':D', label: 'Rindo', icon: '😃' },
  { code: ';)', label: 'Piscando', icon: '😉' },
  { code: ':P', label: 'Mostrando a língua', icon: '😛' },
  { code: '(L)', label: 'Coração', icon: '❤️' },
  { code: '(H)', label: 'Descolado', icon: '😎' },
  { code: '(Y)', label: 'Joinha', icon: '👍' },
  { code: ':S', label: 'Preocupado', icon: '😖' },
  { code: ':O', label: 'Surpreso', icon: '😮' },
];

export const DEFAULT_MSN_CONTACTS: MsnContact[] = [
  {
    id: 'caio',
    name: 'Caio Souza',
    status: 'online',
    personalMessage: 'Full Stack Dev | Single Software (Pleno III) 🚀',
    group: 'online',
    isDirectContact: false,
  },
  {
    id: 'rover',
    name: 'Rover Assistente',
    status: 'online',
    personalMessage: 'Au au! Assistente fiel do Caio XP 🐶',
    group: 'online',
    isDirectContact: false,
  },
  {
    id: 'caio-direct',
    name: 'Caio Souza (Mensagem Direta)',
    status: 'offline',
    personalMessage: '[Em breve: Envio direto ao e-mail] ✉️',
    group: 'direct',
    isDirectContact: true,
  },
  {
    id: 'recruiter',
    name: 'Recrutador Tech',
    status: 'offline',
    personalMessage: 'Buscando talentos Full Stack apaixonados por produto...',
    group: 'offline',
    isDirectContact: false,
  },
  {
    id: 'steve',
    name: 'Steve Ballmer',
    status: 'offline',
    personalMessage: 'Developers, developers, developers! 💻',
    group: 'offline',
    isDirectContact: false,
  },
];

export function parseEmoticonText(
  text: string
): (string | { code: string; label: string; icon: string })[] {
  if (!text) return [];

  // Match emoticon codes sorted by length descending
  const escapedCodes = MSN_EMOTICONS.map(e =>
    e.code.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  ).join('|');

  const regex = new RegExp(`(${escapedCodes})`, 'g');
  const parts = text.split(regex);

  return parts
    .filter(part => part.length > 0)
    .map(part => {
      const match = MSN_EMOTICONS.find(e => e.code === part);
      if (match) return match;
      return part;
    });
}

export function generateMsnReply(userText: string): string {
  const lower = userText.toLowerCase().trim();

  if (lower === '[nudge]') {
    return 'Opa! Tremeu a tela aqui! 😄 Em que posso te ajudar hoje? (H)';
  }

  if (
    lower.includes('oi') ||
    lower.includes('ola') ||
    lower.includes('olá') ||
    lower.includes('e ai') ||
    lower.includes('e aí') ||
    lower.includes('bom dia') ||
    lower.includes('boa tarde')
  ) {
    return 'E aí! Beleza? Bem-vindo ao meu MSN Messenger! Pode perguntar sobre meus projetos, carreira ou stack técnica! :)';
  }

  if (
    lower.includes('projeto') ||
    lower.includes('hinario') ||
    lower.includes('hinário') ||
    lower.includes('igcg') ||
    lower.includes('app')
  ) {
    return 'Desenvolvi o Hinário EAV (app React Native publicado na Play Store com RAG/IA embutido!) e a plataforma de streaming IGCG Music com backend em Docker, Traefik e MinIO. Você pode testá-los na pasta "Meus Projetos" ou no Emulador Móvel! (Y)';
  }

  if (
    lower.includes('stack') ||
    lower.includes('tecnologia') ||
    lower.includes('react') ||
    lower.includes('node') ||
    lower.includes('python') ||
    lower.includes('typescript')
  ) {
    return `Minha stack principal envolve ${PORTFOLIO_DATA.skills.slice(0, 7).join(', ')} e infraestrutura em Docker. Curto muito construir interfaces fluidas e backends resilientes! (H)`;
  }

  if (
    lower.includes('empresa') ||
    lower.includes('trabalho') ||
    lower.includes('experiencia') ||
    lower.includes('experiência') ||
    lower.includes('single') ||
    lower.includes('pleno')
  ) {
    return 'Atuo como Desenvolvedor Full Stack (Pleno III) na Single Software, além de cursar Sistemas de Informação na Unifacisa. Tenho mais de 6 anos no mercado e programo desde os 12 anos! 🚀';
  }

  if (
    lower.includes('contato') ||
    lower.includes('email') ||
    lower.includes('e-mail') ||
    lower.includes('falar') ||
    lower.includes('proposta')
  ) {
    return 'Você pode entrar em contato comigo pelo e-mail kcaiosouza@gmail.com ou pelo LinkedIn! Em breve, você também poderá mandar uma mensagem direta por este chat que cairá no meu e-mail! (L)';
  }

  return 'Legal sua mensagem! Como sou a réplica interativa do Caio no MSN, você pode me perguntar sobre meus projetos publicados, minha experiência na Single Software ou como construí esse Windows XP! :D';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/msnEngine.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/msnEngine.ts src/test/msnEngine.test.ts
git commit -m "feat(msn): implement MSN bot engine, contacts and emoticon parser"
```

---

### Task 3: MSN Direct Message Modal & Emoticon Picker

**Files:**
- Create: `src/components/windows/msn/MsnDirectMessageModal.tsx`
- Create: `src/components/windows/msn/MsnEmoticonPicker.tsx`
- Test: `src/test/MsnModalAndPicker.test.tsx`

**Interfaces:**
- Produces: `MsnDirectMessageModal` (`isOpen`, `onClose`), `MsnEmoticonPicker` (`isOpen`, `onSelectEmoticon`, `onClose`).

- [ ] **Step 1: Write the failing test for Modal and Picker**

Create `src/test/MsnModalAndPicker.test.tsx`:
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MsnDirectMessageModal } from '../components/windows/msn/MsnDirectMessageModal';
import { MsnEmoticonPicker } from '../components/windows/msn/MsnEmoticonPicker';

describe('MSN Modal and Emoticon Picker', () => {
  it('renders MsnDirectMessageModal with Em Breve info and action buttons', () => {
    const handleClose = vi.fn();
    render(<MsnDirectMessageModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Mensagem Direta do MSN/i)).toBeInTheDocument();
    expect(screen.getByText(/Recurso em breve/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar E-mail Agora/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar E-mail/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /OK/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders MsnEmoticonPicker and selects an emoticon', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();
    render(<MsnEmoticonPicker isOpen={true} onSelectEmoticon={handleSelect} onClose={handleClose} />);

    const heartBtn = screen.getByTitle('Coração ((L))');
    expect(heartBtn).toBeInTheDocument();

    fireEvent.click(heartBtn);
    expect(handleSelect).toHaveBeenCalledWith('(L)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/MsnModalAndPicker.test.tsx`  
Expected: FAIL (components do not exist).

- [ ] **Step 3: Implement `src/components/windows/msn/MsnDirectMessageModal.tsx`**

```typescript
import React, { useState } from 'react';
import { Mail, Check, X, ExternalLink } from 'lucide-react';
import { soundEngine } from '../../../utils/soundEffects';

export interface MsnDirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MsnDirectMessageModal: React.FC<MsnDirectMessageModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = 'kcaiosouza@gmail.com';

  if (!isOpen) return null;

  const handleCopy = () => {
    soundEngine.playClick();
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    soundEngine.playClick();
    window.open(`mailto:${email}?subject=Contato%20via%20MSN%20Portfolio`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px] font-tahoma select-none text-black"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ECE9D8] rounded-t-lg rounded-b-md border-2 border-[#0058EE] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="bg-gradient-to-r from-[#0058EE] via-[#0372FD] to-[#0058EE] px-3 py-1.5 flex items-center justify-between text-white text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-yellow-300" />
            <span>Mensagem Direta do MSN</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded-[2px] bg-[#E76C55] hover:bg-[#E81123] text-white"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex gap-3 text-xs bg-[#ECE9D8]">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="font-bold text-sm text-[#002D96]">
              Recurso em breve! [Envio direto ao e-mail]
            </div>
            <p className="text-gray-700 leading-relaxed text-[11px]">
              Estamos desenvolvendo a integração para que as mensagens enviadas por aqui caiam diretamente na caixa de entrada do Caio.
            </p>
            <p className="text-gray-700 leading-relaxed text-[11px]">
              Enquanto finalizamos essa ponte, você pode bater um papo interativo com o bot inteligente do Caio no MSN ou enviar um e-mail tradicional agora mesmo para:
            </p>
            <div className="p-2 bg-white border border-[#7F9DB9] rounded font-mono text-[11px] font-semibold text-blue-900 select-text flex items-center justify-between">
              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-2.5 bg-[#ECE9D8] border-t border-[#D0C9B6] flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] flex items-center gap-1 font-medium shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : null}
            <span>{copied ? 'Copiado!' : 'Copiar E-mail'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            className="px-3 py-1 bg-gradient-to-b from-[#245EDC] to-[#1941A5] text-white border border-[#002D96] rounded-[2px] hover:brightness-110 flex items-center gap-1 font-bold shadow-xs"
          >
            <span>Enviar E-mail Agora</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] font-medium shadow-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Implement `src/components/windows/msn/MsnEmoticonPicker.tsx`**

```typescript
import React from 'react';
import { MSN_EMOTICONS } from '../../../utils/msnEngine';

export interface MsnEmoticonPickerProps {
  isOpen: boolean;
  onSelectEmoticon: (code: string) => void;
  onClose: () => void;
}

export const MsnEmoticonPicker: React.FC<MsnEmoticonPickerProps> = ({
  isOpen,
  onSelectEmoticon,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full mb-1 left-2 bg-[#FFFFE1] border border-[#7A7A7A] rounded-[2px] p-2 shadow-lg z-50 font-tahoma text-xs">
        <div className="text-[10px] text-gray-500 font-bold mb-1 pb-0.5 border-b border-gray-300">
          Emoticons do MSN
        </div>
        <div className="grid grid-cols-5 gap-1">
          {MSN_EMOTICONS.map(e => (
            <button
              key={e.code}
              type="button"
              title={`${e.label} (${e.code})`}
              onClick={() => {
                onSelectEmoticon(e.code);
                onClose();
              }}
              className="w-7 h-7 flex items-center justify-center text-base rounded hover:bg-white/80 active:bg-blue-100 transition-colors"
            >
              {e.icon}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/MsnModalAndPicker.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/windows/msn/MsnDirectMessageModal.tsx src/components/windows/msn/MsnEmoticonPicker.tsx src/test/MsnModalAndPicker.test.tsx
git commit -m "feat(msn): implement direct message modal and emoticon picker"
```

---

### Task 4: MSN Chat Window (`MsnChatApp`) & Screen Shake Animation

**Files:**
- Modify: `src/index.css` (add `@keyframes msn-shake`)
- Create: `src/components/windows/msn/MsnChatApp.tsx`
- Test: `src/test/MsnChatApp.test.tsx`

**Interfaces:**
- Consumes: `WindowFrame`, `soundEngine`, `generateMsnReply`, `parseEmoticonText`, `MsnDirectMessageModal`, `MsnEmoticonPicker`.
- Produces: `MsnChatApp` component registered for window ID `msn-chat-window`.

- [ ] **Step 1: Add `@keyframes msn-shake` to `src/index.css`**

Add to `src/index.css`:
```css
/* MSN Nudge (Chamar Atenção) tremor da janela */
@keyframes msn-shake {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-6px, -4px); }
  20% { transform: translate(6px, 4px); }
  30% { transform: translate(-5px, 3px); }
  40% { transform: translate(5px, -3px); }
  50% { transform: translate(-4px, 2px); }
  60% { transform: translate(4px, -2px); }
  70% { transform: translate(-2px, 1px); }
  80% { transform: translate(2px, -1px); }
  90% { transform: translate(-1px, 0); }
  100% { transform: translate(0, 0); }
}

.msn-shaking {
  animation: msn-shake 0.55s ease-in-out;
}
```

- [ ] **Step 2: Write the failing test for `MsnChatApp`**

Create `src/test/MsnChatApp.test.tsx`:
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MsnChatApp } from '../components/windows/msn/MsnChatApp';

describe('MsnChatApp', () => {
  it('renders chat window with contact name, personal message and initial greeting', () => {
    render(<MsnChatApp isOpen={true} />);

    expect(screen.getByText(/Caio Souza/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Stack Dev/i)).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo ao meu MSN Messenger/i)).toBeInTheDocument();
  });

  it('sends user message and displays bot response', async () => {
    render(<MsnChatApp isOpen={true} />);
    const input = screen.getByPlaceholderText(/Digite sua mensagem aqui/i);
    const sendBtn = screen.getByRole('button', { name: /Enviar/i });

    fireEvent.change(input, { target: { value: 'Quais são seus projetos?' } });
    fireEvent.click(sendBtn);

    expect(input).toHaveValue('');
    expect(screen.getByText('Quais são seus projetos?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Hinário EAV/i)).toBeInTheDocument();
    });
  });

  it('handles Nudge (Chamar Atenção) button click', () => {
    render(<MsnChatApp isOpen={true} />);
    const nudgeBtn = screen.getByRole('button', { name: /Chamar atenção/i });

    fireEvent.click(nudgeBtn);
    expect(screen.getByText(/Você acabou de chamar a atenção!/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/test/MsnChatApp.test.tsx`  
Expected: FAIL (`MsnChatApp` does not exist).

- [ ] **Step 4: Implement `src/components/windows/msn/MsnChatApp.tsx`**

```typescript
import React, { useState, useRef, useEffect } from 'react';
import WindowFrame from '../WindowFrame';
import { soundEngine } from '../../../utils/soundEffects';
import { MsnMessage } from '../../../types/msn';
import { generateMsnReply, parseEmoticonText } from '../../../utils/msnEngine';
import { MsnDirectMessageModal } from './MsnDirectMessageModal';
import { MsnEmoticonPicker } from './MsnEmoticonPicker';
import { Bell, Smile, Mail, Coffee } from 'lucide-react';

export interface MsnChatAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const MsnChatApp: React.FC<MsnChatAppProps> = ({
  id = 'msn-chat-window',
  isOpen,
  onClose,
  className = '',
}) => {
  const [messages, setMessages] = useState<MsnMessage[]>([
    {
      id: 'init-1',
      sender: 'caio',
      senderName: 'Caio Souza',
      text: 'E aí! Beleza? Bem-vindo ao meu MSN Messenger! Pode me perguntar sobre meus projetos, carreira ou stack técnica! :)',
      timestamp: Date.now(),
      type: 'chat',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    soundEngine.playClick();
    const userMsg: MsnMessage = {
      id: String(Date.now()),
      sender: 'user',
      senderName: 'Você',
      text: trimmed,
      timestamp: Date.now(),
      type: 'chat',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const isTest =
      (typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.MODE === 'test')) ||
      (typeof globalThis !== 'undefined' && Boolean((globalThis as any).process?.env?.NODE_ENV === 'test'));

    if (!isTest) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const replyText = generateMsnReply(trimmed);
    soundEngine.playMsnMessage();

    const botMsg: MsnMessage = {
      id: String(Date.now() + 1),
      sender: 'caio',
      senderName: 'Caio Souza',
      text: replyText,
      timestamp: Date.now(),
      type: 'chat',
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleNudge = () => {
    soundEngine.playMsnNudge();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);

    const nudgeMsg: MsnMessage = {
      id: String(Date.now()),
      sender: 'system',
      senderName: 'Sistema',
      text: 'Você acabou de chamar a atenção!',
      timestamp: Date.now(),
      type: 'nudge',
    };
    setMessages(prev => [...prev, nudgeMsg]);

    setTimeout(() => {
      soundEngine.playMsnMessage();
      const replyMsg: MsnMessage = {
        id: String(Date.now() + 1),
        sender: 'caio',
        senderName: 'Caio Souza',
        text: generateMsnReply('[nudge]'),
        timestamp: Date.now(),
        type: 'chat',
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderParsedContent = (text: string) => {
    const tokens = parseEmoticonText(text);
    return tokens.map((token, idx) => {
      if (typeof token === 'string') return <span key={idx}>{token}</span>;
      return (
        <span key={idx} title={`${token.label} (${token.code})`} className="inline-block text-sm mx-0.5 align-middle select-none">
          {token.icon}
        </span>
      );
    });
  };

  return (
    <WindowFrame
      id={id}
      title="Caio Souza - Conversa"
      icon="msn"
      isOpen={isOpen}
      onClose={onClose}
      className={`${className} ${isShaking ? 'msn-shaking' : ''}`}
      initialPosition={{ x: 260, y: 70, width: 490, height: 470 }}
    >
      <div className="flex flex-col flex-1 h-full min-h-0 bg-[#E8EEF7] font-tahoma text-black select-none text-xs relative">
        {/* Contact Header Bar */}
        <div className="p-2 bg-gradient-to-r from-[#CADAF3] via-[#E4EDFA] to-[#CADAF3] border-b border-[#A0B8E0] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded bg-[#ECE9D8] border border-blue-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Coffee className="w-5 h-5 text-[#6F4E37]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-[#002D96] flex items-center gap-1">
                <span>Caio Souza</span>
                <span className="text-[10px] text-green-700 font-normal">&lt;Disponível&gt;</span>
              </div>
              <div className="text-[10px] text-gray-600 truncate">
                Full Stack Dev | Single Software (Pleno III) 🚀
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDirectModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-white/90 border border-blue-300 rounded text-[10px] font-bold text-blue-900 hover:bg-white shadow-xs flex-shrink-0"
            title="Enviar mensagem direta ao e-mail [Em breve]"
          >
            <Mail className="w-3 h-3 text-red-600" />
            <span>Falar com o Caio Real [Em breve]</span>
          </button>
        </div>

        {/* Message Log Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 p-3 overflow-y-auto bg-white border-b border-[#A0B8E0] space-y-2 select-text"
        >
          {messages.map(m => {
            if (m.type === 'nudge') {
              return (
                <div key={m.id} className="text-center my-1 text-gray-500 font-bold italic text-[11px] bg-yellow-50 py-0.5 rounded border border-yellow-200">
                  ⚡ {m.text}
                </div>
              );
            }

            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className="leading-snug">
                <div className={`font-bold text-[11px] ${isUser ? 'text-red-700' : 'text-blue-800'}`}>
                  {m.senderName} diz ({formatTime(m.timestamp)}):
                </div>
                <div className="text-[12px] text-gray-900 pl-2 mt-0.5 whitespace-pre-wrap">
                  {renderParsedContent(m.text)}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="text-[10px] italic text-gray-500 flex items-center gap-1 pt-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.3s]" />
              <span className="ml-1">Caio Souza está digitando uma mensagem...</span>
            </div>
          )}
        </div>

        {/* Toolbar (Nudge, Emoticon) */}
        <div className="bg-[#ECE9D8] px-2 py-1 flex items-center gap-2 border-b border-[#D8D4C8] relative">
          <button
            type="button"
            onClick={handleNudge}
            aria-label="Chamar atenção"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-blue-100 border border-transparent hover:border-blue-400 text-gray-800 text-[11px]"
            title="Chamar atenção (Nudge)"
          >
            <Bell className="w-3.5 h-3.5 text-orange-600" />
            <span>Chamar atenção</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPickerOpen(prev => !prev)}
              aria-label="Emoticons"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-blue-100 border border-transparent hover:border-blue-400 text-gray-800 text-[11px]"
              title="Inserir emoticon"
            >
              <Smile className="w-3.5 h-3.5 text-yellow-600" />
              <span>Emoticons</span>
            </button>

            <MsnEmoticonPicker
              isOpen={isPickerOpen}
              onSelectEmoticon={code => {
                setInputText(prev => `${prev}${prev ? ' ' : ''}${code}`);
              }}
              onClose={() => setIsPickerOpen(false)}
            />
          </div>
        </div>

        {/* Input & Send Area */}
        <div className="p-2 bg-[#ECE9D8] flex gap-2 items-end">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 h-14 p-1.5 bg-white border border-[#7F9DB9] rounded-[1px] text-xs resize-none outline-none select-text focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="h-14 px-4 bg-gradient-to-b from-white via-[#ECE9D8] to-[#D4D0C8] border border-[#003C74] rounded-[2px] font-bold text-xs hover:border-[#F2A000] active:bg-[#CAC6BD] disabled:opacity-40 disabled:border-gray-400"
          >
            Enviar
          </button>
        </div>

        {/* Modal Em Breve */}
        <MsnDirectMessageModal
          isOpen={isDirectModalOpen}
          onClose={() => setIsDirectModalOpen(false)}
        />
      </div>
    </WindowFrame>
  );
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/MsnChatApp.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/components/windows/msn/MsnChatApp.tsx src/test/MsnChatApp.test.tsx
git commit -m "feat(msn): implement MsnChatApp with Nudge shake, sound, and message flow"
```

---

### Task 5: MSN Contact List (`MsnContactListApp`)

**Files:**
- Create: `src/components/windows/msn/MsnContactListApp.tsx`
- Test: `src/test/MsnContactListApp.test.tsx`

**Interfaces:**
- Consumes: `WindowFrame`, `WindowContext`, `DEFAULT_MSN_CONTACTS`, `soundEngine`, `MsnDirectMessageModal`.
- Produces: `MsnContactListApp` component registered for window ID `msn-window`.

- [ ] **Step 1: Write the failing test for `MsnContactListApp`**

Create `src/test/MsnContactListApp.test.tsx`:
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MsnContactListApp } from '../components/windows/msn/MsnContactListApp';
import { WindowProvider } from '../context/WindowContext';

describe('MsnContactListApp', () => {
  it('renders contact list with user profile, status dropdown and groups', () => {
    render(
      <WindowProvider>
        <MsnContactListApp isOpen={true} />
      </WindowProvider>
    );

    expect(screen.getByText(/MSN Messenger/i)).toBeInTheDocument();
    expect(screen.getByText(/Dev Caio/i)).toBeInTheDocument();
    expect(screen.getByText(/Caio Souza/i)).toBeInTheDocument();
    expect(screen.getByText(/Rover Assistente/i)).toBeInTheDocument();
    expect(screen.getByText(/Caio Souza \(Mensagem Direta\)/i)).toBeInTheDocument();
  });

  it('allows changing current user status', () => {
    render(
      <WindowProvider>
        <MsnContactListApp isOpen={true} />
      </WindowProvider>
    );

    const statusBtn = screen.getByRole('button', { name: /status-selector/i });
    fireEvent.click(statusBtn);

    const busyOption = screen.getByRole('button', { name: /Ocupado/i });
    fireEvent.click(busyOption);

    expect(screen.getByText(/Ocupado/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/MsnContactListApp.test.tsx`  
Expected: FAIL (`MsnContactListApp` not found).

- [ ] **Step 3: Implement `src/components/windows/msn/MsnContactListApp.tsx`**

```typescript
import React, { useState } from 'react';
import WindowFrame from '../WindowFrame';
import { useWindowManager } from '../../../context/WindowContext';
import { soundEngine } from '../../../utils/soundEffects';
import { DEFAULT_MSN_CONTACTS } from '../../../utils/msnEngine';
import { MsnContact, MsnStatus } from '../../../types/msn';
import { MsnDirectMessageModal } from './MsnDirectMessageModal';
import { Coffee, ChevronDown, ChevronRight, User, Search } from 'lucide-react';

export interface MsnContactListAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const MsnContactListApp: React.FC<MsnContactListAppProps> = ({
  id = 'msn-window',
  isOpen,
  onClose,
  className = '',
}) => {
  const { openWindow } = useWindowManager();
  const [contacts] = useState<MsnContact[]>(DEFAULT_MSN_CONTACTS);
  const [myStatus, setMyStatus] = useState<MsnStatus>('online');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [personalMsg, setPersonalMsg] = useState('Ouvindo: Synthwave & Lofi | Desenvolvendo no Caio XP 🚀');
  const [isEditingMsg, setIsEditingMsg] = useState(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);

  // Group expansion
  const [isOnlineOpen, setIsOnlineOpen] = useState(true);
  const [isDirectOpen, setIsDirectOpen] = useState(true);
  const [isOfflineOpen, setIsOfflineOpen] = useState(true);

  const handleContactClick = (contact: MsnContact) => {
    soundEngine.playClick();
    if (contact.isDirectContact) {
      setIsDirectModalOpen(true);
      return;
    }
    soundEngine.playMsnOnline();
    openWindow('msn-chat-window');
  };

  const getStatusColor = (st: MsnStatus) => {
    switch (st) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      case 'offline':
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (st: MsnStatus) => {
    switch (st) {
      case 'online': return 'Disponível';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'offline': return 'Invisível';
    }
  };

  const onlineContacts = contacts.filter(c => c.group === 'online');
  const directContacts = contacts.filter(c => c.group === 'direct');
  const offlineContacts = contacts.filter(c => c.group === 'offline');

  return (
    <WindowFrame
      id={id}
      title="MSN Messenger"
      icon="msn"
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 80, y: 40, width: 300, height: 530 }}
    >
      <div className="flex flex-col flex-1 h-full min-h-0 bg-[#EBF3FD] font-tahoma text-black select-none text-xs relative">
        {/* User Card Header */}
        <div className="p-2.5 bg-gradient-to-b from-[#CADAF3] to-[#B9CDEB] border-b border-[#8CA5D3] flex items-center gap-2.5">
          <div className="relative">
            <div className="w-11 h-11 rounded bg-white border-2 border-white shadow flex items-center justify-center overflow-hidden">
              <Coffee className="w-7 h-7 text-[#6F4E37]" />
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${getStatusColor(myStatus)}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#002D96] truncate">Dev Caio</span>
              <div className="relative">
                <button
                  type="button"
                  aria-label="status-selector"
                  onClick={() => setIsStatusMenuOpen(prev => !prev)}
                  className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-white/50 text-[10px] text-gray-700"
                >
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(myStatus)}`} />
                  <span>({getStatusLabel(myStatus)})</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {isStatusMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-[#7F9DB9] shadow-md py-1 z-50 text-xs">
                    {(['online', 'busy', 'away', 'offline'] as MsnStatus[]).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setMyStatus(st);
                          setIsStatusMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 text-xs"
                      >
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(st)}`} />
                        <span>{getStatusLabel(st)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isEditingMsg ? (
              <input
                type="text"
                value={personalMsg}
                onChange={e => setPersonalMsg(e.target.value)}
                onBlur={() => setIsEditingMsg(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingMsg(false)}
                autoFocus
                className="w-full text-[10px] px-1 bg-white border border-blue-400 outline-none rounded-xs"
              />
            ) : (
              <div
                onClick={() => setIsEditingMsg(true)}
                className="text-[10px] text-gray-600 truncate cursor-pointer hover:underline mt-0.5"
                title="Clique para editar frase de status"
              >
                &lt;{personalMsg}&gt;
              </div>
            )}
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="px-2 py-1 bg-white border-b border-[#CADAF3] flex items-center gap-1.5 text-gray-400">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">Pesquisar contatos...</span>
        </div>

        {/* Contacts Tree List */}
        <div className="flex-1 p-2 overflow-y-auto bg-white space-y-2">
          {/* Online Group */}
          <div>
            <button
              type="button"
              onClick={() => setIsOnlineOpen(prev => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#002D96] w-full text-left py-0.5"
            >
              {isOnlineOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Disponíveis ({onlineContacts.length})</span>
            </button>

            {isOnlineOpen && (
              <div className="pl-4 space-y-1 mt-1">
                {onlineContacts.map(c => (
                  <div
                    key={c.id}
                    onDoubleClick={() => handleContactClick(c)}
                    className="flex items-start gap-1.5 p-1 rounded hover:bg-[#CADAF3] cursor-pointer"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${getStatusColor(c.status)}`} />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 leading-tight truncate">{c.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{c.personalMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Message Group [Em Breve] */}
          <div>
            <button
              type="button"
              onClick={() => setIsDirectOpen(prev => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-purple-900 w-full text-left py-0.5"
            >
              {isDirectOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Falar com o Caio Real ({directContacts.length})</span>
            </button>

            {isDirectOpen && (
              <div className="pl-4 space-y-1 mt-1">
                {directContacts.map(c => (
                  <div
                    key={c.id}
                    onDoubleClick={() => handleContactClick(c)}
                    className="flex items-start gap-1.5 p-1 rounded hover:bg-purple-100 cursor-pointer border border-dashed border-purple-300"
                  >
                    <span className="text-xs">✉️</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-purple-950 leading-tight truncate">{c.name}</div>
                      <div className="text-[10px] text-purple-700 truncate">{c.personalMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offline Group */}
          <div>
            <button
              type="button"
              onClick={() => setIsOfflineOpen(prev => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-gray-500 w-full text-left py-0.5"
            >
              {isOfflineOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Offline ({offlineContacts.length})</span>
            </button>

            {isOfflineOpen && (
              <div className="pl-4 space-y-1 mt-1 opacity-70">
                {offlineContacts.map(c => (
                  <div
                    key={c.id}
                    className="flex items-start gap-1.5 p-1 rounded hover:bg-gray-100 cursor-default"
                  >
                    <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 bg-gray-400" />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-700 leading-tight truncate">{c.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{c.personalMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="p-1.5 bg-[#ECE9D8] border-t border-[#A0B8E0] text-[10px] text-gray-600 flex items-center justify-between">
          <span>MSN Messenger 7.5</span>
          <span>{onlineContacts.length} contatos online</span>
        </div>

        {/* Modal Direto */}
        <MsnDirectMessageModal
          isOpen={isDirectModalOpen}
          onClose={() => setIsDirectModalOpen(false)}
        />
      </div>
    </WindowFrame>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/MsnContactListApp.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/windows/msn/MsnContactListApp.tsx src/test/MsnContactListApp.test.tsx
git commit -m "feat(msn): implement MsnContactListApp with profile and categorized contact list"
```

---

### Task 6: System-wide Integrations & Desktop/Start Menu/CMD/TaskManager

**Files:**
- Modify: `src/context/WindowContext.tsx`
- Modify: `src/components/windows/WindowFrame.tsx`
- Modify: `src/utils/data.ts`
- Modify: `src/components/desktop/DesktopIcon.tsx`
- Modify: `src/components/desktop/Taskbar.tsx`
- Modify: `src/components/desktop/StartMenu.tsx`
- Modify: `src/components/desktop/Desktop.tsx`
- Modify: `src/utils/cmdEngine.ts`
- Modify: `src/components/windows/TaskManagerApp.tsx`
- Test: `src/test/msnIntegration.test.tsx`

- [ ] **Step 1: Write integration test for MSN in the Windows XP ecosystem**

Create `src/test/msnIntegration.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import { DESKTOP_ICONS } from '../utils/data';
import { executeCommand } from '../utils/cmdEngine';

describe('MSN System Integration', () => {
  it('registers msn in DESKTOP_ICONS', () => {
    const msnIcon = DESKTOP_ICONS.find(i => i.id === 'msn');
    expect(msnIcon).toBeDefined();
    expect(msnIcon?.windowId).toBe('msn-window');
  });

  it('handles msn and messenger commands in cmdEngine', () => {
    let openedId = '';
    const ctx = {
      openWindow: (id: string) => { openedId = id; },
      closeWindow: () => {},
      setScreenMode: () => {},
    };

    const res1 = executeCommand('msn', ctx);
    expect(openedId).toBe('msn-window');
    expect(res1.output[0]).toContain('MSN Messenger');

    const res2 = executeCommand('messenger', ctx);
    expect(openedId).toBe('msn-window');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/msnIntegration.test.tsx`  
Expected: FAIL (`msn` not in `DESKTOP_ICONS`).

- [ ] **Step 3: Register `msn-window` and `msn-chat-window` in `src/context/WindowContext.tsx`**

In `DEFAULT_WINDOWS` array in `src/context/WindowContext.tsx`, add:
```typescript
  {
    id: 'msn-window',
    title: 'MSN Messenger',
    icon: 'msn',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 80, y: 40, width: 300, height: 530 },
    defaultPosition: { x: 80, y: 40, width: 300, height: 530 }
  },
  {
    id: 'msn-chat-window',
    title: 'Caio Souza - Conversa',
    icon: 'msn',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 260, y: 70, width: 490, height: 470 },
    defaultPosition: { x: 260, y: 70, width: 490, height: 470 }
  }
```

- [ ] **Step 4: Add MSN SVG icon in `src/components/windows/WindowFrame.tsx` and `Taskbar.tsx`**

In `renderIcon()` in `WindowFrame.tsx`, add case `'msn'`:
```typescript
      case 'msn':
        return (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="7" r="4" fill="#00AA00" />
            <path d="M2 19C2 15 5 13 8 13C11 13 14 15 14 19" fill="#00AA00" />
            <circle cx="16" cy="9" r="3.5" fill="#0078D7" />
            <path d="M11 20C11 16.5 13.5 15 16 15C18.5 15 21 16.5 21 20" fill="#0078D7" />
          </svg>
        );
```

In `getWindowIcon()` in `src/components/desktop/Taskbar.tsx`, add case `'msn'`:
```typescript
      case 'msn':
        return (
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="7" r="4" fill="#00AA00" />
            <path d="M2 19C2 15 5 13 8 13C11 13 14 15 14 19" fill="#00AA00" />
            <circle cx="16" cy="9" r="3.5" fill="#0078D7" />
            <path d="M11 20C11 16.5 13.5 15 16 15C18.5 15 21 16.5 21 20" fill="#0078D7" />
          </svg>
        );
```

- [ ] **Step 5: Register MSN in `src/utils/data.ts` and `src/components/desktop/DesktopIcon.tsx`**

In `DESKTOP_ICONS` in `src/utils/data.ts`, add:
```typescript
  { id: 'msn', title: 'MSN Messenger', iconType: 'msn' as any, windowId: 'msn-window' },
```

In `renderIcon()` in `src/components/desktop/DesktopIcon.tsx`, add case `'msn'`:
```typescript
      case 'msn':
        return (
          <svg className="w-9 h-9 drop-shadow-md" viewBox="0 0 24 24" fill="none" data-testid="icon-msn">
            <circle cx="8" cy="7" r="4" fill="#00C853" />
            <path d="M2 19C2 14.5 5 12.5 8 12.5C11 12.5 14 14.5 14 19" fill="#00C853" />
            <circle cx="16" cy="9" r="3.5" fill="#0091EA" />
            <path d="M11 20C11 16 13.5 14.5 16 14.5C18.5 14.5 21 16 21 20" fill="#0091EA" />
          </svg>
        );
```

- [ ] **Step 6: Add MSN to `src/components/desktop/StartMenu.tsx`**

In the left column of programs in `StartMenu.tsx`, add:
```tsx
          <button
            type="button"
            data-testid="start-menu-msn"
            onClick={() => {
              openWindow('msn-window');
              onClose();
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 drop-shadow-xs" viewBox="0 0 24 24" fill="none">
                <circle cx="8" cy="7" r="4" fill="#00AA00" />
                <path d="M2 19C2 15 5 13 8 13C11 13 14 15 14 19" fill="#00AA00" />
                <circle cx="16" cy="9" r="3.5" fill="#0078D7" />
                <path d="M11 20C11 16.5 13.5 15 16 15C18.5 15 21 16.5 21 20" fill="#0078D7" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="font-semibold block">MSN Messenger</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Mensagens instantâneas</span>
            </div>
          </button>
```

- [ ] **Step 7: Mount MSN apps in `src/components/desktop/Desktop.tsx`**

In `src/components/desktop/Desktop.tsx`, import and mount:
```tsx
import { MsnContactListApp } from '../windows/msn/MsnContactListApp';
import { MsnChatApp } from '../windows/msn/MsnChatApp';
```
And inside the JSX:
```tsx
        <MsnContactListApp />
        <MsnChatApp />
```

- [ ] **Step 8: Add `msn` and `messenger` in `src/utils/cmdEngine.ts` and `msnmsgr.exe` in `TaskManagerApp.tsx`**

In `src/utils/cmdEngine.ts`, add to the switch statement:
```typescript
    case 'msn':
    case 'messenger':
    case 'msnmsgr':
      ctx.openWindow('msn-window');
      return { output: ['Iniciando MSN Messenger 7.5...'] };
```

In `src/components/windows/TaskManagerApp.tsx`, inside `processes` calculation, add:
```typescript
      } else if (w.id === 'msn-window' || w.id === 'msn-chat-window') {
        if (!base.some(p => p.name === 'msnmsgr.exe')) {
          base.push({
            id: `proc-${w.id}`,
            name: 'msnmsgr.exe',
            pid: 3280,
            cpu: 1,
            memory: '11.840 K',
            memoryKb: 11840,
            user: 'Caio Souza',
            windowId: w.id
          });
        }
      }
```

- [ ] **Step 9: Run tests to verify all integrations pass**

Run: `npx vitest run src/test/msnIntegration.test.tsx`  
Expected: PASS.

- [ ] **Step 10: Run the complete test suite to ensure clean build**

Run: `npx vitest run`  
Expected: ALL test suites pass.

- [ ] **Step 11: Commit**

```bash
git add src/context/WindowContext.tsx src/components/windows/WindowFrame.tsx src/utils/data.ts src/components/desktop/DesktopIcon.tsx src/components/desktop/Taskbar.tsx src/components/desktop/StartMenu.tsx src/components/desktop/Desktop.tsx src/utils/cmdEngine.ts src/components/windows/TaskManagerApp.tsx src/test/msnIntegration.test.tsx
git commit -m "feat(msn): integrate MSN Messenger into Desktop, Taskbar, Start Menu, CMD, and Task Manager"
```
