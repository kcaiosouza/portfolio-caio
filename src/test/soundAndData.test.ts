import { describe, it, expect } from 'vitest';
import { PORTFOLIO_DATA, DESKTOP_ICONS } from '../utils/data';
import { soundEngine } from '../utils/soundEffects';

describe('Data and Sound Tests', () => {
  it('should contain complete portfolio data for Caio', () => {
    expect(PORTFOLIO_DATA.name).toBe('Caio Souza');
    expect(PORTFOLIO_DATA.yearsOfExperience).toBeGreaterThanOrEqual(8);
    expect(PORTFOLIO_DATA.skills).toContain('React');
    expect(PORTFOLIO_DATA.skills).toContain('Next.js');
    expect(PORTFOLIO_DATA.skills).toContain('Node.js');
  });

  it('should contain the 4 desktop icons required', () => {
    const ids = DESKTOP_ICONS.map(i => i.id);
    expect(ids).toContain('recycle-bin');
    expect(ids).toContain('cv');
    expect(ids).toContain('about');
    expect(ids).toContain('hobbies');
  });

  it('should toggle sound engine mute state', () => {
    const initialMute = soundEngine.isMuted();
    soundEngine.setMuted(!initialMute);
    expect(soundEngine.isMuted()).toBe(!initialMute);
    soundEngine.setMuted(initialMute);
  });
});
