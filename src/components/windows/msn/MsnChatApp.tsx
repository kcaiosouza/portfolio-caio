import React, { useState, useRef, useEffect } from 'react';
import WindowFrame from '../WindowFrame';
import { soundEngine } from '../../../utils/soundEffects';
import { MsnMessage } from '../../../types/msn';
import { generateMsnReply, parseEmoticonText } from '../../../utils/msnEngine';
import { MsnDirectMessageModal } from './MsnDirectMessageModal';
import { MsnEmoticonPicker } from './MsnEmoticonPicker';
import { Bell, Smile, Mail, Coffee } from 'lucide-react';

export interface MsnChatAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const MsnChatApp: React.FC<MsnChatAppProps> = ({
  id = 'msn-chat-window',
  isOpen,
  onClose,
  className = '',
}) => {
  const [messages, setMessages] = useState<MsnMessage[]>([
    {
      id: 'init-1',
      sender: 'caio',
      senderName: 'Caio Souza',
      text: 'E aí! Beleza? Bem-vindo ao meu MSN Messenger! Pode me perguntar sobre meus projetos, carreira ou stack técnica! :)',
      timestamp: Date.now(),
      type: 'chat',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    soundEngine.playClick();
    const userMsg: MsnMessage = {
      id: String(Date.now()),
      sender: 'user',
      senderName: 'Você',
      text: trimmed,
      timestamp: Date.now(),
      type: 'chat',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const isTest =
      (typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.MODE === 'test')) ||
      (typeof globalThis !== 'undefined' && Boolean((globalThis as any).process?.env?.NODE_ENV === 'test'));

    if (!isTest) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const replyText = generateMsnReply(trimmed);
    soundEngine.playMsnMessage();

    const botMsg: MsnMessage = {
      id: String(Date.now() + 1),
      sender: 'caio',
      senderName: 'Caio Souza',
      text: replyText,
      timestamp: Date.now(),
      type: 'chat',
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleNudge = () => {
    soundEngine.playMsnNudge();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);

    const nudgeMsg: MsnMessage = {
      id: String(Date.now()),
      sender: 'system',
      senderName: 'Sistema',
      text: 'Você acabou de chamar a atenção!',
      timestamp: Date.now(),
      type: 'nudge',
    };
    setMessages(prev => [...prev, nudgeMsg]);

    setTimeout(() => {
      soundEngine.playMsnMessage();
      const replyMsg: MsnMessage = {
        id: String(Date.now() + 1),
        sender: 'caio',
        senderName: 'Caio Souza',
        text: generateMsnReply('[nudge]'),
        timestamp: Date.now(),
        type: 'chat',
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderParsedContent = (text: string) => {
    const tokens = parseEmoticonText(text);
    return tokens.map((token, idx) => {
      if (typeof token === 'string') return <span key={idx}>{token}</span>;
      return (
        <span key={idx} title={`${token.label} (${token.code})`} className="inline-block text-base mx-1 align-middle select-none">
          {token.icon}
        </span>
      );
    });
  };

  return (
    <WindowFrame
      id={id}
      title="Caio Souza - Conversa"
      icon="msn"
      isOpen={isOpen}
      onClose={onClose}
      className={`${className} ${isShaking ? 'msn-shaking' : ''}`}
      initialPosition={{ x: 260, y: 70, width: 490, height: 470 }}
    >
      <div className="flex flex-col flex-1 h-full min-h-0 bg-[#E8EEF7] font-tahoma text-black select-none text-xs relative">
        {/* Contact Header Bar */}
        <div className="p-2 bg-gradient-to-r from-[#CADAF3] via-[#E4EDFA] to-[#CADAF3] border-b border-[#A0B8E0] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded bg-[#ECE9D8] border border-blue-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Coffee className="w-5 h-5 text-[#6F4E37]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-[#002D96] flex items-center gap-1">
                <span>Caio Souza</span>
                <span className="text-[10px] text-green-700 font-normal">&lt;Disponível&gt;</span>
              </div>
              <div className="text-[10px] text-gray-600 truncate">
                Full Stack Dev | Single Software (Pleno III) 🚀
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDirectModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-white/90 border border-blue-300 rounded text-[10px] font-bold text-blue-900 hover:bg-white shadow-xs flex-shrink-0"
            title="Enviar mensagem direta ao e-mail [Em breve]"
          >
            <Mail className="w-3 h-3 text-red-600" />
            <span>Falar com o Caio Real [Em breve]</span>
          </button>
        </div>

        {/* Message Log Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 p-3 overflow-y-auto bg-white border-b border-[#A0B8E0] space-y-2 select-text"
        >
          {messages.map(m => {
            if (m.type === 'nudge') {
              return (
                <div key={m.id} className="text-center my-1 text-gray-500 font-bold italic text-[11px] bg-yellow-50 py-0.5 rounded border border-yellow-200">
                  ⚡ {m.text}
                </div>
              );
            }

            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className="leading-snug">
                <div className={`font-bold text-[11px] ${isUser ? 'text-red-700' : 'text-blue-800'}`}>
                  {m.senderName} diz ({formatTime(m.timestamp)}):
                </div>
                <div className="text-[12px] text-gray-900 pl-2 mt-0.5 whitespace-pre-wrap">
                  {renderParsedContent(m.text)}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="text-[10px] italic text-gray-500 flex items-center gap-1 pt-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.3s]" />
              <span className="ml-1">Caio Souza está digitando uma mensagem...</span>
            </div>
          )}
        </div>

        {/* Toolbar (Nudge, Emoticon) */}
        <div className="bg-[#ECE9D8] px-2 py-1 flex items-center gap-2 border-b border-[#D8D4C8] relative">
          <button
            type="button"
            onClick={handleNudge}
            aria-label="Chamar atenção"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-blue-100 border border-transparent hover:border-blue-400 text-gray-800 text-[11px]"
            title="Chamar atenção (Nudge)"
          >
            <Bell className="w-3.5 h-3.5 text-orange-600" />
            <span>Chamar atenção</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPickerOpen(prev => !prev)}
              aria-label="Emoticons"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-blue-100 border border-transparent hover:border-blue-400 text-gray-800 text-[11px]"
              title="Inserir emoticon"
            >
              <Smile className="w-3.5 h-3.5 text-yellow-600" />
              <span>Emoticons</span>
            </button>

            <MsnEmoticonPicker
              isOpen={isPickerOpen}
              onSelectEmoticon={code => {
                setInputText(prev => `${prev}${prev ? ' ' : ''}${code}`);
              }}
              onClose={() => setIsPickerOpen(false)}
            />
          </div>
        </div>

        {/* Input & Send Area */}
        <div className="p-2 bg-[#ECE9D8] flex gap-2 items-end">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 h-14 p-1.5 bg-white border border-[#7F9DB9] rounded-[1px] text-xs resize-none outline-none select-text focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="h-14 px-4 bg-gradient-to-b from-white via-[#ECE9D8] to-[#D4D0C8] border border-[#003C74] rounded-[2px] font-bold text-xs hover:border-[#F2A000] active:bg-[#CAC6BD] disabled:opacity-40 disabled:border-gray-400"
          >
            Enviar
          </button>
        </div>

        {/* Modal Em Breve */}
        <MsnDirectMessageModal
          isOpen={isDirectModalOpen}
          onClose={() => setIsDirectModalOpen(false)}
        />
      </div>
    </WindowFrame>
  );
};

export default MsnChatApp;
