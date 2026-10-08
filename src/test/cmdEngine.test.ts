import { describe, it, expect, vi } from 'vitest';
import { executeCommand, CMD_BANNER, CommandContext } from '../utils/cmdEngine';

describe('cmdEngine', () => {
  const createMockContext = (overrides?: Partial<CommandContext>): CommandContext => ({
    openWindow: vi.fn(),
    closeWindow: vi.fn(),
    setScreenMode: vi.fn(),
    openBrowser: vi.fn(),
    openMobileApp: vi.fn(),
    isSecretUnlocked: false,
    lockSecretGames: vi.fn(),
    unlockSecretGames: vi.fn(),
    ...overrides,
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

  it('executa comando minecraft abrindo minecraft-window quando desbloqueado', () => {
    const ctx = createMockContext({ isSecretUnlocked: true });
    const result = executeCommand('minecraft', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('minecraft-window');
    expect(result.output[0]).toContain('Minecraft');
  });

  it('executa aliases mc e craft quando desbloqueado', () => {
    const ctx = createMockContext({ isSecretUnlocked: true });
    executeCommand('mc', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('minecraft-window');
    executeCommand('craft', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('minecraft-window');
  });

  it('não reconhece mais doom', () => {
    const ctx = createMockContext();
    const result = executeCommand('doom', ctx);
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

  describe('secret games locked/unlocked integration', () => {
    it('help omits MINECRAFT and GTA when locked (isSecretUnlocked: false)', () => {
      const ctx = createMockContext({ isSecretUnlocked: false });
      const result = executeCommand('help', ctx);
      expect(result.output.some(line => line.includes('MINECRAFT'))).toBe(false);
      expect(result.output.some(line => line.includes('GTA'))).toBe(false);
    });

    it('help includes MINECRAFT and GTA when unlocked (isSecretUnlocked: true)', () => {
      const ctx = createMockContext({ isSecretUnlocked: true });
      const result = executeCommand('help', ctx);
      expect(result.output.some(line => line.includes('MINECRAFT'))).toBe(true);
      expect(result.output.some(line => line.includes('GTA'))).toBe(true);
    });

    it('blocks minecraft, mc, craft when locked and returns unrecognized message', () => {
      const ctx = createMockContext({ isSecretUnlocked: false });
      const result = executeCommand('minecraft', ctx);
      expect(ctx.openWindow).not.toHaveBeenCalled();
      expect(result.output[0]).toContain('não é reconhecido como um comando interno');

      executeCommand('mc', ctx);
      expect(ctx.openWindow).not.toHaveBeenCalled();

      executeCommand('craft', ctx);
      expect(ctx.openWindow).not.toHaveBeenCalled();
    });

    it('blocks gta, vicecity, vice-city when locked and returns unrecognized message', () => {
      const ctx = createMockContext({ isSecretUnlocked: false });
      const result = executeCommand('gta', ctx);
      expect(ctx.openWindow).not.toHaveBeenCalled();
      expect(result.output[0]).toContain('não é reconhecido como um comando interno');

      executeCommand('vicecity', ctx);
      expect(ctx.openWindow).not.toHaveBeenCalled();

      executeCommand('vice-city', ctx);
      expect(ctx.openWindow).not.toHaveBeenCalled();
    });

    it('executes minecraft and gta when unlocked', () => {
      const ctx = createMockContext({ isSecretUnlocked: true });
      const resMc = executeCommand('minecraft', ctx);
      expect(ctx.openWindow).toHaveBeenCalledWith('minecraft-window');
      expect(resMc.output[0]).toContain('Iniciando Minecraft Classic');

      const resGta = executeCommand('gta', ctx);
      expect(ctx.openWindow).toHaveBeenCalledWith('vice-city-window');
      expect(resGta.output[0]).toContain('Iniciando Grand Theft Auto: Vice City');
    });

    it('handles lock and resetgames commands by calling lockSecretGames and returning confirmation', () => {
      const ctx = createMockContext();
      const resLock = executeCommand('lock', ctx);
      expect(ctx.lockSecretGames).toHaveBeenCalled();
      expect(resLock.output).toEqual([
        'Jogos secretos bloqueados com sucesso.',
        'Digite o código secreto para liberar novamente.'
      ]);

      const resReset = executeCommand('resetgames', ctx);
      expect(ctx.lockSecretGames).toHaveBeenCalledTimes(2);
      expect(resReset.output).toEqual([
        'Jogos secretos bloqueados com sucesso.',
        'Digite o código secreto para liberar novamente.'
      ]);
    });
  });
});
