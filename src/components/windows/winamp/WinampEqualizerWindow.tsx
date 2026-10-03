import React, { useState } from 'react';
import { WINAMP_EQ_PRESETS, WINAMP_EQ_LABELS } from '../../../utils/winampTracks';
import { WinampEqPreset } from '../../../types/winamp';
import { Minus, X, ChevronUp, ChevronDown } from 'lucide-react';

export interface WinampEqualizerWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isEqOn: boolean;
  onToggleEqOn: () => void;
  preamp: number;
  onPreampChange: (db: number) => void;
  bands: number[];
  onBandChange: (index: number, db: number) => void;
  onSelectPreset?: (preset: WinampEqPreset) => void;
  isShade?: boolean;
  onToggleShade?: () => void;
  onStartDrag?: (e: React.MouseEvent) => void;
}

export const WinampEqualizerWindow: React.FC<WinampEqualizerWindowProps> = ({
  isOpen,
  onClose,
  isEqOn,
  onToggleEqOn,
  preamp,
  onPreampChange,
  bands,
  onBandChange,
  onSelectPreset,
  isShade = false,
  onToggleShade,
  onStartDrag,
}) => {
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  if (!isOpen) return null;

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
        <span className="text-[9px] font-bold tracking-wider text-gray-200 uppercase drop-shadow">
          WINAMP EQUALIZER
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
            title="Fechar Equalizador"
          >
            <X className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>

      {!isShade && (
        <div className="p-1 flex flex-col justify-between h-[102px]">
          {/* Top Control Bar: ON, AUTO, EQ Spline curve, PRESETS */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleEqOn}
                className={`px-1.5 py-0.5 text-[8px] font-bold border rounded-[1px] ${
                  isEqOn
                    ? 'bg-green-950 text-[#00FF00] border-green-500 shadow-[0_0_3px_#00FF00]'
                    : 'bg-[#2B2E3D] text-gray-400 border-gray-600'
                }`}
              >
                ON
              </button>
              <button
                type="button"
                className="px-1 py-0.5 text-[8px] font-bold border border-gray-600 bg-[#2B2E3D] text-gray-400 rounded-[1px]"
              >
                AUTO
              </button>
            </div>

            {/* EQ Curve Display */}
            <div className="flex-1 h-3.5 bg-black border border-[#484A5E] rounded-[1px] relative overflow-hidden flex items-center px-1">
              {/* Reference yellow curve line */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
                <path
                  d={`M 0,${10 - preamp} Q 20,${10 - (bands[1] || 0)} 50,${10 - (bands[4] || 0)} T 100,${10 - (bands[9] || 0)}`}
                  fill="none"
                  stroke="#FFCC00"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* Presets Button with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPresetsOpen(prev => !prev)}
                className="px-1.5 py-0.5 text-[8px] font-bold border border-gray-500 bg-[#2B2E3D] hover:bg-gray-700 text-gray-200 rounded-[1px]"
              >
                PRESETS
              </button>

              {isPresetsOpen && (
                <div className="absolute right-0 top-full mt-0.5 w-24 bg-[#1E202B] border border-[#64677E] shadow-xl z-50 py-0.5 text-[8px]">
                  {WINAMP_EQ_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        if (onSelectPreset) onSelectPreset(preset);
                        setIsPresetsOpen(false);
                      }}
                      className="w-full text-left px-2 py-0.5 hover:bg-[#316AC5] hover:text-white text-gray-200 block truncate"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Equalizer Sliders Area */}
          <div className="flex items-end justify-between px-0.5 pt-1 relative">
            {/* Reference labels (+12db, 0db, -12db) */}
            <div className="absolute left-6 right-2 top-2 pointer-events-none border-t border-dashed border-gray-700 opacity-30" />
            <div className="absolute left-6 right-2 top-7 pointer-events-none border-t border-gray-600 opacity-40" />
            <div className="absolute left-6 right-2 top-12 pointer-events-none border-t border-dashed border-gray-700 opacity-30" />

            {/* Preamp Column */}
            <div className="flex flex-col items-center w-5">
              <input
                type="range"
                min="-12"
                max="12"
                value={preamp}
                onChange={e => onPreampChange(Number(e.target.value))}
                className="w-2.5 h-14 accent-[#D4A017] [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
                title={`Preamp: ${preamp > 0 ? `+${preamp}` : preamp} dB`}
              />
              <span className="text-[6px] text-gray-400 font-bold mt-0.5">PRE</span>
            </div>

            {/* Separator */}
            <div className="w-[1px] h-14 bg-gray-700 mx-0.5" />

            {/* 10 Band Columns */}
            {WINAMP_EQ_LABELS.map((label, idx) => (
              <div key={label} className="flex flex-col items-center w-5">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={bands[idx] || 0}
                  onChange={e => onBandChange(idx, Number(e.target.value))}
                  className="w-2.5 h-14 accent-[#E5A823] [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
                  title={`${label}: ${bands[idx] > 0 ? `+${bands[idx]}` : bands[idx] || 0} dB`}
                />
                <span className="text-[6px] text-gray-400 font-bold mt-0.5 truncate w-full text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WinampEqualizerWindow;
