import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DoomApp } from '../components/windows/DoomApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('DoomApp Component', () => {
  it('renders window title and icon when open', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <DoomApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText('DOOM (1993)')).toBeInTheDocument();
    const icon = screen.getByAltText('DOOM');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/assets/doom-icon.webp');
    expect(screen.getByTestId('doom-container')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <DoomApp isOpen={false} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.queryByTestId('doom-container')).not.toBeInTheDocument();
  });
});
