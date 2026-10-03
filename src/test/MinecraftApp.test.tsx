import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MinecraftApp } from '../components/windows/MinecraftApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('MinecraftApp Component', () => {
  it('renders iframe with correct src and permissions when open', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <MinecraftApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    const iframe = screen.getByTestId('minecraft-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://classic.minecraft.net/');
    expect(iframe).toHaveAttribute('title', 'Minecraft Classic');

    const allow = iframe.getAttribute('allow') || '';
    expect(allow).toContain('autoplay');
    expect(allow).toContain('fullscreen');
    expect(allow).toContain('pointer-lock');
  });

  it('renders window title and icon', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <MinecraftApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText('Minecraft Classic')).toBeInTheDocument();
    const icon = screen.getByAltText('Minecraft');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/assets/minecraft-icon.webp');
  });

  it('does not render content when closed', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <MinecraftApp isOpen={false} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.queryByTestId('minecraft-iframe')).not.toBeInTheDocument();
  });
});
