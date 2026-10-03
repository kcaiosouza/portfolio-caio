import { describe, it, expect } from 'vitest';
import { DESKTOP_ICONS, HOBBIES_ITEMS } from '../utils/data';
import { executeCommand } from '../utils/cmdEngine';
import { DEFAULT_WINAMP_TRACKS, WINAMP_EQ_PRESETS } from '../utils/winampTracks';
import { calculateMagneticSnap } from '../hooks/useWinampDocking';

describe('Winamp & Eclectic Music Notepad Integration', () => {
  it('registers winamp in DESKTOP_ICONS with correct windowId', () => {
    const icon = DESKTOP_ICONS.find(i => i.id === 'winamp');
    expect(icon).toBeDefined();
    expect(icon?.windowId).toBe('winamp-window');
  });

  it('updates Hobbies music file to Minhas_Musicas.txt with eclectic bio and real songs', () => {
    const musicHobby = HOBBIES_ITEMS.find(h => h.id === 'musica');
    expect(musicHobby).toBeDefined();
    expect(musicHobby?.title).toBe('Minhas_Musicas.txt');
    expect(musicHobby?.content).toContain('MINHAS-MUSICAS.TXT - BLOCO DE NOTAS DO CAIO');
    expect(musicHobby?.content).toContain('100% Eclético');
    expect(musicHobby?.content).toContain('My Prayer');
    expect(musicHobby?.content).toContain('Anelo por Tua Presença');
    expect(musicHobby?.content).toContain('IGCG Music');
  });

  it('includes user provided tracks in DEFAULT_WINAMP_TRACKS', () => {
    const myPrayer = DEFAULT_WINAMP_TRACKS.find(t => t.title.includes('My Prayer'));
    expect(myPrayer).toBeDefined();
    expect(myPrayer?.url).toContain('384d1368-913a-43b6-bd16-7a9dd2da0fd3.mp3');

    const anelo = DEFAULT_WINAMP_TRACKS.find(t => t.title.includes('Anelo por Tua Presença'));
    expect(anelo).toBeDefined();
    expect(anelo?.url).toContain('e98167f0-98ce-4e2e-9d0f-eb99694ca9b0.mp3');
  });

  it('handles winamp, music, and player commands in cmdEngine', () => {
    let openedId = '';
    const ctx = {
      openWindow: (id: string) => { openedId = id; },
      closeWindow: () => {},
      setScreenMode: () => {},
    };

    const res1 = executeCommand('winamp', ctx);
    expect(openedId).toBe('winamp-window');
    expect(res1.output[0]).toContain('Winamp');

    const res2 = executeCommand('music', ctx);
    expect(openedId).toBe('winamp-window');

    const res3 = executeCommand('player', ctx);
    expect(openedId).toBe('winamp-window');
  });

  it('snaps equalizer window below main player using magnetic docking calculation', () => {
    const main = { x: 100, y: 100, width: 275, height: 116 };
    const eq = { x: 102, y: 220, width: 275, height: 116 }; // close to 216

    const snap = calculateMagneticSnap(eq, main, 18);
    expect(snap.snapped).toBe(true);
    expect(snap.x).toBe(100);
    expect(snap.y).toBe(216);
  });
});
