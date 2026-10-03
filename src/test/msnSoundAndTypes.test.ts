import { describe, it, expect } from 'vitest';
import { soundEngine } from '../utils/soundEffects';
import { MsnContact, MsnMessage, MsnStatus } from '../types/msn';

describe('MSN Types and Sound Effects', () => {
  it('defines valid MSN data contracts', () => {
    const status: MsnStatus = 'online';
    const contact: MsnContact = {
      id: 'caio',
      name: 'Caio Souza',
      status: 'online',
      personalMessage: 'Full Stack Dev | Single Software',
      group: 'online',
      avatar: '/assets/avatar-caio.png',
      isDirectContact: false,
    };
    const message: MsnMessage = {
      id: '1',
      sender: 'caio',
      senderName: 'Caio Souza',
      text: 'Olá! Como posso ajudar?',
      timestamp: Date.now(),
      type: 'chat',
    };

    expect(status).toBe('online');
    expect(contact.id).toBe('caio');
    expect(message.text).toBe('Olá! Como posso ajudar?');
  });

  it('exposes playMsnOnline, playMsnMessage, and playMsnNudge methods on soundEngine', () => {
    expect(typeof (soundEngine as any).playMsnOnline).toBe('function');
    expect(typeof (soundEngine as any).playMsnMessage).toBe('function');
    expect(typeof (soundEngine as any).playMsnNudge).toBe('function');

    expect(() => (soundEngine as any).playMsnOnline()).not.toThrow();
    expect(() => (soundEngine as any).playMsnMessage()).not.toThrow();
    expect(() => (soundEngine as any).playMsnNudge()).not.toThrow();
  });
});
