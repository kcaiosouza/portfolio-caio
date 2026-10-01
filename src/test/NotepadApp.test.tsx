import { describe, it, expect } from 'vitest';
import { generateNotepadText } from '../components/windows/NotepadApp';

describe('NotepadApp Bio Text', () => {
  it('contains updated Pleno III role and Single Software information', () => {
    const text = generateNotepadText();
    expect(text).toContain('Desenvolvedor Full Stack (Pleno III)');
    expect(text).toContain('Single Software');
    expect(text).toContain('HINÁRIO EAV');
    expect(text).toContain('IGCGMUSIC BETA');
  });
});
