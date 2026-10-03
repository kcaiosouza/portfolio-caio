import React, { useRef, useEffect, useState } from 'react';
import { WinampTrack } from '../../../types/winamp';
import { winampAudioEngine } from '../../../utils/winampAudioEngine';
import {
  Repeat,
  Zap,
  Minus,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export interface WinampMainWindowProps {
  currentTrack: WinampTrack | null;
  currentTrackIndex?: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  balance: number;
  isEqOpen: boolean;
  isPlOpen: boolean;
  isShade?: boolean;
  isShuffle?: boolean;
  isRepeat?: boolean;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onBalanceChange: (bal: number) => void;
  onToggleEq: () => void;
  onTogglePl: () => void;
  onToggleShade: () => void;
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
  onOpenFiles?: () => void;
  onAddFiles?: (files: File[]) => void;
  onMinimize?: () => void;
  onClose?: () => void;
  onStartDrag?: (e: React.MouseEvent) => void;
}

// Authentic 7-Segment SVG LED digit with glowing lit segments & unlit ghosting
const SevenSegmentDigit: React.FC<{ char: string }> = ({ char }) => {
  const segmentsMap: Record<string, string[]> = {
    '0': ['a', 'b', 'c', 'd', 'e', 'f'],
    '1': ['b', 'c'],
    '2': ['a', 'b', 'd', 'e', 'g'],
    '3': ['a', 'b', 'c', 'd', 'g'],
    '4': ['b', 'c', 'f', 'g'],
    '5': ['a', 'c', 'd', 'f', 'g'],
    '6': ['a', 'c', 'd', 'e', 'f', 'g'],
    '7': ['a', 'b', 'c'],
    '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    '9': ['a', 'b', 'c', 'd', 'f', 'g'],
    '-': ['g'],
  };

  const active = segmentsMap[char] || [];
  const litColor = '#00FF00';
  const ghostColor = '#022402';

  return (
    <svg viewBox="0 0 11 18" className="w-[8px] h-[13px] flex-shrink-0">
      {/* a - Top horizontal */}
      <polygon
        points="1.5,1.5 2.5,0.5 8.5,0.5 9.5,1.5 8.5,2.5 2.5,2.5"
        fill={active.includes('a') ? litColor : ghostColor}
        className={active.includes('a') ? 'drop-shadow-[0_0_1.5px_#00FF00]' : ''}
      />
      {/* b - Top Right vertical */}
      <polygon
        points="9.5,1.8 10.5,2.8 10.5,7.8 9.5,8.8 8.5,7.8 8.5,2.8"
        fill={active.includes('b') ? litColor : ghostColor}
        className={active.includes('b') ? 'drop-shadow-[0_0_1.5px_#00FF00]' : ''}
      />
      {/* c - Bottom Right vertical */}
      <polygon
        points="9.5,9.2 10.5,10.2 10.5,15.2 9.5,16.2 8.5,15.2 8.5,10.2"
        fill={active.includes('c') ? litColor : ghostColor}
        className={active.includes('c') ? 'drop-shadow-[0_0_1.5px_#00FF00]' : ''}
      />
      {/* d - Bottom horizontal */}
      <polygon
        points="1.5,16.5 2.5,15.5 8.5,15.5 9.5,16.5 8.5,17.5 2.5,17.5"
        fill={active.includes('d') ? litColor : ghostColor}
        className={active.includes('d') ? 'drop-shadow-[0_0_1.5px_#00FF00]' : ''}
      />
      {/* e - Bottom Left vertical */}
      <polygon
        points="1.5,9.2 2.5,10.2 2.5,15.2 1.5,16.2 0.5,15.2 0.5,10.2"
        fill={active.includes('e') ? litColor : ghostColor}
        className={active.includes('e') ? 'drop-shadow-[0_0_1.5px_#00FF00]' : ''}
      />
      {/* f - Top Left vertical */}
      <polygon
        points="1.5,1.8 2.5,2.8 2.5,7.8 1.5,8.8 0.5,7.8 0.5,2.8"
        fill={active.includes('f') ? litColor : ghostColor}
        className={active.includes('f') ? 'drop-shadow-[0_0_1.5px_#00FF00]' : ''}
      />
      {/* g - Middle horizontal */}
      <polygon
        points="1.5,9 2.5,8 8.5,8 9.5,9 8.5,10 2.5,10"
        fill={active.includes('g') ? litColor : ghostColor}
        className={active.includes('g') ? 'drop-shadow-[0_0_1.5px_#00FF00]' : ''}
      />
    </svg>
  );
};

const SevenSegmentColon: React.FC = () => (
  <svg viewBox="0 0 5 18" className="w-[3px] h-[13px] flex-shrink-0">
    <rect x="1.5" y="4" width="2" height="2" fill="#00FF00" className="drop-shadow-[0_0_1.5px_#00FF00]" />
    <rect x="1.5" y="10.5" width="2" height="2" fill="#00FF00" className="drop-shadow-[0_0_1.5px_#00FF00]" />
  </svg>
);

export const WinampMainWindow: React.FC<WinampMainWindowProps> = ({
  currentTrack,
  currentTrackIndex = 0,
  isPlaying,
  currentTime,
  duration,
  volume,
  balance,
  isEqOpen,
  isPlOpen,
  isShade = false,
  isShuffle = false,
  isRepeat = false,
  onPlayToggle,
  onPrev,
  onNext,
  onStop,
  onSeek,
  onVolumeChange,
  onBalanceChange,
  onToggleEq,
  onTogglePl,
  onToggleShade,
  onToggleShuffle,
  onToggleRepeat,
  onOpenFiles,
  onAddFiles,
  onMinimize,
  onClose,
  onStartDrag,
}) => {
  const [showRemaining, setShowRemaining] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Time calculations
  const displaySeconds = showRemaining ? Math.max(0, duration - currentTime) : currentTime;
  const mins = Math.floor(displaySeconds / 60);
  const secs = Math.floor(displaySeconds % 60);
  const minTens = String(Math.floor(mins / 10));
  const minUnits = String(mins % 10);
  const secTens = String(Math.floor(secs / 10));
  const secUnits = String(secs % 10);

  // Track label display for marquee
  const trackNum = currentTrackIndex + 1;
  const marqueeText = currentTrack
    ? `${trackNum}. ${currentTrack.artist} - ${currentTrack.title} (${currentTrack.durationFormatted})`
    : 'Winamp 2.91 - Sem faixa carregada';

  // Real-time canvas visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numBars = 16;
    const barWidth = 3;
    const barGap = 1.5;
    const heights = new Array(numBars).fill(0);
    const peaks = new Array(numBars).fill(0);
    const fftBuffer = new Uint8Array(32);

    const render = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw blue frequency scale axis on the far left (Winamp classic style)
      ctx.strokeStyle = '#2580D8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(1.5, 1);
      ctx.lineTo(1.5, canvas.height - 1);
      ctx.moveTo(1.5, 3.5);
      ctx.lineTo(3.5, 3.5);
      ctx.moveTo(1.5, 8.5);
      ctx.lineTo(3.5, 8.5);
      ctx.moveTo(1.5, 13.5);
      ctx.lineTo(3.5, 13.5);
      ctx.stroke();

      if (isPlaying) {
        winampAudioEngine.getFftData(fftBuffer);
      } else {
        fftBuffer.fill(0);
      }

      const startX = 5;
      for (let i = 0; i < numBars; i++) {
        const val = isPlaying ? fftBuffer[i * 2] || 0 : 0;
        const targetHeight = Math.min(canvas.height - 2, Math.floor((val / 255) * (canvas.height - 2)));
        heights[i] = heights[i] * 0.7 + targetHeight * 0.3;

        // Falling peaks
        if (targetHeight >= peaks[i]) {
          peaks[i] = targetHeight;
        } else {
          peaks[i] = Math.max(0, peaks[i] - 0.4);
        }

        const x = startX + i * (barWidth + barGap);
        const h = Math.round(heights[i]);

        // Draw segmented horizontal bars (green at bottom, yellow in mid, red at top)
        for (let b = 0; b < h; b += 2) {
          const segY = canvas.height - b - 2;
          if (segY < 4) {
            ctx.fillStyle = '#FF3300'; // red/orange peak
          } else if (segY < 8) {
            ctx.fillStyle = '#FFFF00'; // yellow
          } else {
            ctx.fillStyle = '#00FF00'; // bright green
          }
          ctx.fillRect(x, segY, barWidth, 1.5);
        }

        // Floating white peak cap
        if (peaks[i] > 1) {
          const peakY = canvas.height - Math.round(peaks[i]) - 1;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, peakY, barWidth, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleEjectClick = () => {
    if (onOpenFiles) {
      onOpenFiles();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className="w-[275px] bg-gradient-to-b from-[#313348] via-[#212330] to-[#14151E] border border-[#52556E] shadow-[2px_2px_8px_rgba(0,0,0,0.8)] font-mono select-none text-white rounded-t-[3px] rounded-b-[2px] relative overflow-hidden"
      style={{ height: isShade ? '14px' : '116px' }}
    >
      {/* Hidden file input for Eject / Open */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = e.target.files;
          if (files && files.length > 0 && onAddFiles) {
            onAddFiles(Array.from(files));
          }
        }}
      />

      {/* Titlebar (Height: 14px) */}
      <div
        onMouseDown={onStartDrag}
        className="h-[14px] bg-gradient-to-r from-[#202230] via-[#35384F] to-[#202230] px-1 flex items-center justify-between cursor-move border-b border-[#12131A]"
      >
        <div className="flex items-center gap-1 min-w-0">
          <Zap className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          <span className="text-[9px] font-bold tracking-wider text-gray-200 uppercase drop-shadow">
            WINAMP
          </span>
        </div>

        <div className="flex items-center gap-[1px]">
          <button
            type="button"
            onClick={onMinimize}
            className="w-2.5 h-2.5 flex items-center justify-center bg-[#2B2E3D] hover:bg-gray-600 border border-gray-500 rounded-[1px] text-[7px]"
            title="Minimizar"
          >
            <Minus className="w-2 h-2 text-gray-300" />
          </button>
          <button
            type="button"
            onClick={onToggleShade}
            className="w-2.5 h-2.5 flex items-center justify-center bg-[#2B2E3D] hover:bg-gray-600 border border-gray-500 rounded-[1px] text-[7px]"
            title="Windowshade (Rollup)"
          >
            {isShade ? (
              <ChevronDown className="w-2 h-2 text-gray-300" />
            ) : (
              <ChevronUp className="w-2 h-2 text-gray-300" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-2.5 h-2.5 flex items-center justify-center bg-[#5A2323] hover:bg-red-600 border border-red-400 rounded-[1px] text-[7px]"
            title="Fechar"
          >
            <X className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>

      {!isShade && (
        <div className="px-1.5 pt-1 pb-1 space-y-[3px]">
          {/* Deck 1: Left Display & Right Display (Height: 43px) */}
          <div className="flex gap-1 items-stretch h-[43px]">
            {/* Left Display Box: Indicators, 7-Segment Clock, Spectrum Analyzer */}
            <div className="w-[108px] h-[43px] bg-black border border-[#3A3C4D] p-1 flex items-center justify-between rounded-[1px] relative overflow-hidden shadow-inner">
              {/* Left indicator column: dots, letters O A I D V, play symbol */}
              <div className="flex flex-col items-center justify-between h-full w-[12px] select-none text-[6px] font-mono text-gray-500 font-bold border-r border-[#1F202B] pr-0.5">
                <div className="flex flex-col gap-0.5 items-center">
                  <div className="w-1.5 h-1 bg-[#00FF00] rounded-[0.5px] shadow-[0_0_2px_#00FF00]" title="Power/Audio OK" />
                  <div className="w-1.5 h-1 bg-[#CC2200] rounded-[0.5px]" />
                </div>
                <div className="flex flex-col leading-none text-center">
                  <span>O</span>
                  <span>A</span>
                  <span>I</span>
                  <span>D</span>
                  <span>V</span>
                </div>
                {/* Play status glyph */}
                <div className="text-[7px] font-bold">
                  {isPlaying ? (
                    <span className="text-[#00FF00] drop-shadow-[0_0_2px_#00FF00]">▶</span>
                  ) : currentTime > 0 ? (
                    <span className="text-yellow-400">❚❚</span>
                  ) : (
                    <span className="text-gray-600">■</span>
                  )}
                </div>
              </div>

              {/* Right column inside Left Box: Clock on Top, Spectrum on Bottom (NO OVERLAP) */}
              <div className="flex-1 flex flex-col justify-between h-full pl-1">
                {/* Top Row: 7-Segment LED Digital Clock */}
                <div
                  onClick={() => setShowRemaining(prev => !prev)}
                  className="flex items-center justify-end gap-[1.5px] cursor-pointer pt-0.5 pr-0.5"
                  title="Clique para alternar entre tempo decorrido e restante"
                >
                  {showRemaining && <SevenSegmentDigit char="-" />}
                  <SevenSegmentDigit char={minTens} />
                  <SevenSegmentDigit char={minUnits} />
                  <SevenSegmentColon />
                  <SevenSegmentDigit char={secTens} />
                  <SevenSegmentDigit char={secUnits} />
                </div>

                {/* Bottom Row: Spectrum Visualizer Canvas */}
                <div className="pb-0.5">
                  <canvas
                    ref={canvasRef}
                    width={78}
                    height={16}
                    className="block"
                  />
                </div>
              </div>
            </div>

            {/* Right Display Box: Marquee Song Title & Stream Bitrate Info */}
            <div className="flex-1 h-[43px] bg-black border border-[#3A3C4D] p-1 rounded-[1px] flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Marquee Song Title */}
              <div className="h-[18px] bg-[#050508] border border-[#222430] px-1 flex items-center overflow-hidden">
                <div className="winamp-marquee text-[#00FF00] text-[9px] font-bold font-mono tracking-tight drop-shadow-[0_0_2px_#00FF00]">
                  {marqueeText}
                </div>
              </div>

              {/* Bitrate, Sample Rate & Channels */}
              <div className="flex items-center justify-between text-[7.5px] px-0.5 pt-0.5 font-mono">
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    <span className="px-1 py-[0.5px] bg-[#0A0B10] border border-[#2A2B38] text-[#00FF00] rounded-[1px] font-mono text-[7.5px] font-bold">
                      128
                    </span>
                    <span className="text-gray-400 font-bold">kbps</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="px-1 py-[0.5px] bg-[#0A0B10] border border-[#2A2B38] text-[#00FF00] rounded-[1px] font-mono text-[7.5px] font-bold">
                      48
                    </span>
                    <span className="text-gray-400 font-bold">kHz</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-600 font-bold">mono</span>
                  <span className="text-[#00FF00] font-bold drop-shadow-[0_0_2px_#00FF00]">stereo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deck 2: Sliders (Volume, Balance) & Module Buttons (EQ, PL) (Height: 14px) */}
          <div className="flex items-center gap-1 h-[14px]">
            {/* Volume slider (Modern colored style as requested by user) */}
            <div className="flex-1 flex items-center gap-1 bg-[#14151E] px-1 border border-[#3A3C4D] rounded-[1px] h-[14px]">
              <span className="text-[7px] text-gray-400 font-bold">VOL</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={e => onVolumeChange(Number(e.target.value))}
                className="w-full h-1 accent-[#FF9900] bg-gray-700 cursor-pointer"
                title={`Volume: ${volume}%`}
              />
            </div>

            {/* Balance slider (Modern colored style) */}
            <div className="w-[66px] flex items-center gap-1 bg-[#14151E] px-1 border border-[#3A3C4D] rounded-[1px] h-[14px]">
              <span className="text-[7px] text-gray-400 font-bold">BAL</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={balance}
                onChange={e => onBalanceChange(Number(e.target.value))}
                className="w-full h-1 accent-[#00FF00] bg-gray-700 cursor-pointer"
                title={`Balanço: ${balance === 0 ? 'Centro' : balance < 0 ? `L ${Math.abs(balance * 100)}%` : `R ${balance * 100}%`}`}
              />
            </div>

            {/* EQ Button with green corner LED indicator */}
            <button
              type="button"
              onClick={onToggleEq}
              className="w-[23px] h-[14px] bg-gradient-to-b from-[#3E4154] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1px] rounded-[1px] flex items-center justify-center gap-0.5 cursor-pointer active:from-[#1E202B] active:to-[#3E4154]"
              title="Alternar Equalizador (EQ)"
            >
              <span
                className={`w-1 h-1 rounded-[0.5px] ${
                  isEqOpen ? 'bg-[#00FF00] shadow-[0_0_2px_#00FF00]' : 'bg-[#002800]'
                }`}
              />
              <span className="text-[7.5px] font-bold text-gray-200">EQ</span>
            </button>

            {/* PL Button with green corner LED indicator */}
            <button
              type="button"
              onClick={onTogglePl}
              className="w-[23px] h-[14px] bg-gradient-to-b from-[#3E4154] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1px] rounded-[1px] flex items-center justify-center gap-0.5 cursor-pointer active:from-[#1E202B] active:to-[#3E4154]"
              title="Alternar Playlist (PL)"
            >
              <span
                className={`w-1 h-1 rounded-[0.5px] ${
                  isPlOpen ? 'bg-[#00FF00] shadow-[0_0_2px_#00FF00]' : 'bg-[#002800]'
                }`}
              />
              <span className="text-[7.5px] font-bold text-gray-200">PL</span>
            </button>
          </div>

          {/* Deck 3: Track Position Seeker Bar (Height: 10px) */}
          <div className="bg-black border border-[#2A2B38] h-[8px] flex items-center px-0.5 rounded-[1px]">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={e => onSeek(Number(e.target.value))}
              className="w-full h-1 accent-[#D4A017] bg-gray-800 cursor-pointer"
              title="Arrastar para avançar ou retroceder a faixa"
            />
          </div>

          {/* Deck 4: Bottom Transport Buttons Row (Height: 20px) */}
          <div className="flex items-center justify-between h-[20px] pt-0.5">
            {/* 5 Main Transport Buttons + Eject */}
            <div className="flex items-center gap-[2px]">
              {/* Previous Track */}
              <button
                type="button"
                onClick={onPrev}
                aria-label="anterior"
                className="w-[22px] h-[18px] bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center cursor-pointer hover:brightness-110 active:border-t-[#10121A] active:border-l-[#10121A] active:border-b-[#6B6F8A] active:border-r-[#6B6F8A] active:from-[#1E202B] active:to-[#3E4154]"
                title="Faixa anterior"
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3 fill-gray-200">
                  <rect x="2" y="3.5" width="2" height="9" />
                  <polygon points="8.5,8 14,3.5 14,12.5" />
                  <polygon points="3.5,8 9,3.5 9,12.5" />
                </svg>
              </button>

              {/* Play */}
              <button
                type="button"
                onClick={onPlayToggle}
                aria-label="play"
                className="w-[22px] h-[18px] bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center cursor-pointer hover:brightness-110 active:border-t-[#10121A] active:border-l-[#10121A] active:border-b-[#6B6F8A] active:border-r-[#6B6F8A] active:from-[#1E202B] active:to-[#3E4154]"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3 fill-gray-200 ml-0.5">
                  <polygon points="3.5,3 13.5,8 3.5,13" />
                </svg>
              </button>

              {/* Pause */}
              <button
                type="button"
                onClick={onPlayToggle}
                aria-label="pause"
                className="w-[22px] h-[18px] bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center cursor-pointer hover:brightness-110 active:border-t-[#10121A] active:border-l-[#10121A] active:border-b-[#6B6F8A] active:border-r-[#6B6F8A] active:from-[#1E202B] active:to-[#3E4154]"
                title="Pausar"
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3 fill-gray-200">
                  <rect x="3.5" y="3.5" width="3" height="9" />
                  <rect x="9.5" y="3.5" width="3" height="9" />
                </svg>
              </button>

              {/* Stop */}
              <button
                type="button"
                onClick={onStop}
                aria-label="stop"
                className="w-[22px] h-[18px] bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center cursor-pointer hover:brightness-110 active:border-t-[#10121A] active:border-l-[#10121A] active:border-b-[#6B6F8A] active:border-r-[#6B6F8A] active:from-[#1E202B] active:to-[#3E4154]"
                title="Parar"
              >
                <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-gray-200">
                  <rect x="3" y="3" width="10" height="10" />
                </svg>
              </button>

              {/* Next Track */}
              <button
                type="button"
                onClick={onNext}
                aria-label="proximo"
                className="w-[22px] h-[18px] bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center cursor-pointer hover:brightness-110 active:border-t-[#10121A] active:border-l-[#10121A] active:border-b-[#6B6F8A] active:border-r-[#6B6F8A] active:from-[#1E202B] active:to-[#3E4154]"
                title="Próxima faixa"
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3 fill-gray-200">
                  <polygon points="7.5,8 2,3.5 2,12.5" />
                  <polygon points="12.5,8 7,3.5 7,12.5" />
                  <rect x="12" y="3.5" width="2" height="9" />
                </svg>
              </button>

              {/* Eject / Open */}
              <button
                type="button"
                onClick={handleEjectClick}
                aria-label="ejetar"
                className="w-[22px] h-[18px] bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center cursor-pointer hover:brightness-110 active:border-t-[#10121A] active:border-l-[#10121A] active:border-b-[#6B6F8A] active:border-r-[#6B6F8A] active:from-[#1E202B] active:to-[#3E4154]"
                title="Ejetar / Abrir arquivo do computador"
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3 fill-gray-200">
                  <polygon points="8,3 2.5,9.5 13.5,9.5" />
                  <rect x="2.5" y="11.5" width="11" height="2" />
                </svg>
              </button>
            </div>

            {/* Shuffle, Repeat & Winamp Logo */}
            <div className="flex items-center gap-[3px]">
              {/* Shuffle button with green LED corner */}
              <button
                type="button"
                onClick={onToggleShuffle}
                className="h-[17px] px-1.5 bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center gap-1 cursor-pointer hover:brightness-110 active:from-[#1E202B] active:to-[#3E4154]"
                title="Modo aleatório (Shuffle)"
              >
                <span
                  className={`w-1 h-1 rounded-[0.5px] ${
                    isShuffle ? 'bg-[#00FF00] shadow-[0_0_2px_#00FF00]' : 'bg-[#002800]'
                  }`}
                />
                <span className={`text-[7px] font-bold tracking-tighter ${isShuffle ? 'text-white' : 'text-gray-300'}`}>
                  SHUFFLE
                </span>
              </button>

              {/* Repeat button with green LED corner */}
              <button
                type="button"
                onClick={onToggleRepeat}
                className="h-[17px] px-1.5 bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center gap-1 cursor-pointer hover:brightness-110 active:from-[#1E202B] active:to-[#3E4154]"
                title="Repetir faixa (Repeat)"
              >
                <span
                  className={`w-1 h-1 rounded-[0.5px] ${
                    isRepeat ? 'bg-[#00FF00] shadow-[0_0_2px_#00FF00]' : 'bg-[#002800]'
                  }`}
                />
                <Repeat className={`w-2.5 h-2.5 ${isRepeat ? 'text-white' : 'text-gray-300'}`} />
              </button>

              {/* Classic Winamp Lightning Logo button */}
              <div
                className="w-[20px] h-[18px] bg-gradient-to-b from-[#3E4154] via-[#2E3142] to-[#1E202B] border-t-[#6B6F8A] border-l-[#6B6F8A] border-b-[#10121A] border-r-[#10121A] border-[1.5px] rounded-[1px] flex items-center justify-center cursor-pointer hover:brightness-110"
                title="Winamp 2.91 Classic"
              >
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400 drop-shadow-[0_0_2px_#EAB308]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinampMainWindow;
