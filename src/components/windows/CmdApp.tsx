import React, { useState, useRef, useEffect } from 'react';
import { WindowFrame } from './WindowFrame';
import { useWindowManager } from '../../context/WindowContext';
import { useSystem } from '../../context/SystemContext';
import { executeCommand, CMD_BANNER, PROMPT_PATH } from '../../utils/cmdEngine';

interface CmdHistoryEntry {
  command?: string;
  output?: string[];
}

interface CmdAppProps {
  isOpen?: boolean;
}

export const CmdApp: React.FC<CmdAppProps> = ({ isOpen }) => {
  const { openWindow, closeWindow, openBrowser, openMobileApp } = useWindowManager();
  const { setScreenMode } = useSystem();

  const [history, setHistory] = useState<CmdHistoryEntry[]>([
    { output: CMD_BANNER }
  ]);
  const [commandList, setCommandList] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputVal, setInputVal] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever history updates
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const raw = inputVal;
      const trimmed = raw.trim();

      if (trimmed) {
        setCommandList((prev) => [...prev, trimmed]);
      }
      setHistoryIndex(-1);

      const result = executeCommand(raw, {
        openWindow,
        closeWindow,
        setScreenMode,
        openBrowser,
        openMobileApp
      });

      if (result.clear) {
        setHistory([]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command: raw,
            output: result.output
          }
        ]);
      }

      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandList.length === 0) return;

      const nextIndex = historyIndex === -1 ? commandList.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandList[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandList.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandList[nextIndex]);
      }
    }
  };

  return (
    <WindowFrame
      id="cmd-window"
      title="Prompt de comando"
      icon="cmd"
      className="bg-black"
      isOpen={isOpen}
      initialPosition={{ x: 120, y: 70, width: 640, height: 420 }}
    >
      <div
        ref={terminalScrollRef}
        onClick={handleContainerClick}
        data-testid="cmd-terminal-body"
        className="w-full h-full bg-black text-[#CCCCCC] font-mono text-xs sm:text-sm p-3 overflow-y-auto select-text cursor-text leading-snug flex flex-col justify-start"
        style={{ minHeight: '100%', fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace' }}
      >
        {/* Render prior history blocks */}
        {history.map((entry, idx) => (
          <div key={idx} className="mb-1">
            {entry.command !== undefined && (
              <div className="flex items-center text-white">
                <span className="text-[#CCCCCC] mr-1.5 select-none">{PROMPT_PATH}</span>
                <span>{entry.command}</span>
              </div>
            )}
            {entry.output && entry.output.map((line, lineIdx) => (
              <div key={lineIdx} className="whitespace-pre-wrap min-h-[1.1rem]">
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Active prompt row */}
        <div className="flex items-center text-white mt-0.5">
          <span className="text-[#CCCCCC] mr-1.5 select-none">{PROMPT_PATH}</span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              aria-label="prompt-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-transparent text-white outline-none border-none p-0 m-0 font-mono text-xs sm:text-sm caret-white"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </WindowFrame>
  );
};
