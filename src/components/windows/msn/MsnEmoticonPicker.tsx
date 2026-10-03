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
      <div className="absolute bottom-full mb-1 left-0 w-[216px] bg-[#FFFFE1] border border-[#7A7A7A] rounded-[2px] p-2.5 shadow-lg z-50 font-tahoma text-xs">
        <div className="text-[11px] text-gray-600 font-bold mb-2 pb-1 border-b border-gray-300 whitespace-nowrap select-none">
          Emoticons do MSN
        </div>
        <div className="grid grid-cols-5 gap-2 justify-items-center">
          {MSN_EMOTICONS.map(e => (
            <button
              key={e.code}
              type="button"
              title={`${e.label} (${e.code})`}
              onClick={() => {
                onSelectEmoticon(e.code);
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center text-lg rounded-[2px] border border-transparent hover:border-[#316AC5] hover:bg-[#C2DCFF] active:bg-[#99C0FF] transition-colors cursor-pointer select-none"
            >
              {e.icon}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
