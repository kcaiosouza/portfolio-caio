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
