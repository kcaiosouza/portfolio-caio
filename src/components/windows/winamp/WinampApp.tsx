import React, { useState, useEffect, useRef } from 'react';
import { useWindowManager } from '../../../context/WindowContext';
import { winampAudioEngine } from '../../../utils/winampAudioEngine';
import { WINAMP_DEFAULT_TRACKS, WINAMP_EQ_PRESETS } from '../../../utils/winampTracks';
import { WinampTrack, WinampEqPreset } from '../../../types/winamp';
import { useWinampDocking, calculateMagneticSnap } from '../../../hooks/useWinampDocking';
import { WinampMainWindow } from './WinampMainWindow';
import { WinampEqualizerWindow } from './WinampEqualizerWindow';
import { WinampPlaylistWindow } from './WinampPlaylistWindow';

export interface WinampAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const WinampApp: React.FC<WinampAppProps> = ({
  id = 'winamp-window',
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  let wm: ReturnType<typeof useWindowManager> | undefined;
  try {
    wm = useWindowManager();
  } catch {
    wm = undefined;
  }

  const win = wm?.windows.find(w => w.id === id);
  const isOpen = propIsOpen !== undefined ? propIsOpen : (win ? win.isOpen : true);
  const onClose = propOnClose || (() => wm?.closeWindow(id));

  // Audio Playback State
  const [tracks, setTracks] = useState<WinampTrack[]>(WINAMP_DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(1); // default to My Prayer
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(225);
  const [volume, setVolume] = useState(80);
  const [balance, setBalance] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Equalizer State
  const [isEqOn, setIsEqOn] = useState(true);
  const [preamp, setPreamp] = useState(0);
  const [bands, setBands] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // Window Visibility
  const [isEqOpen, setIsEqOpen] = useState(true);
  const [isPlOpen, setIsPlOpen] = useState(true);

  // Docking & Positioning hook
  const {
    mainPos,
    setMainPos,
    eqPos,
    setEqPos,
    plPos,
    setPlPos,
    isEqDocked,
    setIsEqDocked,
    isPlDocked,
    setIsPlDocked,
    moveMain,
  } = useWinampDocking({ x: 300, y: 70, width: 275, height: 116 });

  // Windowshade states
  const [isMainShade, setIsMainShade] = useState(false);
  const [isEqShade, setIsEqShade] = useState(false);
  const [isPlShade, setIsPlShade] = useState(false);

  const currentTrack = tracks[currentTrackIndex] || null;

  // Sync audio engine with HTML5 Audio element
  useEffect(() => {
    winampAudioEngine.init();
    const audio = winampAudioEngine.getAudioElement();
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [isRepeat, currentTrackIndex, tracks]);

  // Dragging Handlers
  const dragRef = useRef<{
    target: 'main' | 'eq' | 'pl';
    startX: number;
    startY: number;
    initialPos: { x: number; y: number };
  } | null>(null);

  const startDrag = (target: 'main' | 'eq' | 'pl', e: React.MouseEvent) => {
    e.preventDefault();
    if (wm) wm.focusWindow(id);

    const initialPos =
      target === 'main'
        ? { x: mainPos.x, y: mainPos.y }
        : target === 'eq'
        ? { x: eqPos.x, y: eqPos.y }
        : { x: plPos.x, y: plPos.y };

    dragRef.current = {
      target,
      startX: e.clientX,
      startY: e.clientY,
      initialPos,
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;

      if (dragRef.current.target === 'main') {
        moveMain(dx, dy);
        dragRef.current.startX = ev.clientX;
        dragRef.current.startY = ev.clientY;
      } else if (dragRef.current.target === 'eq') {
        const nextX = dragRef.current.initialPos.x + dx;
        const nextY = dragRef.current.initialPos.y + dy;
        const snap = calculateMagneticSnap(
          { x: nextX, y: nextY, width: 275, height: isEqShade ? 14 : 116 },
          { x: mainPos.x, y: mainPos.y, width: 275, height: isMainShade ? 14 : 116 }
        );
        setIsEqDocked(snap.snapped);
        setEqPos(prev => ({ ...prev, x: snap.x, y: snap.y }));
      } else if (dragRef.current.target === 'pl') {
        const nextX = dragRef.current.initialPos.x + dx;
        const nextY = dragRef.current.initialPos.y + dy;
        const targetWindow = isEqOpen
          ? { x: eqPos.x, y: eqPos.y, width: 275, height: isEqShade ? 14 : 116 }
          : { x: mainPos.x, y: mainPos.y, width: 275, height: isMainShade ? 14 : 116 };

        const snap = calculateMagneticSnap(
          { x: nextX, y: nextY, width: 275, height: isPlShade ? 14 : 232 },
          targetWindow
        );
        setIsPlDocked(snap.snapped);
        setPlPos(prev => ({ ...prev, x: snap.x, y: snap.y }));
      }
    };

    const onMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Playback actions
  const playTrackAtIndex = (index: number) => {
    if (index < 0 || index >= tracks.length) return;
    setCurrentTrackIndex(index);
    const track = tracks[index];
    setDuration(track.duration || 180);
    setCurrentTime(0);

    const audio = winampAudioEngine.getAudioElement();
    if (audio) {
      audio.src = track.url;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handlePlayToggle = () => {
    const audio = winampAudioEngine.getAudioElement();
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src && currentTrack) {
        audio.src = currentTrack.url;
      }
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    const audio = winampAudioEngine.getAudioElement();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    if (isShuffle) {
      const rand = Math.floor(Math.random() * tracks.length);
      playTrackAtIndex(rand);
    } else {
      const prev = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
      playTrackAtIndex(prev);
    }
  };

  const handleNext = () => {
    if (isShuffle) {
      const rand = Math.floor(Math.random() * tracks.length);
      playTrackAtIndex(rand);
    } else {
      const next = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
      playTrackAtIndex(next);
    }
  };

  const handleSeek = (time: number) => {
    const audio = winampAudioEngine.getAudioElement();
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    winampAudioEngine.setVolume(val);
  };

  const handleBalanceChange = (val: number) => {
    setBalance(val);
    winampAudioEngine.setBalance(val);
  };

  // Equalizer actions
  const handleBandChange = (index: number, db: number) => {
    const updated = [...bands];
    updated[index] = db;
    setBands(updated);
    winampAudioEngine.setEqBand(index, db);
  };

  const handlePreampChange = (db: number) => {
    setPreamp(db);
    winampAudioEngine.setPreamp(db);
  };

  const handleToggleEqOn = () => {
    const next = !isEqOn;
    setIsEqOn(next);
    winampAudioEngine.setEqOn(next);
  };

  const handleSelectPreset = (preset: WinampEqPreset) => {
    setPreamp(preset.preamp);
    setBands([...preset.bands]);
    winampAudioEngine.setPreamp(preset.preamp);
    preset.bands.forEach((b, i) => winampAudioEngine.setEqBand(i, b));
  };

  // Playlist actions
  const handleAddTracks = (newTracks: WinampTrack[]) => {
    setTracks(prev => [...prev, ...newTracks]);
  };

  const handleRemoveTrack = (index: number) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
    if (currentTrackIndex >= index && currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const handleClearPlaylist = () => {
    handleStop();
    setTracks([]);
    setCurrentTrackIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Main Window */}
      <div
        style={{ transform: `translate(${mainPos.x}px, ${mainPos.y}px)` }}
        className="absolute top-0 left-0 pointer-events-auto"
      >
        <WinampMainWindow
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          balance={balance}
          isEqOpen={isEqOpen}
          isPlOpen={isPlOpen}
          isShade={isMainShade}
          isShuffle={isShuffle}
          isRepeat={isRepeat}
          onPlayToggle={handlePlayToggle}
          onPrev={handlePrev}
          onNext={handleNext}
          onStop={handleStop}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onBalanceChange={handleBalanceChange}
          onToggleEq={() => setIsEqOpen(prev => !prev)}
          onTogglePl={() => setIsPlOpen(prev => !prev)}
          onToggleShade={() => setIsMainShade(prev => !prev)}
          onToggleShuffle={() => setIsShuffle(prev => !prev)}
          onToggleRepeat={() => setIsRepeat(prev => !prev)}
          onMinimize={() => wm?.minimizeWindow(id)}
          onClose={onClose}
          onStartDrag={e => startDrag('main', e)}
        />
      </div>

      {/* Equalizer Window */}
      {isEqOpen && (
        <div
          style={{ transform: `translate(${eqPos.x}px, ${eqPos.y}px)` }}
          className="absolute top-0 left-0 pointer-events-auto"
        >
          <WinampEqualizerWindow
            isOpen={isEqOpen}
            onClose={() => setIsEqOpen(false)}
            isEqOn={isEqOn}
            onToggleEqOn={handleToggleEqOn}
            preamp={preamp}
            onPreampChange={handlePreampChange}
            bands={bands}
            onBandChange={handleBandChange}
            onSelectPreset={handleSelectPreset}
            isShade={isEqShade}
            onToggleShade={() => setIsEqShade(prev => !prev)}
            onStartDrag={e => startDrag('eq', e)}
          />
        </div>
      )}

      {/* Playlist Window */}
      {isPlOpen && (
        <div
          style={{ transform: `translate(${plPos.x}px, ${plPos.y}px)` }}
          className="absolute top-0 left-0 pointer-events-auto"
        >
          <WinampPlaylistWindow
            isOpen={isPlOpen}
            onClose={() => setIsPlOpen(false)}
            tracks={tracks}
            currentTrackIndex={currentTrackIndex}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onSelectTrack={playTrackAtIndex}
            onAddTracks={handleAddTracks}
            onRemoveTrack={handleRemoveTrack}
            onClearPlaylist={handleClearPlaylist}
            onPlayToggle={handlePlayToggle}
            onPrev={handlePrev}
            onNext={handleNext}
            onStop={handleStop}
            isShade={isPlShade}
            onToggleShade={() => setIsPlShade(prev => !prev)}
            onStartDrag={e => startDrag('pl', e)}
          />
        </div>
      )}
    </div>
  );
};

export default WinampApp;
