import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MSN_CONTACTS,
  generateMsnReply,
  MSN_EMOTICONS,
  parseEmoticonText
} from '../utils/msnEngine';

describe('MSN Engine', () => {
  it('provides default contacts with Caio Souza online and direct message contact as [Em breve]', () => {
    expect(DEFAULT_MSN_CONTACTS.length).toBeGreaterThanOrEqual(4);
    const caio = DEFAULT_MSN_CONTACTS.find(c => c.id === 'caio');
    expect(caio).toBeDefined();
    expect(caio?.status).toBe('online');

    const direct = DEFAULT_MSN_CONTACTS.find(c => c.isDirectContact);
    expect(direct).toBeDefined();
    expect(direct?.personalMessage).toContain('Em breve');
  });

  it('generates contextual replies for skills, projects, experience and greetings', () => {
    expect(generateMsnReply('oi Caio')).toMatch(/E aí|Olá|Tudo bem/i);
    expect(generateMsnReply('quais são seus projetos?')).toMatch(/Hinário EAV|IGCG/i);
    expect(generateMsnReply('qual sua stack?')).toMatch(/React|Node|TypeScript/i);
    expect(generateMsnReply('onde você trabalha?')).toMatch(/Single Software|Pleno III/i);
  });

  it('generates friendly reaction when user nudges', () => {
    expect(generateMsnReply('[nudge]')).toMatch(/Opa!|Tremeu a tela|Diga aí/i);
  });

  it('parses classic MSN emoticon shortcodes into structured tokens', () => {
    const text = 'Olá! :) Tudo bem? (L) Abraço :D';
    const tokens = parseEmoticonText(text);

    expect(tokens.some(t => typeof t !== 'string' && t.code === ':)')).toBe(true);
    expect(tokens.some(t => typeof t !== 'string' && t.code === '(L)')).toBe(true);
    expect(tokens.some(t => typeof t !== 'string' && t.code === ':D')).toBe(true);
  });
});
