import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ViceCityApp } from '../components/windows/ViceCityApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';
import { HOBBIES_ITEMS } from '../utils/data';
import { executeCommand } from '../utils/cmdEngine';

describe('ViceCityApp Component & Hobbies Integration', () => {
  it('includes GTA_Vice_City.exe in HOBBIES_ITEMS with correct properties', () => {
    const vc = HOBBIES_ITEMS.find(h => h.id === 'vice-city');
    expect(vc).toBeDefined();
    expect(vc?.title).toBe('GTA_Vice_City.exe');
    expect(vc?.type).toBe('game');
    expect(vc?.content).toBe('/apps/vice-city/index.html');
    expect(vc?.windowId).toBe('vice-city-window');
  });

  it('renders iframe with /apps/vice-city/index.html and permissions when open', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <ViceCityApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    const iframe = screen.getByTestId('vice-city-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', '/apps/vice-city/index.html');
    expect(iframe).toHaveAttribute('title', 'GTA Vice City Online');

    const allow = iframe.getAttribute('allow') || '';
    expect(allow).toContain('autoplay');
    expect(allow).toContain('fullscreen');
    expect(allow).toContain('gamepad');
    expect(allow).toContain('cross-origin-isolated');
  });

  it('renders window title Grand Theft Auto: Vice City', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <ViceCityApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText('Grand Theft Auto: Vice City')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <ViceCityApp isOpen={false} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.queryByTestId('vice-city-iframe')).not.toBeInTheDocument();
  });

  it('handles gta and vicecity commands in cmdEngine', () => {
    const openWindowMock = vi.fn();
    const ctx = {
      openWindow: openWindowMock,
      closeWindow: vi.fn(),
      setScreenMode: vi.fn(),
    };

    const resGta = executeCommand('gta', ctx);
    expect(openWindowMock).toHaveBeenCalledWith('vice-city-window');
    expect(resGta.output[0]).toContain('Vice City');

    const resVc = executeCommand('vicecity', ctx);
    expect(openWindowMock).toHaveBeenCalledWith('vice-city-window');
    expect(resVc.output[0]).toContain('Vice City');
  });

  it('closes window when receiving quit-game postMessage', () => {
    const closeMock = vi.fn();
    render(
      <SystemProvider>
        <WindowProvider>
          <ViceCityApp isOpen={true} onClose={closeMock} />
        </WindowProvider>
      </SystemProvider>
    );

    window.dispatchEvent(new MessageEvent('message', { data: 'quit-game' }));
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
