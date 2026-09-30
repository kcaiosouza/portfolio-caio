import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { WindowProvider, useWindowManager } from '../context/WindowContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WindowProvider>{children}</WindowProvider>
);

describe('WindowContext Management', () => {
  it('should initialize with default closed windows', () => {
    const { result } = renderHook(() => useWindowManager(), { wrapper });
    expect(result.current.windows.length).toBeGreaterThan(0);
    expect(result.current.windows.every(w => !w.isOpen)).toBe(true);
  });

  it('should open window and give it highest zIndex', () => {
    const { result } = renderHook(() => useWindowManager(), { wrapper });
    act(() => {
      result.current.openWindow('about-window');
    });
    const aboutWin = result.current.windows.find(w => w.id === 'about-window');
    expect(aboutWin?.isOpen).toBe(true);
    expect(aboutWin?.isMinimized).toBe(false);
    expect(aboutWin?.zIndex).toBe(11);
  });

  it('should toggle minimize and maximize properly', () => {
    const { result } = renderHook(() => useWindowManager(), { wrapper });
    act(() => {
      result.current.openWindow('about-window');
      result.current.maximizeWindow('about-window');
    });
    let win = result.current.windows.find(w => w.id === 'about-window');
    expect(win?.isMaximized).toBe(true);

    act(() => {
      result.current.minimizeWindow('about-window');
    });
    win = result.current.windows.find(w => w.id === 'about-window');
    expect(win?.isMinimized).toBe(true);
  });
});
