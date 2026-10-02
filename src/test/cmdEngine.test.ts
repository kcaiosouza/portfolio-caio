import { describe, it, expect, vi } from 'vitest';
import { executeCommand, CMD_BANNER, CommandContext } from '../utils/cmdEngine';

describe('cmdEngine', () => {
  const createMockContext = (): CommandContext => ({
    openWindow: vi.fn(),
    closeWindow: vi.fn(),
    setScreenMode: vi.fn(),
    openBrowser: vi.fn(),
    openMobileApp: vi.fn(),
  });

  it('provides the authentic Caio XP banner', () => {
    expect(CMD_BANNER[0]).toContain('Caio XP Professional [Versão 5.1.2600]');
    expect(CMD_BANNER[1]).toContain('(C) Copyright 2016-2026 Caio Souza');
  });

  it('handles help command', () => {
    const ctx = createMockContext();
    const result = executeCommand('help', ctx);
    expect(result.output.some(line => line.includes('HELP'))).toBe(true);
    expect(result.output.some(line => line.includes('SHUTDOWN'))).toBe(true);
    expect(result.output.some(line => line.includes('NOTEPAD'))).toBe(true);
  });

  it('handles shutdown command by setting screen mode to bios', () => {
    const ctx = createMockContext();
    const result = executeCommand('shutdown', ctx);
    expect(ctx.setScreenMode).toHaveBeenCalledWith('bios');
    expect(result.output.join(' ')).toContain('Reiniciando');
  });

  it('handles cls command with clear flag', () => {
    const ctx = createMockContext();
    const result = executeCommand('cls', ctx);
    expect(result.clear).toBe(true);
    expect(result.output).toEqual([]);
  });

  it('handles ver command returning Caio XP version', () => {
    const ctx = createMockContext();
    const result = executeCommand('ver', ctx);
    expect(result.output[0]).toContain('Caio XP Professional [Versão 5.1.2600]');
  });

  it('handles dir/ls command listing desktop items', () => {
    const ctx = createMockContext();
    const result = executeCommand('dir', ctx);
    const text = result.output.join('\n');
    expect(text).toContain('sobre-caio.txt');
    expect(text).toContain('caio-cv.pdf');
    expect(text).toContain('projetos');
    expect(text).toContain('hobbies');
  });

  it('handles program launchers (notepad, taskmgr, winmine, explorer, iexplore, hinario, cv)', () => {
    const ctx = createMockContext();
    
    executeCommand('notepad', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('notepad-blank-window');

    executeCommand('notepad sobre-caio.txt', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('about-window');

    executeCommand('taskmgr', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('task-manager-window');

    executeCommand('winmine', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('minesweeper-window');

    executeCommand('explorer hobbies', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('hobbies-window');

    executeCommand('iexplore', ctx);
    expect(ctx.openBrowser).toHaveBeenCalled();

    executeCommand('hinario', ctx);
    expect(ctx.openMobileApp).toHaveBeenCalled();

    executeCommand('cv', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('cv-window');
  });

  it('executa comando doom abrindo doom-window', () => {
    const ctx = createMockContext();
    const result = executeCommand('doom', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('doom-window');
    expect(result.output[0]).toContain('DOOM');
  });

  it('não reconhece mais cstrike', () => {
    const ctx = createMockContext();
    const result = executeCommand('cstrike', ctx);
    expect(result.output[0]).toContain('não é reconhecido');
  });

  it('handles exit command', () => {
    const ctx = createMockContext();
    const result = executeCommand('exit', ctx);
    expect(result.exit).toBe(true);
    expect(ctx.closeWindow).toHaveBeenCalledWith('cmd-window');
  });

  it('handles echo command', () => {
    const ctx = createMockContext();
    const result = executeCommand('echo Hello World!', ctx);
    expect(result.output).toEqual(['Hello World!']);
  });

  it('handles unknown command with friendly error', () => {
    const ctx = createMockContext();
    const result = executeCommand('nonexistent_cmd', ctx);
    expect(result.output[0]).toContain('não é reconhecido como um comando interno');
  });
});
