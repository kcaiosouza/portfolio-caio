# Design Spec: Winamp 2.x Classic Music Player & Eclectic Music Notepad

**Date:** 2026-10-03  
**Status:** Approved  
**Author:** Antigravity & Caio Souza  

---

## 1. Overview & Goals
Implement an authentic, nostalgic replica of the classic **Winamp 2.91** (classic base skin) within the Windows XP portfolio (`portfolio-caio-xp`), complete with real audio playback, Web Audio spectrum analyzer, 10-band graphic equalizer, magnetic snapping between windows, drag-and-drop playlist management, and a revamped eclectic music notepad document (`Minhas_Musicas.txt`) reflecting Caio's genuine musical identity.

---

## 2. Window Architecture & Magnetic Docking System

### 2.1 The Three Modular Windows
Winamp 2.x consists of three distinct modular window components that can exist individually or docked together:
1. **Main Player Window (`WinampMainWindow.tsx` / `winamp-main`):**
   - **Dimensions:** Width: 275px, Height: 116px (classic 1:1 scale proportions).
   - **Titlebar:** Lightning bolt icon, "WINAMP", Minimize `_`, Windowshade rollup button, and Close `×`.
   - **Time Display:** Green digital 7-segment LED display (`01:51`), toggleable between elapsed and remaining time.
   - **Visualizer Area:** Real-time 16-band spectrum analyzer (green/yellow bars with peak decay) and oscilloscope mode.
   - **Track Marquee:** Scrolling green text displaying track index, artist, song title, and duration (`1. My Prayer - Editora Árvore da Vida (3:45)`).
   - **Audio Info Display:** Bitrate and sample rate indicators (`128 kbps`, `44 kHz`, `mono` / `stereo`).
   - **Volume & Balance Sliders:** Retro beveled horizontal sliders with textured metallic thumb buttons.
   - **Module Toggles:** `EQ` and `PL` toggle buttons that show/hide or dock/undock the Equalizer and Playlist windows.
   - **Playback Controls:** Previous (`|<<`), Play (`>`), Pause (`||`), Stop (`■`), Next (`>>`), Eject/Open (`⏏`), Shuffle, and Repeat.

2. **Equalizer Window (`WinampEqualizerWindow.tsx` / `winamp-eq`):**
   - **Dimensions:** Width: 275px, Height: 116px.
   - **Controls:**
     - Toggle switches: `ON` (enables/disables EQ processing) and `AUTO`.
     - 10 Frequency Band Sliders: `60Hz`, `170Hz`, `310Hz`, `600Hz`, `1KHz`, `3KHz`, `6KHz`, `12KHz`, `14KHz`, `16KHz` with ranges from `-12dB` to `+12dB`.
     - 1 Preamp Slider (`-12dB` to `+12dB`).
     - Spline EQ curve graphic preview above the sliders.
     - Presets popover menu (`Flat`, `Rock`, `Pop`, `Bass Boost`, `Club`, `Acoustic`, `Vocal`).

3. **Playlist Window (`WinampPlaylistWindow.tsx` / `winamp-pl`):**
   - **Dimensions:** Width: 275px, Height: 232px (expandable height).
   - **Track List:** Deep black background with green monospace retro terminal text. Shows track number, title, and duration.
   - **Active Song Highlight:** Inverted / highlighted row for currently playing song; double-clicking a song plays it immediately.
   - **Action Bar:** `+ ADD` (Add file from computer or Add URL), `- REM` (Remove track), `SEL` (Select), `MISC` (Sort/Clear).
   - **Status & Mini Controls:** Total duration counter (`0:00 / 27:45`), mini transport buttons (`|< < || ■ >|`), and time display.
   - **Drag & Drop Target:** User can drag any audio file (`.mp3`, `.wav`, `.ogg`, `.m4a`) from their desktop into the playlist window.

### 2.2 Magnetic Docking Engine (`useWinampDocking.ts`)
- **Docking Distance:** 18px magnetic threshold.
- **Snapping Logic:**
  - If Equalizer is dragged within 18px below Main Window, it snaps to `x = main.x`, `y = main.y + main.height`.
  - If Playlist is dragged within 18px below Equalizer (or below Main if EQ is hidden), it snaps seamlessly to the bottom.
  - Snapping to left or right sides is supported.
- **Group Movement:** Dragging the titlebar of the Main Window moves all currently docked sub-windows together by the same `(deltaX, deltaY)`.
- **Breakaway:** Dragging a child window with an offset exceeding the magnetic snap threshold detaches it cleanly into an independent floating window.
- **Windowshade Mode:** Clicking the rollup button collapses the window to just its 14px titlebar while keeping docking intact.

---

## 3. Audio & Signal Processing Engine (`winampAudioEngine.ts`)

### 3.1 Audio Graph Architecture
1. **HTML5 `<audio>` element:** Serves as the primary playback engine, ensuring full cross-origin and local blob URL playback without interruption.
2. **Web Audio Context:**
   - Source node created via `AudioContext.createMediaElementSource(audioElement)` with safe fallback.
   - **10 BiquadFilterNodes:** Chain of peaking filters corresponding to the 10 EQ bands:
     `60Hz`, `170Hz`, `310Hz`, `600Hz`, `1000Hz`, `3000Hz`, `6000Hz`, `12000Hz`, `14000Hz`, `16000Hz`.
   - **GainNode (Preamp):** Modulates overall signal gain.
   - **GainNode (Volume):** Controlled by the volume slider.
   - **StereoPannerNode:** Controlled by the balance slider (`-1.0` to `+1.0`).
   - **AnalyserNode (FFT):** `fftSize = 64` or `128` providing real frequency bins for the visualizer.
   - **Fallback Simulator:** If a remote media host prevents audio element inspection via CORS security, a procedural rhythm-synced FFT generator calculates dynamic bouncing bars in sync with track playback so the visualizer is never frozen.

---

## 4. Track Roster & Default Playlist

### 4.1 Built-in Songs
1. **Track 0:** *"Winamp Intro - It Really Whips the Llama's Ass!"* 🦙 (Classic 5s synthesized/voice intro).
2. **Track 1:** *"My Prayer"* — Editora Árvore da Vida  
   URL: `https://storage.minklab.cloud/podcrer-media/audio/48a3201c-314c-49b8-ae24-4462b832cef2.mp3`
3. **Track 2:** *"Anelo por Tua Presença"* — Editora Árvore da Vida  
   URL: `https://storage.minklab.cloud/podcrer-media/audio/3ccbd100-ee53-4884-a701-288271f8beb0.mp3`
4. **Track 3:** *"Crusher-P - Echo"* (Featured in the authentic classic skin screenshot)
5. **Track 4:** *"M83 - Midnight City (Retro Synth Edit)"*

### 4.2 Local File Drag-and-Drop & Custom URLs
- Any file dropped onto the Playlist creates an `objectURL` via `URL.createObjectURL(file)`, reads ID3 metadata/filename, and appends it to the playlist.
- Clicking `ADD > Add URL` prompts the user for a direct MP3 stream or link.

---

## 5. Eclectic Music Notepad Document (`Minhas_Musicas.txt`)
Replace `Musica_e_Lofi.txt` in the Hobbies folder and `WindowContext` with `Minhas_Musicas.txt`:
- Document title: `Minhas_Musicas.txt - Bloco de notas`
- Header: ASCII art header matching `sobre-caio.txt`.
- Content highlights:
  - Statement of authentic eclectic musical taste: Pop nacional e internacional, sertanejo raiz e universitário, rap, funk, pop rock, gospel e country.
  - The direct link between music and software: creator of **IGCG Music** (`igcgmusic.com.br`) and **Hinário EAV** (Google Play Store).
  - Categorized list of TOP favorite songs and artists.
  - Invitation to launch Winamp from the desktop.

---

## 6. System & Desktop Integration
1. **Desktop Icon:**
   - Label: `Winamp`
   - Icon: Authentic yellow lightning bolt over dark metallic square.
   - Action: Opens Winamp with Main, EQ, and Playlist docked.
2. **Start Menu:** Added under All Programs and favorites column.
3. **Taskbar:** Tab displays `Winamp` with active track title and lightning icon.
4. **Command Prompt (CMD):** Commands `winamp`, `music`, `player` launch the application.
5. **Task Manager:** Process `winamp.exe` registered in Applications and Processes lists.

---

## 7. Verification & Testing Strategy
- Unit tests for audio state, playlist operations, and EQ preset loading.
- Docking geometry tests verifying snap detection and multi-window position syncing.
- Visual component render tests for Main Window, Equalizer, and Playlist Window.
- Integration tests ensuring Desktop icon, Start Menu, CMD command, and Notepad document work seamlessly.
- TypeScript verification (`tsc --noEmit`) and production bundle verification (`vite build`).
