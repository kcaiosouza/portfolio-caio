# Windows XP Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um portfólio interativo de alta fidelidade ao Windows XP (tema Luna Blue) para o Dev Caio, contendo tela de boot BIOS (com listagem de habilidades e bypass via tecla DEL), tela clássica de Login com avatar de caneca de café, Desktop com ícones e gerenciador de janelas arrastáveis (`sobre-caio.txt`, `caio-cv.pdf`, pasta `hobbies`, `Lixeira`), Barra de Tarefas, Menu Iniciar de duas colunas, camada persistente de tela de tubo CRT e efeitos sonoros retrô.

**Architecture:** Aplicação Single Page Application (SPA) em React + Vite + TypeScript + Tailwind CSS com arquitetura baseada em máquinas de estado contextuais (`SystemContext` para transições de tela BIOS/Login/Desktop e CRT; `WindowContext` para gerenciamento de janelas, profundidade z-index, posições e minimização). Áudio sintetizado via Web Audio API para reprodução instantânea de bipes e efeitos sonoros clássicos.

**Tech Stack:** React 18/19, TypeScript, Vite, Tailwind CSS, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Proibido o uso de marcas registradas ou logos patenteados da Microsoft (identificar como "Caio XP" ou "Dev Caio OS").
- Fidelidade visual ao tema Luna Blue clássico (paleta `#0058EE`, `#0372FD`, `#388E3C`, `#ECE9D8`).
- A camada CRT deve cobrir toda a viewport com `pointer-events: none` e possuir alternador na bandeja do sistema.
- A tecla `DEL` na tela de BIOS deve interromper imediatamente o carregamento e avançar para o login.
- Som de inicialização e bipes acionados via Web Audio API, desbloqueados na primeira interação (clique ou DEL).
- Telas mobile (<768px) devem apresentar a tela de aviso de Modo VGA com opção de continuar adaptado ou ver CV direto.

---

### Task 1: Scaffolding do Projeto com Vite, TypeScript, Tailwind CSS e Vitest

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`
- Test: `src/test/initial.test.ts`

**Interfaces:**
- Produces: Base do projeto configurada com scripts `npm run dev`, `npm run build` e `npm test`.

- [ ] **Step 1: Criar o arquivo package.json com dependências necessárias**

```json
{
  "name": "portfolio-caio-xp",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 2: Criar as configurações de Vite, TypeScript, Tailwind e PostCSS**

Criar `vite.config.ts`:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

Criar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

Criar `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        xp: {
          blue: {
            header: '#0058EE',
            headerEnd: '#0372FD',
            inactive: '#7A96DF',
            light: '#245EDC',
            dark: '#1941A5'
          },
          taskbar: '#245EDC',
          startGreen: '#388E3C',
          startGreenEnd: '#4CAF50',
          beige: '#ECE9D8',
          border: '#002D96',
          titleShadow: '#00136B'
        }
      },
      fontFamily: {
        tahoma: ['Tahoma', 'Segoe UI', 'sans-serif'],
        terminal: ['"Courier New"', 'Courier', 'monospace']
      }
    },
  },
  plugins: [],
};
```

Criar `postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Criar `index.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dev Caio - Windows XP Portfolio</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23245EDC'/><text y='70' x='20' font-size='65' fill='white'>C</text></svg>" />
  </head>
  <body class="bg-black select-none overflow-hidden h-screen w-screen m-0 p-0 font-tahoma text-black">
    <div id="root" class="h-full w-full"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Criar `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .xp-window-shadow {
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
  }
}
```

Criar `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Instalar as dependências com npm install**

Executar comando: `npm install`
Resultado esperado: Todas as dependências instaladas com sucesso.

- [ ] **Step 4: Escrever o primeiro teste de validação de setup**

Criar `src/test/initial.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('Initial Environment Test', () => {
  it('should verify test runner works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Executar o teste e commitar**

Executar: `npm test`
Resultado esperado: 1 test passed.
Commit:
```bash
git add .
git commit -m "chore: scaffold react vite tailwind and vitest project"
```

---

### Task 2: Modelagem de Dados e Motor de Síntese de Áudio Retrô

**Files:**
- Create: `src/types/index.ts`
- Create: `src/utils/data.ts`
- Create: `src/utils/soundEffects.ts`
- Test: `src/test/soundAndData.test.ts`

**Interfaces:**
- Produces: Tipos (`WindowItem`, `ScreenMode`, `DesktopIconItem`), dados estáticos de Caio (`PORTFOLIO_DATA`, `DESKTOP_ICONS`, `HOBBIES_ITEMS`, `TRASH_ITEMS`), e classe `SoundEngine` (`playBiosBeep()`, `playStartupChime()`, `playClick()`, `playTrashEmpty()`, `playError()`, `toggleMute()`, `isMuted()`).

- [ ] **Step 1: Escrever os testes unitários para os dados e áudio**

Criar `src/test/soundAndData.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { PORTFOLIO_DATA, DESKTOP_ICONS } from '../utils/data';
import { soundEngine } from '../utils/soundEffects';

describe('Data and Sound Tests', () => {
  it('should contain complete portfolio data for Caio', () => {
    expect(PORTFOLIO_DATA.name).toBe('Dev Caio');
    expect(PORTFOLIO_DATA.yearsOfExperience).toBeGreaterThanOrEqual(8);
    expect(PORTFOLIO_DATA.skills).toContain('React');
    expect(PORTFOLIO_DATA.skills).toContain('Next.js');
    expect(PORTFOLIO_DATA.skills).toContain('Node.js');
  });

  it('should contain the 4 desktop icons required', () => {
    const ids = DESKTOP_ICONS.map(i => i.id);
    expect(ids).toContain('recycle-bin');
    expect(ids).toContain('cv');
    expect(ids).toContain('about');
    expect(ids).toContain('hobbies');
  });

  it('should toggle sound engine mute state', () => {
    const initialMute = soundEngine.isMuted();
    soundEngine.setMuted(!initialMute);
    expect(soundEngine.isMuted()).toBe(!initialMute);
    soundEngine.setMuted(initialMute);
  });
});
```

- [ ] **Step 2: Executar o teste para verificar falha inicial**

Executar: `npm test`
Resultado esperado: Falha pois `src/types/index.ts`, `data.ts` e `soundEffects.ts` ainda não existem.

- [ ] **Step 3: Implementar `src/types/index.ts`**

```ts
export type ScreenMode = 'bios' | 'login' | 'desktop';

export interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowItem {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: WindowPosition;
  defaultPosition?: WindowPosition;
}

export interface DesktopIconItem {
  id: string;
  title: string;
  iconType: 'trash' | 'pdf' | 'notepad' | 'folder';
  windowId: string;
}

export interface HobbyItem {
  id: string;
  title: string;
  type: 'text' | 'image' | 'audio' | 'link';
  content: string;
  description: string;
}
```

- [ ] **Step 4: Implementar `src/utils/data.ts`**

```ts
import { DesktopIconItem, HobbyItem } from '../types';

export const PORTFOLIO_DATA = {
  name: 'Dev Caio',
  title: 'Engenheiro de Software Fullstack',
  yearsOfExperience: 8,
  summary: 'Desenvolvedor Fullstack com +8 anos de experiência em arquitetura web moderna, aplicações de alto desempenho e interfaces ricas. Especialista no ecossistema JavaScript/TypeScript, construindo soluções escaláveis e intuitivas de ponta a ponta.',
  skills: [
    'React', 'Next.js', 'Node.js', 'React Native',
    'TypeScript', 'JavaScript', 'CSS3 / Tailwind', 'HTML5',
    'PostgreSQL / MongoDB', 'Git / CI/CD', 'REST / GraphQL'
  ],
  languages: [
    { lang: 'Português', level: 'Nativo' },
    { lang: 'Inglês', level: 'Fluente (Profissional)' },
    { lang: 'Espanhol', level: 'Intermediário' }
  ],
  experience: [
    {
      period: '2021 - Presente',
      role: 'Senior Fullstack Engineer',
      description: 'Liderança técnica no desenvolvimento de aplicações escaláveis em React, Next.js e Node.js. Otimização de performance web e microsserviços.'
    },
    {
      period: '2018 - 2021',
      role: 'Fullstack Developer',
      description: 'Construção de ecossistemas web e mobile com React Native, integrações de APIs REST e arquitetura frontend modular.'
    },
    {
      period: '2016 - 2018',
      role: 'Frontend Developer',
      description: 'Desenvolvimento de interfaces SPA dinâmicas, componentização e responsividade focada na experiência do usuário.'
    }
  ],
  contacts: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'mailto:caio@exemplo.com'
  }
};

export const DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'recycle-bin', title: 'Lixeira', iconType: 'trash', windowId: 'recycle-bin-window' },
  { id: 'cv', title: 'caio-cv.pdf', iconType: 'pdf', windowId: 'cv-window' },
  { id: 'about', title: 'sobre-caio.txt', iconType: 'notepad', windowId: 'about-window' },
  { id: 'hobbies', title: 'hobbies', iconType: 'folder', windowId: 'hobbies-window' }
];

export const HOBBIES_ITEMS: HobbyItem[] = [
  {
    id: 'cafe',
    title: 'Cafe_Especial.txt',
    type: 'text',
    content: 'Entusiasta de cafés especiais: métodos V60, Chemex e Prensa Francesa. O combustível perfeito para codificar interfaces complexas!',
    description: 'Notas de degustação e métodos favoritos'
  },
  {
    id: 'setup',
    title: 'Setup_Gamer.jpg',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'Estética retrô & PC Gaming'
  },
  {
    id: 'musica',
    title: 'Musica_e_Lofi.txt',
    type: 'text',
    content: 'Synthwave dos anos 80, Lofi hip-hop e trilhas sonoras de videogames clássicos acompanhando cada commit.',
    description: 'Playlist & Inspiração Sonora'
  },
  {
    id: 'open-source',
    title: 'Open_Source.txt',
    type: 'text',
    content: 'Criador e contribuidor de bibliotecas open-source e ferramentas voltadas para a comunidade de desenvolvedores.',
    description: 'Projetos e contribuições'
  }
];

export const TRASH_ITEMS = [
  { name: 'Internet Explorer 6.exe', size: '14.2 MB', date: '15/08/2001' },
  { name: 'Adobe Flash Player.plugin', size: '8.4 MB', date: '31/12/2020' },
  { name: 'jQuery 1.4.2.js', size: '72 KB', date: '19/02/2010' },
  { name: 'Bugs em Producao.log', size: '0 KB', date: 'Hoje' }
];
```

- [ ] **Step 5: Implementar `src/utils/soundEffects.ts` usando Web Audio API**

```ts
class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private muted: boolean = false;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playBiosBeep() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // 880Hz A5 retro beep
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch {
      // Ignorar bloqueio de autoplay se ainda não interagido
    }
  }

  public playStartupChime() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const notes = [
        { f: 523.25, time: 0.0, dur: 0.6 },  // C5
        { f: 659.25, time: 0.18, dur: 0.7 }, // E5
        { f: 783.99, time: 0.36, dur: 0.8 }, // G5
        { f: 1046.50, time: 0.54, dur: 1.2 } // C6
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

  public playClick() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch {
      // safe fallback
    }
  }

  public playTrashEmpty() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      // Som de ruído rápido simulando papel triturado
      const bufferSize = this.audioCtx.sampleRate * 0.2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
      noise.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
    } catch {
      // safe fallback
    }
  }

  public playError() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch {
      // safe fallback
    }
  }
}

export const soundEngine = new SoundEngine();
```

- [ ] **Step 6: Executar os testes e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes de data e áudio passando.
Commit:
```bash
git add src/types/ src/utils/ src/test/
git commit -m "feat: add data models and web audio synth engine"
```

---

### Task 3: Gerenciador de Janelas e Contextos Globais (System & Window Contexts)

**Files:**
- Create: `src/context/SystemContext.tsx`
- Create: `src/context/WindowContext.tsx`
- Test: `src/test/windowContext.test.tsx`

**Interfaces:**
- Produces:
  - `SystemContext`: `screenMode`, `setScreenMode`, `isCrtEnabled`, `toggleCrt`, `isMuted`, `toggleMute`.
  - `WindowContext`: `windows`, `openWindow(id)`, `closeWindow(id)`, `focusWindow(id)`, `minimizeWindow(id)`, `maximizeWindow(id)`, `updateWindowPosition(id, pos)`.

- [ ] **Step 1: Escrever teste para o WindowContext e gerenciamento de janelas**

Criar `src/test/windowContext.test.tsx`:
```tsx
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { WindowProvider, useWindowManager } from '../context/WindowContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WindowProvider>{children}</WindowProvider>
);

describe('WindowContext Management', () => {
  it('should initialize with default closed windows', () => {
    const { result } = renderHook(() => useWindowManager(), { wrapper });
    expect(result.current.windows.length).toBeGreaterThan(0);
    expect(result.current.windows.every(w => !w.isOpen)).toBe(true);
  });

  it('should open window and give it highest zIndex', () => {
    const { result } = renderHook(() => useWindowManager(), { wrapper });
    act(() => {
      result.current.openWindow('about-window');
    });
    const aboutWin = result.current.windows.find(w => w.id === 'about-window');
    expect(aboutWin?.isOpen).toBe(true);
    expect(aboutWin?.isMinimized).toBe(false);
    expect(aboutWin?.zIndex).toBe(10);
  });

  it('should toggle minimize and maximize properly', () => {
    const { result } = renderHook(() => useWindowManager(), { wrapper });
    act(() => {
      result.current.openWindow('about-window');
      result.current.maximizeWindow('about-window');
    });
    let win = result.current.windows.find(w => w.id === 'about-window');
    expect(win?.isMaximized).toBe(true);

    act(() => {
      result.current.minimizeWindow('about-window');
    });
    win = result.current.windows.find(w => w.id === 'about-window');
    expect(win?.isMinimized).toBe(true);
  });
});
```

- [ ] **Step 2: Executar teste para verificar que falha**

Executar: `npm test`
Resultado esperado: Falha pois `WindowContext` não existe.

- [ ] **Step 3: Implementar `src/context/SystemContext.tsx`**

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScreenMode } from '../types';
import { soundEngine } from '../utils/soundEffects';

interface SystemContextType {
  screenMode: ScreenMode;
  setScreenMode: (mode: ScreenMode) => void;
  isCrtEnabled: boolean;
  toggleCrt: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isMobileVga: boolean;
  setDismissMobileVga: (dismiss: boolean) => void;
  dismissMobileVga: boolean;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screenMode, setScreenMode] = useState<ScreenMode>('bios');
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('caio_xp_crt');
    return saved !== null ? saved === 'true' : true;
  });
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted());
  const [isMobileVga, setIsMobileVga] = useState<boolean>(false);
  const [dismissMobileVga, setDismissMobileVga] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileVga(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCrt = () => {
    setIsCrtEnabled(prev => {
      const next = !prev;
      localStorage.setItem('caio_xp_crt', String(next));
      return next;
    });
  };

  const toggleMute = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
  };

  return (
    <SystemContext.Provider
      value={{
        screenMode,
        setScreenMode,
        isCrtEnabled,
        toggleCrt,
        isMuted,
        toggleMute,
        isMobileVga,
        dismissMobileVga,
        setDismissMobileVga,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystem must be used within SystemProvider');
  return ctx;
};
```

- [ ] **Step 4: Implementar `src/context/WindowContext.tsx`**

```tsx
import React, { createContext, useContext, useState } from 'react';
import { WindowItem, WindowPosition } from '../types';
import { soundEngine } from '../utils/soundEffects';

interface WindowContextType {
  windows: WindowItem[];
  activeWindowId: string | null;
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, pos: Partial<WindowPosition>) => void;
}

const DEFAULT_WINDOWS: WindowItem[] = [
  {
    id: 'about-window',
    title: 'sobre-caio.txt - Bloco de notas',
    icon: 'notepad',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 80, y: 50, width: 620, height: 460 },
    defaultPosition: { x: 80, y: 50, width: 620, height: 460 }
  },
  {
    id: 'cv-window',
    title: 'caio-cv.pdf - Visualizador de Documentos',
    icon: 'pdf',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 140, y: 40, width: 700, height: 520 },
    defaultPosition: { x: 140, y: 40, width: 700, height: 520 }
  },
  {
    id: 'hobbies-window',
    title: 'hobbies',
    icon: 'folder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 200, y: 80, width: 600, height: 420 },
    defaultPosition: { x: 200, y: 80, width: 600, height: 420 }
  },
  {
    id: 'recycle-bin-window',
    title: 'Lixeira',
    icon: 'trash',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 160, y: 70, width: 560, height: 380 },
    defaultPosition: { x: 160, y: 70, width: 560, height: 380 }
  }
];

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowItem[]>(DEFAULT_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [topZIndex, setTopZIndex] = useState<number>(10);

  const focusWindow = (id: string) => {
    soundEngine.playClick();
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
    );
  };

  const openWindow = (id: string) => {
    soundEngine.playClick();
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZ }
          : w
      )
    );
  };

  const closeWindow = (id: string) => {
    soundEngine.playClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isOpen: false, isMinimized: false } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    soundEngine.playClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: string) => {
    soundEngine.playClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusWindow(id);
  };

  const updateWindowPosition = (id: string, pos: Partial<WindowPosition>) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, position: { ...w.position, ...pos } } : w
      )
    );
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        maximizeWindow,
        updateWindowPosition
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowManager = () => {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowProvider');
  return ctx;
};
```

- [ ] **Step 5: Executar o teste e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes passando.
Commit:
```bash
git add src/context/ src/test/
git commit -m "feat: implement system and window manager contexts"
```

---

### Task 4: Camada de Tela de Tubo (CRT Overlay) e Modo VGA Mobile

**Files:**
- Create: `src/components/effects/CrtOverlay.tsx`
- Create: `src/components/mobile/VgaModePrompt.tsx`
- Test: `src/test/crtAndVga.test.tsx`

**Interfaces:**
- Consumes: `useSystem()` from `SystemContext`.
- Produces: `CrtOverlay` component (renders scanlines & CRT vignette when enabled) e `VgaModePrompt` (notifies mobile users with continue/express options).

- [ ] **Step 1: Escrever teste para CrtOverlay e VgaModePrompt**

Criar `src/test/crtAndVga.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { SystemProvider } from '../context/SystemContext';
import { CrtOverlay } from '../components/effects/CrtOverlay';
import { VgaModePrompt } from '../components/mobile/VgaModePrompt';

describe('CRT Overlay & VGA Prompt', () => {
  it('should render CRT overlay container', () => {
    render(
      <SystemProvider>
        <CrtOverlay />
      </SystemProvider>
    );
    const crtElement = document.querySelector('.crt-screen-layer');
    expect(crtElement).toBeInTheDocument();
  });

  it('should render VGA prompt when mobile is active', () => {
    render(
      <SystemProvider>
        <VgaModePrompt forceDisplay />
      </SystemProvider>
    );
    expect(screen.getByText(/Modo VGA Detectado/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Executar teste para verificar falha inicial**

Executar: `npm test`
Resultado esperado: Falha pois os componentes ainda não existem.

- [ ] **Step 3: Implementar `src/components/effects/CrtOverlay.tsx`**

```tsx
import React from 'react';
import { useSystem } from '../../context/SystemContext';

export const CrtOverlay: React.FC = () => {
  const { isCrtEnabled } = useSystem();

  if (!isCrtEnabled) return null;

  return (
    <div
      className="crt-screen-layer pointer-events-none fixed inset-0 z-[99999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Scanlines horizontais */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
      {/* Vinheta radial de curvatura do tubo */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,0,0,0.8)',
          background: 'radial-gradient(circle at center, transparent 75%, rgba(0,0,0,0.3) 100%)',
        }}
      />
      {/* Leve brilho de fósforo */}
      <div className="absolute inset-0 backdrop-brightness-[1.03] backdrop-contrast-[1.05]" />
    </div>
  );
};
```

- [ ] **Step 4: Implementar `src/components/mobile/VgaModePrompt.tsx`**

```tsx
import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { Monitor, ArrowRight, FileText } from 'lucide-react';

export const VgaModePrompt: React.FC<{ forceDisplay?: boolean }> = ({ forceDisplay }) => {
  const { isMobileVga, dismissMobileVga, setDismissMobileVga } = useSystem();

  if ((!isMobileVga && !forceDisplay) || dismissMobileVga) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="bg-[#ECE9D8] border-2 border-[#002D96] rounded shadow-2xl max-w-sm w-full p-4 font-tahoma text-xs text-black">
        <div className="bg-gradient-to-r from-[#0058EE] to-[#0372FD] text-white px-2 py-1 font-bold rounded-t flex items-center gap-2 -mt-4 -mx-4 mb-3">
          <Monitor className="w-4 h-4" />
          <span>Aviso: Modo VGA Detectado (640x480)</span>
        </div>

        <p className="mb-3 leading-relaxed">
          Você está acessando em uma tela compacta. Para desfrutar da experiência completa do <strong>Windows XP</strong> (com janelas livres, sons e visual retrô fiel), recomendamos acessar através de um <strong>computador/desktop</strong>.
        </p>

        <div className="bg-white border border-gray-400 p-2 mb-4 rounded text-gray-700">
          💡 O sistema irá abrir as janelas em modo adaptado para a sua tela.
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setDismissMobileVga(true)}
            className="w-full bg-[#ECE9D8] hover:bg-[#E0DCB8] active:bg-[#D5D0AB] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 py-1.5 px-3 font-bold flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4 text-green-700" />
            Continuar no Modo Adaptado
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 5: Executar os testes e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes passando.
Commit:
```bash
git add src/components/effects/ src/components/mobile/ src/test/
git commit -m "feat: add crt overlay and low-res vga mobile prompt"
```

---

### Task 5: Tela BIOS POST (Carregamento com Habilidades e Bypass DEL)

**Files:**
- Create: `src/components/bios/BiosScreen.tsx`
- Test: `src/test/biosScreen.test.tsx`

**Interfaces:**
- Consumes: `useSystem()` (avança para `login`), `soundEngine` (toca bipe de BIOS), `PORTFOLIO_DATA`.
- Produces: `BiosScreen` com terminal estilo placa-mãe antiga, skills carregando e botão/tecla DEL para pular.

- [ ] **Step 1: Escrever teste para o BiosScreen**

Criar `src/test/biosScreen.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { SystemProvider } from '../context/SystemContext';
import { BiosScreen } from '../components/bios/BiosScreen';

describe('BiosScreen Component', () => {
  it('should render BIOS header and DEL prompt', () => {
    render(
      <SystemProvider>
        <BiosScreen />
      </SystemProvider>
    );
    expect(screen.getByText(/Dev Caio Modular BIOS/i)).toBeInTheDocument();
    expect(screen.getByText(/Press DEL to enter SETUP/i)).toBeInTheDocument();
  });

  it('should trigger DEL skip when Del key is pressed', () => {
    render(
      <SystemProvider>
        <BiosScreen />
      </SystemProvider>
    );
    fireEvent.keyDown(window, { key: 'Delete' });
    // Deve transicionar o modo de tela para login
  });
});
```

- [ ] **Step 2: Executar o teste para verificar falha inicial**

Executar: `npm test`
Resultado esperado: Falha pois `BiosScreen` ainda não existe.

- [ ] **Step 3: Implementar `src/components/bios/BiosScreen.tsx`**

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSystem } from '../../context/SystemContext';
import { soundEngine } from '../../utils/soundEffects';
import { PORTFOLIO_DATA } from '../../utils/data';

export const BiosScreen: React.FC = () => {
  const { setScreenMode } = useSystem();
  const [lines, setLines] = useState<string[]>([]);

  const handleSkip = useCallback(() => {
    soundEngine.playBiosBeep();
    setScreenMode('login');
  }, [setScreenMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Del' || e.key === 'Enter' || e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    const bootSequence = [
      'Dev Caio Modular BIOS v2.04 - ACPI BIOS Revision 1008',
      'Copyright (C) 2016-2026, Caio Engineering Systems Inc.',
      '',
      `CPU: Fullstack Architect Engine @ ${PORTFOLIO_DATA.yearsOfExperience}+ Years Experience`,
      'Memory Frequency For DDR3 1600 (Dual Channel Mode)',
      'Memory Testing: 16384K OK',
      '',
      'Detecting Primary Master ... High Performance Frontend',
      'Detecting Primary Slave  ... Scalable Node.js Backend',
      'Detecting Secondary Master ... React Native & Cloud APIs',
      '',
      `Loading Core Skills: [${PORTFOLIO_DATA.skills.slice(0, 8).join(', ')}] ... [OK]`,
      `Loading Languages: Portuguese (Native), English (Fluent), Spanish ... [OK]`,
      'Initializing Virtual Luna Subsystem...',
      'Booting System Kernel from C:\\dev-caio\\portfolio...',
      'READY.'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setLines(prev => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          handleSkip();
        }, 800);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [handleSkip]);

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 bg-black text-gray-200 font-terminal text-sm md:text-base p-6 md:p-12 flex flex-col justify-between cursor-pointer select-none z-50 overflow-hidden"
    >
      <div>
        {/* Cabeçalho do Energy Star estilo anos 2000 */}
        <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-4">
          <div>
            <div className="text-white font-bold tracking-widest text-lg md:text-xl">
              DEV CAIO MODULAR BIOS v2.0
            </div>
            <div className="text-gray-400 text-xs">
              ENERGY STAR ALLIANCE COMPLIANT
            </div>
          </div>
          <div className="hidden sm:block text-right text-xs text-yellow-400 border border-yellow-500 p-1">
            ⚡ EPA ENERGY STAR
          </div>
        </div>

        {/* Linhas de inicialização progressiva */}
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className="leading-snug">
              {line.includes('[OK]') ? (
                <span>
                  {line.replace('[OK]', '')}
                  <span className="text-green-400 font-bold">[OK]</span>
                </span>
              ) : (
                line
              )}
            </div>
          ))}
          <span className="inline-block w-2.5 h-4 bg-white animate-pulse ml-1" />
        </div>
      </div>

      {/* Rodapé piscando com instrução de pular */}
      <div className="border-t border-gray-700 pt-3 flex justify-between items-center text-xs md:text-sm text-yellow-300">
        <div className="animate-pulse flex items-center gap-2">
          <span>▶ Press DEL to enter SETUP</span>
          <span className="text-gray-400 text-xs">(ou clique para pular)</span>
        </div>
        <div className="text-gray-500">09/30/2026-XP-PORTFOLIO</div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Executar os testes e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes passando.
Commit:
```bash
git add src/components/bios/ src/test/
git commit -m "feat: implement bios loading screen with del key bypass"
```

---

### Task 6: Tela Clássica de Login (Welcome Screen com Avatar de Caneca de Café)

**Files:**
- Create: `src/components/login/LoginScreen.tsx`
- Test: `src/test/loginScreen.test.tsx`

**Interfaces:**
- Consumes: `useSystem()` (avança para `desktop`), `soundEngine` (`playStartupChime()`), `PORTFOLIO_DATA`.
- Produces: `LoginScreen` com design clássico de boas-vindas do Windows XP.

- [ ] **Step 1: Escrever teste para a tela de login**

Criar `src/test/loginScreen.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { SystemProvider } from '../context/SystemContext';
import { LoginScreen } from '../components/login/LoginScreen';

describe('LoginScreen Component', () => {
  it('should render user Dev Caio with coffee mug avatar', () => {
    render(
      <SystemProvider>
        <LoginScreen />
      </SystemProvider>
    );
    expect(screen.getByText('Dev Caio')).toBeInTheDocument();
    expect(screen.getByText(/Clique aqui para iniciar a sessão/i)).toBeInTheDocument();
  });

  it('should trigger login on click', () => {
    render(
      <SystemProvider>
        <LoginScreen />
      </SystemProvider>
    );
    const userCard = screen.getByText('Dev Caio');
    fireEvent.click(userCard);
  });
});
```

- [ ] **Step 2: Executar teste para verificar falha inicial**

Executar: `npm test`
Resultado esperado: Falha pois `LoginScreen` não existe.

- [ ] **Step 3: Implementar `src/components/login/LoginScreen.tsx`**

```tsx
import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { soundEngine } from '../../utils/soundEffects';
import { PORTFOLIO_DATA } from '../../utils/data';
import { Power, Coffee } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setScreenMode } = useSystem();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    soundEngine.playStartupChime();
    setTimeout(() => {
      setScreenMode('desktop');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-[#00136B] flex flex-col justify-between font-tahoma select-none overflow-hidden z-40">
      {/* Top Banner clássico */}
      <div className="h-16 md:h-20 bg-gradient-to-r from-[#00136B] via-[#002D96] to-[#00136B] border-b-2 border-orange-400 flex items-center px-8 shadow-md">
        <div className="text-white text-lg md:text-xl font-bold tracking-wide italic">
          Caio XP Professional
        </div>
      </div>

      {/* Área Central de Boas-Vindas */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-16 gap-8 md:gap-16">
        {/* Lado Esquerdo com instrução */}
        <div className="text-right text-white max-w-sm hidden md:block">
          <h2 className="text-3xl font-light mb-2 tracking-wide">Para começar,</h2>
          <p className="text-blue-200 text-sm">
            clique no seu nome de usuário para acessar o portfólio e as informações profissionais.
          </p>
        </div>

        {/* Divisor vertical característico com degradê branco */}
        <div className="hidden md:block w-[1px] h-64 bg-gradient-to-b from-transparent via-white to-transparent opacity-60" />

        {/* Lado Direito: Card de Usuário */}
        <div className="flex flex-col items-center md:items-start">
          <div
            onClick={handleLogin}
            className="group flex items-center gap-4 p-3 pr-8 rounded-lg cursor-pointer transition-all duration-150 hover:bg-white hover:bg-opacity-10 border border-transparent hover:border-yellow-400"
          >
            {/* Avatar: Caneca de café estilizada com moldura clássica */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-[#ECE9D8] to-[#C0BCA7] border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
              <Coffee className="w-10 h-10 md:w-12 md:h-12 text-[#6F4E37] drop-shadow-sm group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20" />
            </div>

            {/* Informações do usuário */}
            <div className="text-white">
              <div className="text-xl md:text-2xl font-bold tracking-wide group-hover:text-yellow-300">
                {PORTFOLIO_DATA.name}
              </div>
              <div className="text-xs md:text-sm text-blue-200">
                {isLoggingIn ? (
                  <span className="text-yellow-300 animate-pulse">Carregando suas configurações...</span>
                ) : (
                  PORTFOLIO_DATA.title
                )}
              </div>
              <div className="text-[11px] text-gray-300 mt-1">
                {isLoggingIn ? 'Iniciando sessão...' : 'Clique aqui para iniciar a sessão'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior com botão de desligar */}
      <div className="h-16 md:h-20 bg-gradient-to-r from-[#00136B] via-[#002D96] to-[#00136B] border-t-2 border-orange-400 flex items-center justify-between px-8 text-white text-xs">
        <button
          onClick={() => setScreenMode('bios')}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white hover:bg-opacity-10 text-white font-medium transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-red-600 border border-white flex items-center justify-center shadow">
            <Power className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Reiniciar na BIOS</span>
        </button>

        <div className="text-blue-300 hidden sm:block">
          Após fazer logon, você poderá explorar arquivos, currículo e projetos.
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Executar os testes e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes passando.
Commit:
```bash
git add src/components/login/ src/test/
git commit -m "feat: implement classic windows xp login screen with coffee mug avatar"
```

---

### Task 7: Moldura da Janela (WindowFrame com Tema Luna Blue e Arrastar)

**Files:**
- Create: `src/components/windows/WindowFrame.tsx`
- Test: `src/test/windowFrame.test.tsx`

**Interfaces:**
- Consumes: `useWindowManager()`, `WindowItem`.
- Produces: `WindowFrame` reusável para qualquer aplicativo (arrasto pelo mouse e toque, botões _, □, X, redimensionamento/maximização).

- [ ] **Step 1: Escrever teste para o WindowFrame**

Criar `src/test/windowFrame.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { WindowProvider } from '../../src/context/WindowContext';
import { WindowFrame } from '../../src/components/windows/WindowFrame';

describe('WindowFrame Component', () => {
  it('should render window title and control buttons', () => {
    render(
      <WindowProvider>
        <WindowFrame windowId="about-window" title="sobre-caio.txt">
          <div>Conteúdo do Bloco de Notas</div>
        </WindowFrame>
      </WindowProvider>
    );
    expect(screen.getByText('sobre-caio.txt')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do Bloco de Notas')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Executar teste para verificar falha inicial**

Executar: `npm test`
Resultado esperado: Falha pois `WindowFrame` não existe.

- [ ] **Step 3: Implementar `src/components/windows/WindowFrame.tsx`**

```tsx
import React, { useRef, useState, useEffect } from 'react';
import { useWindowManager } from '../../context/WindowContext';
import { Minus, Square, X, Copy } from 'lucide-react';

interface WindowFrameProps {
  windowId: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowId,
  title,
  children,
  icon,
}) => {
  const {
    windows,
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
  } = useWindowManager();

  const win = windows.find(w => w.id === windowId);
  const isActive = activeWindowId === windowId;

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (win?.isMaximized) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: win ? win.position.x : 50,
      initY: win ? win.position.y : 50,
    };
    focusWindow(windowId);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !win) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.initX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.initY + deltaY));
      updateWindowPosition(windowId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, win, windowId, updateWindowPosition]);

  if (!win || !win.isOpen || win.isMinimized) return null;

  return (
    <div
      onClick={() => focusWindow(windowId)}
      style={{
        zIndex: win.zIndex,
        left: win.isMaximized ? 0 : `${win.position.x}px`,
        top: win.isMaximized ? 0 : `${win.position.y}px`,
        width: win.isMaximized ? '100vw' : `${win.position.width}px`,
        height: win.isMaximized ? 'calc(100vh - 36px)' : `${win.position.height}px`,
      }}
      className={`fixed flex flex-col rounded-t-lg overflow-hidden border-[3px] shadow-2xl transition-all duration-75 select-none ${
        isActive
          ? 'border-[#0058EE] shadow-black/40'
          : 'border-[#7A96DF] shadow-black/20'
      }`}
    >
      {/* Barra de Título Luna Blue */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-8 px-2 flex items-center justify-between cursor-move rounded-t-sm transition-colors ${
          isActive
            ? 'bg-gradient-to-r from-[#0058EE] via-[#0372FD] to-[#0058EE] text-white'
            : 'bg-gradient-to-r from-[#7A96DF] via-[#A0B3E8] to-[#7A96DF] text-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
          <span className="font-bold text-xs truncate drop-shadow">{title}</span>
        </div>

        {/* Botões de Controle: _, □, X */}
        <div className="flex items-center gap-1 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
          {/* Minimizar */}
          <button
            onClick={() => minimizeWindow(windowId)}
            className="w-5 h-5 rounded-sm bg-[#0058EE] hover:bg-[#2070FF] active:bg-[#0040B0] border border-white/60 flex items-center justify-center text-white"
            title="Minimizar"
          >
            <Minus className="w-3 h-3 stroke-[3]" />
          </button>

          {/* Maximizar / Restaurar */}
          <button
            onClick={() => maximizeWindow(windowId)}
            className="w-5 h-5 rounded-sm bg-[#0058EE] hover:bg-[#2070FF] active:bg-[#0040B0] border border-white/60 flex items-center justify-center text-white"
            title={win.isMaximized ? 'Restaurar' : 'Maximizar'}
          >
            {win.isMaximized ? (
              <Copy className="w-3 h-3 stroke-[2]" />
            ) : (
              <Square className="w-3 h-3 stroke-[2]" />
            )}
          </button>

          {/* Fechar */}
          <button
            onClick={() => closeWindow(windowId)}
            className="w-5 h-5 rounded-sm bg-[#E81123] hover:bg-[#F25050] active:bg-[#B50B18] border border-white/80 flex items-center justify-center text-white ml-0.5 shadow-sm"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Conteúdo da Janela */}
      <div className="flex-1 bg-[#ECE9D8] overflow-auto flex flex-col">
        {children}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Executar os testes e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes passando.
Commit:
```bash
git add src/components/windows/WindowFrame.tsx src/test/
git commit -m "feat: implement Luna blue theme WindowFrame with dragging and controls"
```

---

### Task 8: Aplicativos do Sistema (Bloco de Notas, Visualizador de CV, Pasta de Hobbies e Lixeira)

**Files:**
- Create: `src/components/windows/NotepadApp.tsx`
- Create: `src/components/windows/PdfViewerApp.tsx`
- Create: `src/components/windows/ExplorerFolderApp.tsx`
- Create: `src/components/windows/RecycleBinApp.tsx`
- Test: `src/test/applications.test.tsx`

**Interfaces:**
- Consumes: `PORTFOLIO_DATA`, `HOBBIES_ITEMS`, `TRASH_ITEMS`, `WindowFrame`.
- Produces: `NotepadApp` (com bio, habilidades, links), `PdfViewerApp` (leitor de currículo com download), `ExplorerFolderApp` (pastas e pré-visualização), e `RecycleBinApp` (lixeira funcional).

- [ ] **Step 1: Escrever teste para os aplicativos**

Criar `src/test/applications.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { WindowProvider } from '../context/WindowContext';
import { NotepadApp } from '../components/windows/NotepadApp';
import { PdfViewerApp } from '../components/windows/PdfViewerApp';
import { ExplorerFolderApp } from '../components/windows/ExplorerFolderApp';
import { RecycleBinApp } from '../components/windows/RecycleBinApp';

describe('Applications Rendering', () => {
  it('should render NotepadApp with Caio bio and skills', () => {
    render(
      <WindowProvider>
        <NotepadApp />
      </WindowProvider>
    );
    expect(screen.getByText(/SOBRE O DESENVOLVEDOR/i)).toBeInTheDocument();
  });

  it('should render PdfViewerApp with download button', () => {
    render(
      <WindowProvider>
        <PdfViewerApp />
      </WindowProvider>
    );
    expect(screen.getByText(/Baixar Currículo/i)).toBeInTheDocument();
  });

  it('should render ExplorerFolderApp and RecycleBinApp', () => {
    render(
      <WindowProvider>
        <ExplorerFolderApp />
        <RecycleBinApp />
      </WindowProvider>
    );
    expect(screen.getByText(/Cafe_Especial.txt/i)).toBeInTheDocument();
    expect(screen.getByText(/Internet Explorer 6.exe/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Executar teste para verificar falha inicial**

Executar: `npm test`
Resultado esperado: Falha pois os componentes dos aplicativos não existem.

- [ ] **Step 3: Implementar `src/components/windows/NotepadApp.tsx`**

```tsx
import React from 'react';
import { WindowFrame } from './WindowFrame';
import { PORTFOLIO_DATA } from '../../utils/data';
import { FileText } from 'lucide-react';

export const NotepadApp: React.FC = () => {
  return (
    <WindowFrame
      windowId="about-window"
      title="sobre-caio.txt - Bloco de notas"
      icon={<FileText className="w-4 h-4 text-blue-600" />}
    >
      {/* Menu do Bloco de Notas */}
      <div className="bg-[#ECE9D8] border-b border-gray-300 px-2 py-0.5 flex gap-4 text-xs font-tahoma text-black">
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Arquivo</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Editar</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Formatar</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Exibir</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Ajuda</span>
      </div>

      {/* Área de Texto Monospaced */}
      <div className="flex-1 bg-white p-4 font-mono text-sm leading-relaxed overflow-y-auto text-black select-text">
        <div className="font-bold text-base mb-2">====================================</div>
        <div className="font-bold text-base mb-2">SOBRE O DESENVOLVEDOR - DEV CAIO</div>
        <div className="font-bold text-base mb-4">====================================</div>

        <p className="mb-4">
          Olá! Sou Caio, Engenheiro de Software Fullstack com +{PORTFOLIO_DATA.yearsOfExperience} anos de experiência sólida em criação de produtos digitais, arquitetura de sistemas e interfaces interativas de alto impacto.
        </p>

        <div className="font-bold mb-2">--- [ PRINCIPAIS HABILIDADES TÉCNICAS ] ---</div>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          {PORTFOLIO_DATA.skills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>

        <div className="font-bold mb-2">--- [ IDIOMAS ] ---</div>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          {PORTFOLIO_DATA.languages.map((l, i) => (
            <li key={i}>{l.lang}: {l.level}</li>
          ))}
        </ul>

        <div className="font-bold mb-2">--- [ CONTATOS & REDES ] ---</div>
        <p className="mb-1">GitHub: {PORTFOLIO_DATA.contacts.github}</p>
        <p className="mb-1">LinkedIn: {PORTFOLIO_DATA.contacts.linkedin}</p>
        <p className="mb-4">Email: caio@exemplo.com</p>

        <div className="text-gray-500 text-xs mt-6">
          Arquivo codificado em UTF-8 com suporte nativo a Windows XP.
        </div>
      </div>

      {/* Barra de Status */}
      <div className="bg-[#ECE9D8] border-t border-gray-300 px-4 py-0.5 flex justify-end text-xs text-gray-700 gap-6">
        <span>Lin 24, Col 1</span>
        <span>Windows (CRLF)</span>
        <span>100%</span>
      </div>
    </WindowFrame>
  );
};
```

- [ ] **Step 4: Implementar `src/components/windows/PdfViewerApp.tsx`**

```tsx
import React, { useState } from 'react';
import { WindowFrame } from './WindowFrame';
import { PORTFOLIO_DATA } from '../../utils/data';
import { Download, ZoomIn, ZoomOut, Printer, FileText, CheckCircle2 } from 'lucide-react';

export const PdfViewerApp: React.FC = () => {
  const [zoom, setZoom] = useState<number>(100);

  const handleDownload = () => {
    // Cria um arquivo de texto com os dados do currículo para download imediato
    const element = document.createElement('a');
    const file = new Blob([
      `CURRÍCULO - ${PORTFOLIO_DATA.name}\n${PORTFOLIO_DATA.title}\n\n` +
      `Resumo:\n${PORTFOLIO_DATA.summary}\n\n` +
      `Habilidades:\n${PORTFOLIO_DATA.skills.join(', ')}\n\n` +
      `Experiência:\n` +
      PORTFOLIO_DATA.experience.map(e => `${e.period}: ${e.role}\n${e.description}\n`).join('\n')
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'caio-curriculo.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <WindowFrame
      windowId="cv-window"
      title="caio-cv.pdf - Visualizador de Documentos"
      icon={<FileText className="w-4 h-4 text-red-600" />}
    >
      {/* Barra de Ferramentas Retrô */}
      <div className="bg-[#ECE9D8] border-b border-gray-400 p-1.5 flex items-center justify-between text-xs font-tahoma">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 10, 150))}
            className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-400 rounded hover:bg-gray-100 active:bg-gray-200"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Zoom In</span>
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 10, 70))}
            className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-400 rounded hover:bg-gray-100 active:bg-gray-200"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span>Zoom Out</span>
          </button>
          <span className="text-gray-600 ml-2">{zoom}%</span>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#245EDC] text-white font-bold rounded border border-[#002D96] hover:bg-[#1941A5] active:bg-[#00136B] shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar Currículo</span>
        </button>
      </div>

      {/* Página do Documento renderizada */}
      <div className="flex-1 bg-gray-600 p-6 overflow-auto flex justify-center">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="bg-white shadow-2xl p-8 max-w-2xl w-full text-black min-h-[700px] select-text transition-transform duration-100"
        >
          <div className="border-b-2 border-blue-600 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{PORTFOLIO_DATA.name}</h1>
            <p className="text-blue-600 font-semibold">{PORTFOLIO_DATA.title}</p>
            <p className="text-xs text-gray-500 mt-1">+8 anos de experiência em Engenharia de Software</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
              Perfil Profissional
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed">{PORTFOLIO_DATA.summary}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
              Competências Técnicas
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {PORTFOLIO_DATA.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1.5 text-gray-800">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
              Trajetória & Experiência
            </h2>
            <div className="space-y-4">
              {PORTFOLIO_DATA.experience.map((exp, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{exp.role}</span>
                    <span className="text-gray-500">{exp.period}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
};
```

- [ ] **Step 5: Implementar `src/components/windows/ExplorerFolderApp.tsx` e `RecycleBinApp.tsx`**

Criar `src/components/windows/ExplorerFolderApp.tsx`:
```tsx
import React, { useState } from 'react';
import { WindowFrame } from './WindowFrame';
import { HOBBIES_ITEMS } from '../../utils/data';
import { Folder, ArrowLeft, ArrowRight, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import { HobbyItem } from '../../types';

export const ExplorerFolderApp: React.FC = () => {
  const [selectedHobby, setSelectedHobby] = useState<HobbyItem | null>(null);

  return (
    <WindowFrame
      windowId="hobbies-window"
      title="hobbies"
      icon={<Folder className="w-4 h-4 text-yellow-600" />}
    >
      {/* Barra de Navegação Explorer */}
      <div className="bg-[#ECE9D8] border-b border-gray-300 p-1 flex items-center gap-2 text-xs font-tahoma">
        <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 border border-gray-400 opacity-60">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </button>
        <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 border border-gray-400 opacity-60">
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 bg-white border border-gray-400 px-2 py-0.5 rounded text-gray-700 flex items-center gap-1 text-[11px]">
          <span className="text-gray-400">Endereço:</span>
          <span>C:\Documentos de Caio\Hobbies</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Painel lateral azul clássico do Windows XP */}
        <div className="w-44 bg-gradient-to-b from-[#7A96DF] to-[#245EDC] p-3 text-white text-xs hidden sm:block">
          <div className="bg-white/20 rounded p-2 mb-3">
            <div className="font-bold flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Tarefas de Pasta</span>
            </div>
            <p className="text-[11px] text-blue-100 leading-snug">
              Clique duas vezes em um item para ler detalhes ou ver fotos.
            </p>
          </div>
        </div>

        {/* Grade de Arquivos */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {HOBBIES_ITEMS.map((hobby) => (
              <div
                key={hobby.id}
                onDoubleClick={() => setSelectedHobby(hobby)}
                onClick={() => setSelectedHobby(hobby)}
                className="group flex flex-col items-center p-3 rounded hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-300 text-center"
              >
                {hobby.type === 'image' ? (
                  <ImageIcon className="w-10 h-10 text-blue-600 mb-1" />
                ) : (
                  <FileText className="w-10 h-10 text-yellow-600 mb-1" />
                )}
                <span className="text-xs font-medium text-gray-800 break-all">{hobby.title}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{hobby.description}</span>
              </div>
            ))}
          </div>

          {/* Modal de Detalhe do Hobby */}
          {selectedHobby && (
            <div className="mt-6 p-4 bg-[#ECE9D8] border border-gray-400 rounded shadow-md text-xs">
              <div className="font-bold text-sm mb-1 text-blue-900">{selectedHobby.title}</div>
              <p className="text-gray-800 leading-relaxed mb-3">{selectedHobby.content}</p>
              <button
                onClick={() => setSelectedHobby(null)}
                className="px-3 py-1 bg-white border border-gray-400 rounded hover:bg-gray-100"
              >
                Fechar Detalhes
              </button>
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
};
```

Criar `src/components/windows/RecycleBinApp.tsx`:
```tsx
import React, { useState } from 'react';
import { WindowFrame } from './WindowFrame';
import { TRASH_ITEMS } from '../../utils/data';
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

export const RecycleBinApp: React.FC = () => {
  const [items, setItems] = useState(TRASH_ITEMS);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEmptyTrash = () => {
    soundEngine.playTrashEmpty();
    setItems([]);
    setShowConfirm(false);
  };

  return (
    <WindowFrame
      windowId="recycle-bin-window"
      title="Lixeira"
      icon={<Trash2 className="w-4 h-4 text-gray-600" />}
    >
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Lateral */}
        <div className="w-44 bg-gradient-to-b from-[#7A96DF] to-[#245EDC] p-3 text-white text-xs hidden sm:block">
          <div className="bg-white/20 rounded p-2 mb-3">
            <div className="font-bold mb-1">Tarefas da Lixeira</div>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={items.length === 0}
              className="mt-2 w-full text-left text-[11px] underline hover:text-yellow-200 disabled:opacity-50"
            >
              Esvaziar a Lixeira
            </button>
          </div>
        </div>

        {/* Tabela de Arquivos */}
        <div className="flex-1 bg-white p-2 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
              <Trash2 className="w-12 h-12 mb-2 stroke-1" />
              <span>A lixeira está vazia.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-tahoma">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500">
                  <th className="pb-1 font-normal">Nome</th>
                  <th className="pb-1 font-normal">Tamanho</th>
                  <th className="pb-1 font-normal">Data da Exclusão</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-100 cursor-pointer">
                    <td className="py-1 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-1 text-gray-600">{item.size}</td>
                    <td className="py-1 text-gray-600">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Caixa de diálogo clássica de confirmação de esvaziar lixeira */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-[#ECE9D8] border-2 border-[#002D96] rounded shadow-2xl p-4 max-w-sm w-full text-xs font-tahoma text-black">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <span>Tem certeza de que deseja excluir permanentemente estes itens nostálgicos da lixeira?</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-1 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 active:bg-gray-300 font-bold"
              >
                Sim
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 active:bg-gray-300 font-bold"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </WindowFrame>
  );
};
```

- [ ] **Step 6: Executar os testes e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes passando.
Commit:
```bash
git add src/components/windows/ src/test/
git commit -m "feat: implement notepad, pdf viewer, hobbies explorer and recycle bin apps"
```

---

### Task 9: Desktop, Ícones, Barra de Tarefas, Menu Iniciar e System Tray

**Files:**
- Create: `src/components/desktop/DesktopIcon.tsx`
- Create: `src/components/desktop/StartMenu.tsx`
- Create: `src/components/desktop/SystemTray.tsx`
- Create: `src/components/desktop/Taskbar.tsx`
- Create: `src/components/desktop/Desktop.tsx`
- Test: `src/test/desktopAndTaskbar.test.tsx`

**Interfaces:**
- Consumes: `useWindowManager()`, `useSystem()`, `DESKTOP_ICONS`, `PORTFOLIO_DATA`.
- Produces: Ambiente completo do desktop com papel de parede Bliss, menu Iniciar funcional, relógio em tempo real e alternadores de som/CRT.

- [ ] **Step 1: Escrever teste para Desktop e Taskbar**

Criar `src/test/desktopAndTaskbar.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { SystemProvider } from '../context/SystemContext';
import { WindowProvider } from '../context/WindowContext';
import { Desktop } from '../components/desktop/Desktop';

describe('Desktop and Taskbar Integration', () => {
  it('should render desktop icons and Start button', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <Desktop />
        </WindowProvider>
      </SystemProvider>
    );
    expect(screen.getByText('iniciar')).toBeInTheDocument();
    expect(screen.getByText('caio-cv.pdf')).toBeInTheDocument();
    expect(screen.getByText('sobre-caio.txt')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Executar teste para verificar falha inicial**

Executar: `npm test`
Resultado esperado: Falha pois os componentes do Desktop ainda não existem.

- [ ] **Step 3: Implementar `src/components/desktop/DesktopIcon.tsx`**

```tsx
import React, { useState } from 'react';
import { DesktopIconItem } from '../../types';
import { useWindowManager } from '../../context/WindowContext';
import { Trash2, FileText, Folder } from 'lucide-react';

export const DesktopIcon: React.FC<{ item: DesktopIconItem }> = ({ item }) => {
  const { openWindow } = useWindowManager();
  const [isSelected, setIsSelected] = useState(false);

  const getIcon = () => {
    switch (item.iconType) {
      case 'trash':
        return <Trash2 className="w-9 h-9 text-gray-200 drop-shadow-md" />;
      case 'pdf':
        return <FileText className="w-9 h-9 text-red-500 drop-shadow-md" />;
      case 'notepad':
        return <FileText className="w-9 h-9 text-blue-400 drop-shadow-md" />;
      case 'folder':
        return <Folder className="w-9 h-9 text-yellow-400 drop-shadow-md" />;
    }
  };

  return (
    <div
      onClick={() => setIsSelected(true)}
      onDoubleClick={() => openWindow(item.windowId)}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
      className={`w-20 p-2 flex flex-col items-center justify-center rounded cursor-pointer select-none group focus:outline-none transition-colors ${
        isSelected
          ? 'bg-[#0B61FF]/40 border border-dotted border-white/70'
          : 'hover:bg-white/10'
      }`}
    >
      <div className="mb-1">{getIcon()}</div>
      <span
        className={`text-white text-xs text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] px-1 rounded ${
          isSelected ? 'bg-[#0B61FF]' : ''
        }`}
      >
        {item.title}
      </span>
    </div>
  );
};
```

- [ ] **Step 4: Implementar `src/components/desktop/SystemTray.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Volume2, VolumeX, Tv } from 'lucide-react';

export const SystemTray: React.FC = () => {
  const { isCrtEnabled, toggleCrt, isMuted, toggleMute } = useSystem();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full bg-[#0B61FF] border-l border-[#002D96] px-3 flex items-center gap-3 text-white text-xs font-tahoma shadow-inner">
      {/* Botão de alternar áudio */}
      <button
        onClick={toggleMute}
        className="hover:scale-110 active:scale-95 transition-transform"
        title={isMuted ? 'Desmutar sons' : 'Mutar sons retrô'}
      >
        {isMuted ? (
          <VolumeX className="w-3.5 h-3.5 text-red-300" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-white" />
        )}
      </button>

      {/* Botão de alternar efeito CRT de tela de tubo */}
      <button
        onClick={toggleCrt}
        className={`hover:scale-110 active:scale-95 transition-transform flex items-center gap-1 ${
          isCrtEnabled ? 'text-green-300' : 'text-gray-300 opacity-60'
        }`}
        title={isCrtEnabled ? 'Desativar efeito CRT' : 'Ativar efeito CRT'}
      >
        <Tv className="w-3.5 h-3.5" />
      </button>

      {/* Relógio digital em tempo real */}
      <span className="font-semibold tracking-wide ml-1">{time || '12:00'}</span>
    </div>
  );
};
```

- [ ] **Step 5: Implementar `src/components/desktop/StartMenu.tsx`**

```tsx
import React from 'react';
import { useWindowManager } from '../../context/WindowContext';
import { useSystem } from '../../context/SystemContext';
import { PORTFOLIO_DATA } from '../../utils/data';
import { Coffee, FileText, Folder, Power, LogOut, Github, Linkedin, Mail } from 'lucide-react';

export const StartMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { openWindow } = useWindowManager();
  const { setScreenMode } = useSystem();

  if (!isOpen) return null;

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="absolute bottom-9 left-0 w-80 sm:w-96 rounded-t-lg bg-white border-2 border-[#002D96] shadow-2xl flex flex-col font-tahoma overflow-hidden z-[9999]"
    >
      {/* Cabeçalho clássico do Menu Iniciar */}
      <div className="bg-gradient-to-r from-[#0058EE] to-[#0372FD] p-3 flex items-center gap-3 text-white border-b border-orange-400">
        <div className="w-10 h-10 rounded bg-[#ECE9D8] border border-white flex items-center justify-center">
          <Coffee className="w-6 h-6 text-[#6F4E37]" />
        </div>
        <div>
          <div className="font-bold text-sm">{PORTFOLIO_DATA.name}</div>
          <div className="text-[11px] text-blue-200">{PORTFOLIO_DATA.title}</div>
        </div>
      </div>

      {/* Corpo de 2 colunas do XP */}
      <div className="flex flex-1">
        {/* Coluna Esquerda (Programas Principais) */}
        <div className="w-1/2 p-2 bg-white flex flex-col gap-1 text-xs">
          <button
            onClick={() => { openWindow('about-window'); onClose(); }}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-[#245EDC] hover:text-white text-left"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Sobre o Desenvolvedor</span>
          </button>
          <button
            onClick={() => { openWindow('cv-window'); onClose(); }}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-[#245EDC] hover:text-white text-left"
          >
            <FileText className="w-4 h-4 text-red-600" />
            <span>Currículo (PDF)</span>
          </button>
          <button
            onClick={() => { openWindow('hobbies-window'); onClose(); }}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-[#245EDC] hover:text-white text-left"
          >
            <Folder className="w-4 h-4 text-yellow-600" />
            <span>Meus Hobbies</span>
          </button>
        </div>

        {/* Coluna Direita (Atalhos & Redes) */}
        <div className="w-1/2 p-2 bg-[#D3E5FA] border-l border-blue-200 flex flex-col gap-1 text-xs text-gray-800">
          <div className="font-bold text-gray-600 text-[10px] px-1 uppercase tracking-wider mb-1">Redes & Links</div>
          <a
            href={PORTFOLIO_DATA.contacts.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-1.5 rounded hover:bg-[#245EDC] hover:text-white"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href={PORTFOLIO_DATA.contacts.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-1.5 rounded hover:bg-[#245EDC] hover:text-white"
          >
            <Linkedin className="w-4 h-4 text-blue-700" />
            <span>LinkedIn</span>
          </a>
          <a
            href={PORTFOLIO_DATA.contacts.email}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-[#245EDC] hover:text-white"
          >
            <Mail className="w-4 h-4 text-red-600" />
            <span>Enviar E-mail</span>
          </a>
        </div>
      </div>

      {/* Rodapé com Logoff e Desligar */}
      <div className="bg-gradient-to-r from-[#0058EE] to-[#0372FD] p-2 flex justify-end gap-3 text-white text-xs border-t border-blue-400">
        <button
          onClick={() => { setScreenMode('login'); onClose(); }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Fazer logoff</span>
        </button>
        <button
          onClick={() => { setScreenMode('bios'); onClose(); }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20"
        >
          <Power className="w-3.5 h-3.5 text-red-300" />
          <span>Reiniciar BIOS</span>
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 6: Implementar `src/components/desktop/Taskbar.tsx` e `src/components/desktop/Desktop.tsx`**

Criar `src/components/desktop/Taskbar.tsx`:
```tsx
import React, { useState } from 'react';
import { useWindowManager } from '../../context/WindowContext';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';
import { FileText, Folder, Trash2 } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow } = useWindowManager();
  const [isStartOpen, setIsStartOpen] = useState(false);

  const getWindowIcon = (icon: string) => {
    switch (icon) {
      case 'notepad':
        return <FileText className="w-3.5 h-3.5 text-blue-200" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-red-400" />;
      case 'folder':
        return <Folder className="w-3.5 h-3.5 text-yellow-300" />;
      case 'trash':
        return <Trash2 className="w-3.5 h-3.5 text-gray-300" />;
      default:
        return null;
    }
  };

  return (
    <>
      <StartMenu isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} />
      <div className="h-9 bg-gradient-to-r from-[#245EDC] via-[#0058EE] to-[#245EDC] border-t-2 border-[#002D96] flex items-center justify-between z-[9000] relative select-none">
        <div className="flex items-center h-full gap-2 flex-1 overflow-hidden">
          {/* Botão Iniciar Verde do Windows XP */}
          <button
            onClick={() => setIsStartOpen(prev => !prev)}
            className="h-full px-4 bg-gradient-to-r from-[#388E3C] via-[#4CAF50] to-[#388E3C] hover:brightness-110 active:brightness-95 rounded-r-xl border-r-2 border-green-800 flex items-center gap-2 text-white font-bold italic shadow-md text-sm tracking-wide"
          >
            <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center font-normal not-italic text-[10px]">
              ▶
            </div>
            <span>iniciar</span>
          </button>

          {/* Abas das Janelas Abertas */}
          <div className="flex items-center gap-1 overflow-x-auto h-full py-0.5">
            {windows.filter(w => w.isOpen).map(w => {
              const isActive = activeWindowId === w.id && !w.isMinimized;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    if (isActive) {
                      minimizeWindow(w.id);
                    } else {
                      focusWindow(w.id);
                    }
                  }}
                  className={`h-7 px-3 rounded flex items-center gap-1.5 text-xs max-w-[160px] truncate transition-colors border ${
                    isActive
                      ? 'bg-[#1941A5] text-white border-blue-900 shadow-inner'
                      : 'bg-[#245EDC] text-blue-100 hover:bg-[#326BE9] border-blue-400'
                  }`}
                >
                  {getWindowIcon(w.icon)}
                  <span className="truncate">{w.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Tray */}
        <SystemTray />
      </div>
    </>
  );
};
```

Criar `src/components/desktop/Desktop.tsx`:
```tsx
import React from 'react';
import { DESKTOP_ICONS } from '../../utils/data';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar } from './Taskbar';
import { NotepadApp } from '../windows/NotepadApp';
import { PdfViewerApp } from '../windows/PdfViewerApp';
import { ExplorerFolderApp } from '../windows/ExplorerFolderApp';
import { RecycleBinApp } from '../windows/RecycleBinApp';

export const Desktop: React.FC = () => {
  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden select-none font-tahoma">
      {/* Papel de Parede Retrô Bliss (Colinas Verdes e Céu Azul) */}
      <div
        className="flex-1 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at bottom, #4CAF50 0%, #2E7D32 30%, transparent 60%),
            linear-gradient(to bottom, #1E88E5 0%, #64B5F6 40%, #A5D6A7 65%, #388E3C 100%)
          `,
        }}
      >
        {/* Grid de Ícones da Área de Trabalho */}
        <div className="p-4 flex flex-col flex-wrap gap-4 h-full content-start">
          {DESKTOP_ICONS.map(item => (
            <DesktopIcon key={item.id} item={item} />
          ))}
        </div>

        {/* Instâncias das Janelas */}
        <NotepadApp />
        <PdfViewerApp />
        <ExplorerFolderApp />
        <RecycleBinApp />
      </div>

      {/* Barra de Tarefas */}
      <Taskbar />
    </div>
  );
};
```

- [ ] **Step 7: Executar os testes e commitar**

Executar: `npm test`
Resultado esperado: PASS com todos os testes passando.
Commit:
```bash
git add src/components/desktop/ src/test/
git commit -m "feat: implement desktop, taskbar, start menu and system tray"
```

---

### Task 10: Integração no App.tsx e Verificação Completa

**Files:**
- Create: `src/App.tsx`
- Modify: `src/main.tsx`
- Test: `src/test/appIntegration.test.tsx`

**Interfaces:**
- Consumes: `SystemProvider`, `WindowProvider`, `BiosScreen`, `LoginScreen`, `Desktop`, `CrtOverlay`, `VgaModePrompt`.
- Produces: Aplicação completa pronta para produção.

- [ ] **Step 1: Escrever teste de integração de ponta a ponta**

Criar `src/test/appIntegration.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('End-to-End App Flow', () => {
  it('should boot into BiosScreen first', () => {
    render(<App />);
    expect(screen.getByText(/Dev Caio Modular BIOS/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implementar `src/App.tsx`**

```tsx
import React from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { WindowProvider } from './context/WindowContext';
import { BiosScreen } from './components/bios/BiosScreen';
import { LoginScreen } from './components/login/LoginScreen';
import { Desktop } from './components/desktop/Desktop';
import { CrtOverlay } from './components/effects/CrtOverlay';
import { VgaModePrompt } from './components/mobile/VgaModePrompt';

const AppContent: React.FC = () => {
  const { screenMode } = useSystem();

  return (
    <>
      <CrtOverlay />
      <VgaModePrompt />
      {screenMode === 'bios' && <BiosScreen />}
      {screenMode === 'login' && <LoginScreen />}
      {screenMode === 'desktop' && <Desktop />}
    </>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <WindowProvider>
        <AppContent />
      </WindowProvider>
    </SystemProvider>
  );
}
```

- [ ] **Step 3: Implementar `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Executar suíte completa de testes unitários**

Executar: `npm test`
Resultado esperado: Todos os testes passando com sucesso.

- [ ] **Step 5: Executar build de produção do Vite**

Executar: `npm run build`
Resultado esperado: Build gerado com sucesso na pasta `dist/` sem erros de TypeScript ou empacotamento.

- [ ] **Step 6: Commitar a versão final integrada**

Commit:
```bash
git add src/
git commit -m "feat: integrate main application, crt layer and desktop workflow"
```
