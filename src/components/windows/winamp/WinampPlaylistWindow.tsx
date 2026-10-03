import React, { useRef, useState } from 'react';
import { WinampTrack } from '../../../types/winamp';
import {
  Plus,
  Trash2,
  ListFilter,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  X,
  ChevronUp,
  ChevronDown,
  Upload
} from 'lucide-react';

export interface WinampPlaylistWindowProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: WinampTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  onSelectTrack: (index: number) => void;
  onAddTracks: (newTracks: WinampTrack[]) => void;
  onRemoveTrack: (index: number) => void;
  onClearPlaylist?: () => void;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
  isShade?: boolean;
  onToggleShade?: () => void;
  onStartDrag?: (e: React.MouseEvent) => void;
}

export const WinampPlaylistWindow: React.FC<WinampPlaylistWindowProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrackIndex,
  isPlaying,
  currentTime,
  onSelectTrack,
  onAddTracks,
  onRemoveTrack,
  onClearPlaylist,
  onPlayToggle,
  onPrev,
  onNext,
  onStop,
  isShade = false,
  onToggleShade,
  onStartDrag,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(currentTrackIndex);

  if (!isOpen) return null;

  // Calculate total playlist duration
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMins = Math.floor(totalSeconds / 60);
  const totalSecs = Math.floor(totalSeconds % 60);
  const totalDurationStr = `${totalMins}:${String(totalSecs).padStart(2, '0')}`;

  const currentMins = Math.floor(currentTime / 60);
  const currentSecs = Math.floor(currentTime % 60);
  const currentElapsedStr = `${currentMins}:${String(currentSecs).padStart(2, '0')}`;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: WinampTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      newTracks.push({
        id: `user-${Date.now()}-${i}`,
        title: cleanName,
        artist: 'Arquivo Local',
        duration: 180,
        durationFormatted: '3:00',
        url: objectUrl,
        isUserUploaded: true,
      });
    }

    onAddTracks(newTracks);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newTracks: WinampTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        const objectUrl = URL.createObjectURL(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        newTracks.push({
          id: `user-${Date.now()}-${i}`,
          title: cleanName,
          artist: 'Arquivo Local',
          duration: 180,
          durationFormatted: '3:00',
          url: objectUrl,
          isUserUploaded: true,
        });
      }
    }
    if (newTracks.length > 0) {
      onAddTracks(newTracks);
    }
  };

  return (
    <div
      className="w-[275px] bg-gradient-to-b from-[#313348] via-[#212330] to-[#14151E] border border-[#52556E] shadow-[2px_2px_8px_rgba(0,0,0,0.8)] font-mono select-none text-white rounded-t-[3px] rounded-b-[2px] relative overflow-hidden flex flex-col"
      style={{ height: isShade ? '14px' : '232px' }}
      onDragOver={e => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Titlebar */}
      <div
        onMouseDown={onStartDrag}
        className="h-[14px] bg-gradient-to-r from-[#202230] via-[#35384F] to-[#202230] px-1 flex items-center justify-between cursor-move border-b border-[#12131A] flex-shrink-0"
      >
        <span className="text-[9px] font-bold tracking-wider text-gray-200 uppercase drop-shadow">
          WINAMP PLAYLIST
        </span>

        <div className="flex items-center gap-[1px]">
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
            title="Fechar Playlist"
          >
            <X className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>

      {!isShade && (
        <div className="flex flex-col flex-1 min-h-0 p-1">
          {/* Track List Box */}
          <div
            className={`flex-1 bg-black border border-[#484A5E] rounded-[2px] p-1 overflow-y-auto space-y-0.5 text-[10px] leading-tight select-none relative ${
              isDragOver ? 'ring-2 ring-yellow-400' : ''
            }`}
          >
            {isDragOver && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-yellow-400 z-10 font-bold text-xs pointer-events-none">
                <Upload className="w-6 h-6 mb-1 animate-bounce" />
                <span>Solte suas músicas aqui!</span>
              </div>
            )}

            {tracks.map((track, idx) => {
              const isCurrent = idx === currentTrackIndex;
              const isSel = idx === selectedIdx;

              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedIdx(idx)}
                  onDoubleClick={() => {
                    setSelectedIdx(idx);
                    onSelectTrack(idx);
                  }}
                  className={`flex items-center justify-between px-1 py-0.5 cursor-pointer rounded-[1px] transition-colors ${
                    isCurrent
                      ? 'bg-[#000088] text-white font-bold'
                      : isSel
                      ? 'bg-gray-800 text-[#00FF00]'
                      : 'text-[#00FF00] hover:bg-gray-900'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="opacity-80">{idx + 1}. </span>
                    <span>{track.title}</span>
                    {track.artist && <span className="opacity-60 text-[9px]"> - {track.artist}</span>}
                  </div>
                  <div className="flex-shrink-0 text-right opacity-90 text-[9px]">
                    {track.durationFormatted || '3:00'}
                  </div>
                </div>
              );
            })}

            {tracks.length === 0 && (
              <div className="text-gray-500 italic text-center py-6 text-[10px]">
                Nenhuma música na lista. Clique em + ADD ou arraste arquivos MP3 para cá.
              </div>
            )}
          </div>

          {/* Bottom Bar: Action buttons & Mini Controls */}
          <div className="pt-1 flex items-center justify-between text-[8px] flex-shrink-0">
            {/* Buttons: ADD, REM, SEL, MISC */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="+ ADD"
                onClick={() => fileInputRef.current?.click()}
                className="px-1.5 py-0.5 bg-[#2B2E3D] hover:bg-gray-700 border border-gray-500 text-gray-200 rounded-[1px] font-bold"
                title="Adicionar arquivos de áudio"
              >
                + ADD
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedIdx >= 0 && selectedIdx < tracks.length) {
                    onRemoveTrack(selectedIdx);
                  }
                }}
                disabled={tracks.length === 0}
                className="px-1.5 py-0.5 bg-[#2B2E3D] hover:bg-gray-700 border border-gray-500 text-gray-200 rounded-[1px] font-bold disabled:opacity-30"
                title="Remover música selecionada"
              >
                - REM
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearPlaylist) onClearPlaylist();
                }}
                className="px-1.5 py-0.5 bg-[#2B2E3D] hover:bg-gray-700 border border-gray-500 text-gray-200 rounded-[1px] font-bold"
                title="Limpar lista"
              >
                MISC
              </button>
            </div>

            {/* Time counters and Mini Playback */}
            <div className="flex items-center gap-2">
              <div className="text-[9px] text-[#00FF00] font-bold font-mono">
                {currentElapsedStr} / {totalDurationStr}
              </div>

              {/* Mini transport controls */}
              <div className="flex items-center gap-[1px]">
                <button
                  type="button"
                  onClick={onPrev}
                  className="w-3.5 h-3.5 bg-[#2B2E3D] hover:bg-gray-600 border border-gray-500 rounded-[1px] flex items-center justify-center text-gray-300"
                  title="Anterior"
                >
                  <SkipBack className="w-2 h-2" />
                </button>
                <button
                  type="button"
                  onClick={onPlayToggle}
                  className="w-3.5 h-3.5 bg-[#2B2E3D] hover:bg-gray-600 border border-gray-500 rounded-[1px] flex items-center justify-center text-green-400"
                  title={isPlaying ? 'Pausar' : 'Tocar'}
                >
                  {isPlaying ? <Pause className="w-2 h-2" /> : <Play className="w-2 h-2" />}
                </button>
                <button
                  type="button"
                  onClick={onStop}
                  className="w-3.5 h-3.5 bg-[#2B2E3D] hover:bg-gray-600 border border-gray-500 rounded-[1px] flex items-center justify-center text-red-400"
                  title="Parar"
                >
                  <Square className="w-2 h-2" />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="w-3.5 h-3.5 bg-[#2B2E3D] hover:bg-gray-600 border border-gray-500 rounded-[1px] flex items-center justify-center text-gray-300"
                  title="Próxima"
                >
                  <SkipForward className="w-2 h-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinampPlaylistWindow;
