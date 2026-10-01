# Design Spec: Windows XP Classic Blue Screen of Death (BSOD)

**Date:** 2026-10-01  
**Status:** Approved  
**Author:** Antigravity & Caio Souza  

## 1. Overview & Objectives

Implement an authentic, nostalgic Windows XP Blue Screen of Death (Tela Azul da Morte - BSOD) triggered when a user forcibly terminates the critical `System` process inside the Task Manager (`TaskManagerApp.tsx`).

### Core Features:
1. **Trigger Condition**:
   - In the Task Manager's "Processos" tab, selecting the `System` process (PID 4) and clicking "Finalizar processo" immediately triggers the BSOD without a block dialog.
2. **Visual Fidelity**:
   - Background color: Classic Windows XP BSOD royal blue `#0000AA`.
   - Typography: Crisp white `#FFFFFF`, monospace font (`"Lucida Console", "Courier New", monospace`).
   - Authentic stop error message: `CRITICAL_OBJECT_TERMINATION` with error code `*** STOP: 0x000000F4 (0x00000003, 0x82C74020, 0x82C74194, 0x805D297C)`.
   - Integrated with the existing CRT shader overlay (`CrtOverlay.tsx`).
3. **Dynamic Memory Dump & Lifecycle**:
   - Progressive simulated physical memory dump from 0% to 100%.
   - Automatic restart to the retro BIOS boot sequence (`setScreenMode('bios')`) after ~6 seconds.
   - Immediate restart override upon pressing any key (`keydown`) or clicking anywhere on the screen.
   - Clean timer and event listener teardown on component unmount.

---

## 2. Architecture & File Structure

```
portfolio-caio/
├── src/
│   ├── types/
│   │   └── index.ts                 # Expands ScreenMode with 'bsod'
│   ├── context/
│   │   └── SystemContext.tsx        # Supports 'bsod' screenMode state
│   ├── components/
│   │   ├── bsod/
│   │   │   └── BsodScreen.tsx       # Dedicated BSOD visual and interaction component
│   │   └── windows/
│   │       └── TaskManagerApp.tsx   # Triggers setScreenMode('bsod') on 'System' kill
│   ├── App.tsx                      # Renders <BsodScreen /> when screenMode === 'bsod'
│   └── test/
│       ├── BsodScreen.test.tsx      # Tests BSOD rendering, memory dump, keypress/click reboot
│       └── TaskManagerApp.test.tsx  # Verifies terminating 'System' triggers 'bsod'
```

---

## 3. Detailed Specifications

### 3.1 `types/index.ts` & `SystemContext.tsx`
- Expand `ScreenMode`:
  ```typescript
  export type ScreenMode = 'bios' | 'login' | 'desktop' | 'bsod';
  ```
- Ensure `useSystem().setScreenMode('bsod')` is accessible to window components.

### 3.2 `BsodScreen.tsx`
- **State**:
  - `dumpProgress`: number (0 to 100). Increments over ~4 seconds.
  - `isDumpComplete`: boolean.
- **Audio & Sound**:
  - Plays short error/warning tone via `soundEngine` if audio is not muted.
- **Copy**:
  ```text
  Foi detectado um problema e o Caio XP foi desligado para evitar danos
  ao computador.

  CRITICAL_OBJECT_TERMINATION

  Se esta for a primeira vez que você vê esta tela de erro de parada,
  reinicie o computador. Se esta tela for exibida novamente, siga
  estas etapas:

  Certifique-se de que não finalizou processos vitais do kernel no Gerenciador
  de Tarefas. Se novos componentes foram instalados, desinstale-os.

  Informações técnicas:

  *** STOP: 0x000000F4 (0x00000003, 0x82C74020, 0x82C74194, 0x805D297C)

  Iniciando despejo de memória física...
  Despejo de memória física: {dumpProgress}%
  {isDumpComplete ? 'Despejo de memória física concluído.\nReinicializando o sistema... (ou pressione qualquer tecla)' : ''}
  ```
- **Exit & Reboot Mechanism**:
  - Automatic timeout at ~6 seconds calling `setScreenMode('bios')`.
  - Window listener for `keydown` and container `onClick` immediately calling `setScreenMode('bios')`.

### 3.3 `TaskManagerApp.tsx`
- In `handleEndProcess`:
  ```typescript
  if (proc.name === 'System' || proc.pid === 4) {
    setScreenMode('bsod');
    return;
  }
  ```
- Keep safe protection for `explorer.exe` (restarting shell or alert) while allowing `System` to trigger BSOD.

### 3.4 `App.tsx`
- Conditional rendering:
  ```tsx
  {screenMode === 'bios' && <BiosScreen />}
  {screenMode === 'login' && <LoginScreen />}
  {screenMode === 'desktop' && <Desktop />}
  {screenMode === 'bsod' && <BsodScreen />}
  ```

---

## 4. Testing & Verification

1. **`BsodScreen.test.tsx`**:
   - Verifies stop code `CRITICAL_OBJECT_TERMINATION` and `0x000000F4` are rendered.
   - Verifies pressing any key calls `setScreenMode('bios')`.
   - Verifies clicking on the BSOD screen calls `setScreenMode('bios')`.
2. **`TaskManagerApp.test.tsx`**:
   - Verifies selecting `System` and clicking "Finalizar processo" calls `setScreenMode('bsod')`.
3. **Typecheck & Production Build**:
   - `npx tsc --noEmit` exits with 0 errors.
   - `npm run build` generates production bundle without issues.
