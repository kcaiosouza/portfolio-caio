import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CsApp } from '../components/windows/CsApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('CsApp Component', () => {
  it('renders iframe with correct src and sandbox/allow permissions when open', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <CsApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    const iframe = screen.getByTestId('cs-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://play-cs.com/pt/servers');
    expect(iframe).toHaveAttribute('title', 'Counter-Strike 1.6');

    const allow = iframe.getAttribute('allow') || '';
    expect(allow).toContain('autoplay');
    expect(allow).toContain('fullscreen');
  });

  it('renders window title and icon', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <CsApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText('Counter-Strike 1.6')).toBeInTheDocument();
    const icon = screen.getByAltText('CS 1.6');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/assets/cs16-icon.webp');
  });

  it('does not render content when closed', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <CsApp isOpen={false} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.queryByTestId('cs-iframe')).not.toBeInTheDocument();
  });
});
