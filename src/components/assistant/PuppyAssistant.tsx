import React, { useState } from 'react';
import {
  ChatMessage,
  INITIAL_ASSISTANT_MESSAGE,
  getInitialMessages,
  sendAssistantMessage,
} from '../../services/assistantService';

export interface PuppyAssistantProps {
  defaultOpen?: boolean;
}

export const PuppyAssistant: React.FC<PuppyAssistantProps> = ({
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [history, setHistory] = useState<ChatMessage[]>(() => getInitialMessages());
  const [currentMessage, setCurrentMessage] = useState<string>(INITIAL_ASSISTANT_MESSAGE);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isThinking) return;

    setInputText('');
    setIsThinking(true);

    try {
      const result = await sendAssistantMessage(history, trimmed);
      setHistory(result.updatedHistory);
      setCurrentMessage(result.reply);
    } catch (error) {
      console.error('Error sending message to assistant:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="fixed bottom-10 right-4 md:bottom-12 md:right-8 z-40 select-none flex flex-col items-end">
      {/* Windows XP Speech Balloon */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative mb-2 max-w-[280px] md:max-w-[320px] bg-[#FFFFE1] border border-[#7A7A7A] rounded-md shadow-[2px_2px_6px_rgba(0,0,0,0.3)] p-3 text-[#000000] font-tahoma text-xs"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-start mb-1.5">
            <span className="font-bold text-[11px] text-[#222222] select-none flex items-center gap-1">
              <span>🐕</span> Rover Assistente
            </span>
            <button
              type="button"
              aria-label="Fechar balão"
              title="Fechar"
              onClick={() => setIsOpen(false)}
              className="w-4 h-4 flex items-center justify-center text-[#7A7A7A] hover:text-[#000000] hover:bg-[#E8E4C9] rounded text-[10px] leading-none transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Text Content */}
          <div className="text-[12px] leading-relaxed mb-3 text-[#000000] font-normal min-h-[36px]">
            {isThinking ? (
              <span className="italic text-[#555555] flex items-center gap-1.5 py-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#555555] animate-bounce" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#555555] animate-bounce [animation-delay:0.15s]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#555555] animate-bounce [animation-delay:0.3s]" />
                <span className="ml-1">Pensando...</span>
              </span>
            ) : (
              currentMessage
            )}
          </div>

          {/* Input & Send Form */}
          <form onSubmit={handleFormSubmit} className="flex gap-1.5 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte algo..."
              disabled={isThinking}
              className="flex-1 min-w-0 border border-[#7F9DB9] bg-white text-xs px-2 py-1 outline-none text-[#000000] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isThinking || !inputText.trim()}
              className="px-2.5 py-1 text-xs font-semibold text-[#000000] bg-gradient-to-b from-[#ECE9D8] via-[#ECE9D8] to-[#DCD6C2] active:from-[#DCD6C2] active:to-[#ECE9D8] border border-[#7F9DB9] rounded-[3px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.2)] hover:border-[#2E6ED8] hover:brightness-105 active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              Enviar
            </button>
          </form>

          {/* SVG speech tail pointer pointing towards the puppy */}
          <div className="absolute -bottom-[10px] right-8 w-4 h-[11px] pointer-events-none">
            <svg
              viewBox="0 0 16 11"
              className="w-4 h-[11px] overflow-visible"
              fill="none"
            >
              <polygon points="0,0 16,0 12,11" fill="#FFFFE1" />
              <polyline points="0,0 12,11 16,0" stroke="#7A7A7A" strokeWidth="1" fill="none" />
              <line x1="0.5" y1="0" x2="15.5" y2="0" stroke="#FFFFE1" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      )}

      {/* Puppy Image */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer group flex flex-col items-center bg-transparent border-0 p-0 outline-none focus:outline-none"
        title="Rover - Assistente XP"
      >
        <img
          src="/assets/beagle-puppy.png"
          alt="Cachorro Ajudante"
          className="w-24 h-24 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform duration-200"
          draggable={false}
        />
      </button>
    </div>
  );
};
