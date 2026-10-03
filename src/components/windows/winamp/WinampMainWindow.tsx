import React, { useRef, useEffect, useState } from 'react';
import { WinampTrack } from '../../../types/winamp';
import { winampAudioEngine } from '../../../utils/winampAudioEngine';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  FolderOpen,
  Shuffle,
  Repeat,
  Zap,
  Minus,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export interface WinampMainWindowProps {
  currentTrack: WinampTrack | null;
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
  onMinimize?: () => void;
  onClose?: () => void;
  onStartDrag?: (e: React.MouseEvent) => void;
}

export const WinampMainWindow: React.FC<WinampMainWindowProps> = ({
  currentTrack,
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
  onMinimize,
  onClose,
  onStartDrag,
}) => {
  const [showRemaining, setShowRemaining] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Time calculations
  const displaySeconds = showRemaining ? Math.max(0, duration - currentTime) : currentTime;
  const mins = Math.floor(displaySeconds / 60);
  const secs = Math.floor(displaySeconds % 60);
  const timeString = `${showRemaining ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

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

      if (isPlaying) {
        winampAudioEngine.getFftData(fftBuffer);
      } else {
        fftBuffer.fill(0);
      }

      for (let i = 0; i < numBars; i++) {
        const val = isPlaying ? fftBuffer[i * 2] || 0 : 0;
        const targetHeight = Math.min(18, Math.floor((val / 255) * 18));
        heights[i] = heights[i] * 0.7 + targetHeight * 0.3;

        // Falling peaks
        if (targetHeight >= peaks[i]) {
          peaks[i] = targetHeight;
        } else {
          peaks[i] = Math.max(0, peaks[i] - 0.5);
        }

        const x = i * (barWidth + barGap) + 2;
        const h = Math.round(heights[i]);
        const y = canvas.height - h;

        // Draw segmented bar (green to yellow)
        for (let b = 0; b < h; b += 2) {
          const segY = canvas.height - b - 2;
          ctx.fillStyle = segY < 6 ? '#FFFF00' : '#00FF00';
          ctx.fillRect(x, segY, barWidth, 1.5);
        }

        // Peak cap
        if (peaks[i] > 1) {
          const peakY = canvas.height - Math.round(peaks[i]);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, peakY, barWidth, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div
      className="w-[275px] bg-gradient-to-b from-[#313348] via-[#212330] to-[#14151E] border border-[#52556E] shadow-[2px_2px_8px_rgba(0,0,0,0.8)] font-mono select-none text-white rounded-t-[3px] rounded-b-[2px] relative overflow-hidden"
      style={{ height: isShade ? '14px' : '116px' }}
    >
      {/* Titlebar */}
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
        <div className="p-1 space-y-1">
          {/* Upper Deck: LED Display & Marquee Info */}
          <div className="flex gap-1 items-stretch">
            {/* LED Display Box */}
            <div className="w-[108px] h-[38px] bg-black border border-[#484A5E] p-1 flex items-center justify-between rounded-[2px] relative overflow-hidden shadow-inner">
              <div className="flex flex-col text-[7px] text-gray-500 font-bold leading-none select-none">
                <span>O</span>
                <span>A</span>
                <span>I</span>
                <span>D</span>
              </div>

              {/* Green Play indicator */}
              <div className="text-[9px] text-green-500 font-bold">
                {isPlaying ? '▶' : '■'}
              </div>

              {/* 7-Segment Time Display */}
              <div
                onClick={() => setShowRemaining(prev => !prev)}
                className="text-[19px] font-bold text-[#00FF00] tracking-wider cursor-pointer select-none font-mono drop-shadow-[0_0_2px_#00FF00]"
                title="Clique para alternar tempo decorrido / restante"
              >
                {timeString}
              </div>

              {/* Spectrum Visualizer Canvas */}
              <canvas
                ref={canvasRef}
                width={70}
                height={18}
                className="absolute bottom-0.5 right-1 pointer-events-none"
              />
            </div>

            {/* Marquee & Bitrate Box */}
            <div className="flex-1 bg-black border border-[#484A5E] p-1 rounded-[2px] flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="h-4 overflow-hidden relative">
                <div className="text-[10px] text-[#00FF00] whitespace-nowrap animate-marquee font-bold">
                  {currentTrack ? `${currentTrack.title} - ${currentTrack.artist} (${currentTrack.durationFormatted})` : 'Winamp 2.91 - Sem faixa'}
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold">
                <div className="flex items-center gap-1">
                  <span className="text-[#00FF00]">128</span>
                  <span>kbps</span>
                  <span className="text-[#00FF00]">44</span>
                  <span>kHz</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">mono</span>
                  <span className="text-[#00FF00]">stereo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Deck: Sliders & Module Toggles */}
          <div className="flex items-center gap-1 text-[8px]">
            {/* Volume slider */}
            <div className="flex-1 flex items-center gap-1 bg-[#1A1B24] p-0.5 border border-[#3A3C4D] rounded-[1px]">
              <span className="text-[7px] text-gray-400 pl-0.5 font-bold">VOL</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={e => onVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 accent-[#FF9900] bg-gray-700 cursor-pointer"
                title={`Volume: ${volume}%`}
              />
            </div>

            {/* Balance slider */}
            <div className="w-[72px] flex items-center gap-1 bg-[#1A1B24] p-0.5 border border-[#3A3C4D] rounded-[1px]">
              <span className="text-[7px] text-gray-400 pl-0.5 font-bold">BAL</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={balance}
                onChange={e => onBalanceChange(Number(e.target.value))}
                className="w-full h-1.5 accent-[#00FF00] bg-gray-700 cursor-pointer"
                title={`Balanço: ${balance === 0 ? 'Centro' : balance < 0 ? `L ${Math.abs(balance * 100)}%` : `R ${balance * 100}%`}`}
              />
            </div>

            {/* EQ & PL Toggle Buttons */}
            <button
              type="button"
              onClick={onToggleEq}
              className={`px-1.5 py-0.5 text-[8px] font-bold border rounded-[1px] transition-colors ${
                isEqOpen
                  ? 'bg-green-950 text-[#00FF00] border-green-500 shadow-[0_0_3px_#00FF00]'
                  : 'bg-[#2B2E3D] text-gray-300 border-gray-600 hover:bg-gray-700'
              }`}
              title="Alternar Equalizador (EQ)"
            >
              EQ
            </button>
            <button
              type="button"
              onClick={onTogglePl}
              className={`px-1.5 py-0.5 text-[8px] font-bold border rounded-[1px] transition-colors ${
                isPlOpen
                  ? 'bg-green-950 text-[#00FF00] border-green-500 shadow-[0_0_3px_#00FF00]'
                  : 'bg-[#2B2E3D] text-gray-300 border-gray-600 hover:bg-gray-700'
              }`}
              title="Alternar Playlist (PL)"
            >
              PL
            </button>
          </div>

          {/* Track Position Seeker Bar */}
          <div className="bg-black p-0.5 border border-[#484A5E] rounded-[1px]">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={e => onSeek(Number(e.target.value))}
              className="w-full h-2 accent-[#D4A017] bg-gray-800 cursor-pointer"
              title="Arrastar para avançar ou retroceder a faixa"
            />
          </div>

          {/* Bottom Deck: Transport Buttons */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-[2px]">
              <button
                type="button"
                onClick={onPrev}
                aria-label="anterior"
                className="w-6 h-5 bg-gradient-to-b from-[#3E4154] to-[#1E202B] border border-[#64677E] active:from-[#1E202B] active:to-[#3E4154] hover:brightness-110 flex items-center justify-center rounded-[2px] shadow-xs"
                title="Faixa anterior"
              >
                <SkipBack className="w-3 h-3 text-gray-200" />
              </button>
              <button
                type="button"
                onClick={onPlayToggle}
                aria-label="play"
                className="w-6 h-5 bg-gradient-to-b from-[#3E4154] to-[#1E202B] border border-[#64677E] active:from-[#1E202B] active:to-[#3E4154] hover:brightness-110 flex items-center justify-center rounded-[2px] shadow-xs"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ) : (
                  <Play className="w-3 h-3 text-green-400 fill-green-400 ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={onStop}
                aria-label="stop"
                className="w-6 h-5 bg-gradient-to-b from-[#3E4154] to-[#1E202B] border border-[#64677E] active:from-[#1E202B] active:to-[#3E4154] hover:brightness-110 flex items-center justify-center rounded-[2px] shadow-xs"
                title="Parar"
              >
                <Square className="w-3 h-3 text-red-400 fill-red-400" />
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="proximo"
                className="w-6 h-5 bg-gradient-to-b from-[#3E4154] to-[#1E202B] border border-[#64677E] active:from-[#1E202B] active:to-[#3E4154] hover:brightness-110 flex items-center justify-center rounded-[2px] shadow-xs"
                title="Próxima faixa"
              >
                <SkipForward className="w-3 h-3 text-gray-200" />
              </button>
              <button
                type="button"
                onClick={onOpenFiles}
                aria-label="ejetar"
                className="w-6 h-5 bg-gradient-to-b from-[#3E4154] to-[#1E202B] border border-[#64677E] active:from-[#1E202B] active:to-[#3E4154] hover:brightness-110 flex items-center justify-center rounded-[2px] shadow-xs"
                title="Ejetar / Abrir arquivo do computador"
              >
                <FolderOpen className="w-3 h-3 text-yellow-300" />
              </button>
            </div>

            {/* Shuffle & Repeat & Winamp Logo */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleShuffle}
                className={`px-1 h-5 flex items-center gap-0.5 text-[8px] border rounded-[2px] ${
                  isShuffle
                    ? 'bg-green-950 text-[#00FF00] border-green-500'
                    : 'bg-[#2B2E3D] text-gray-400 border-gray-600'
                }`}
                title="Modo aleatório (Shuffle)"
              >
                <Shuffle className="w-2.5 h-2.5" />
                <span className="text-[7px]">S</span>
              </button>
              <button
                type="button"
                onClick={onToggleRepeat}
                className={`px-1 h-5 flex items-center gap-0.5 text-[8px] border rounded-[2px] ${
                  isRepeat
                    ? 'bg-green-950 text-[#00FF00] border-green-500'
                    : 'bg-[#2B2E3D] text-gray-400 border-gray-600'
                }`}
                title="Repetir faixa (Repeat)"
              >
                <Repeat className="w-2.5 h-2.5" />
                <span className="text-[7px]">R</span>
              </button>
              <div
                className="w-5 h-5 bg-black border border-gray-600 rounded-[2px] flex items-center justify-center"
                title="Winamp 2.91 Classic"
              >
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinampMainWindow;
