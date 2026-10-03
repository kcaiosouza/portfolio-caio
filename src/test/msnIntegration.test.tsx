import { describe, it, expect } from 'vitest';
import { DESKTOP_ICONS } from '../utils/data';
import { executeCommand } from '../utils/cmdEngine';

describe('MSN System Integration', () => {
  it('registers msn in DESKTOP_ICONS', () => {
    const msnIcon = DESKTOP_ICONS.find(i => i.id === 'msn');
    expect(msnIcon).toBeDefined();
    expect(msnIcon?.windowId).toBe('msn-window');
  });

  it('handles msn and messenger commands in cmdEngine', () => {
    let openedId = '';
    const ctx = {
      openWindow: (id: string) => { openedId = id; },
      closeWindow: () => {},
      setScreenMode: () => {},
    };

    const res1 = executeCommand('msn', ctx);
    expect(openedId).toBe('msn-window');
    expect(res1.output[0]).toContain('MSN Messenger');

    const res2 = executeCommand('messenger', ctx);
    expect(openedId).toBe('msn-window');
  });
});
