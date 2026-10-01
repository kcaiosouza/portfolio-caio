import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CmdApp } from '../components/windows/CmdApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('CmdApp', () => {
  const renderCmd = () => {
    return render(
      <SystemProvider>
        <WindowProvider>
          <CmdApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );
  };

  it('renders initial banner and prompt path C:\\Caio\\Desktop>', () => {
    renderCmd();
    expect(screen.getByText(/Caio XP Professional \[Versão 5.1.2600\]/i)).toBeInTheDocument();
    expect(screen.getByText(/C:\\Caio\\Desktop>/i)).toBeInTheDocument();
  });

  it('executes a command on Enter and displays output', () => {
    renderCmd();
    const input = screen.getByRole('textbox', { name: /prompt-input/i });
    fireEvent.change(input, { target: { value: 'ver' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getAllByText(/Caio XP Professional \[Versão 5.1.2600\]/i).length).toBeGreaterThanOrEqual(1);
  });

  it('navigates command history with ArrowUp and ArrowDown', () => {
    renderCmd();
    const input = screen.getByRole('textbox', { name: /prompt-input/i }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'echo first' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    fireEvent.change(input, { target: { value: 'echo second' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Press ArrowUp to get "echo second"
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(input.value).toBe('echo second');

    // Press ArrowUp to get "echo first"
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(input.value).toBe('echo first');

    // Press ArrowDown to get back to "echo second"
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(input.value).toBe('echo second');
  });

  it('clears screen when cls is typed', () => {
    renderCmd();
    const input = screen.getByRole('textbox', { name: /prompt-input/i });
    fireEvent.change(input, { target: { value: 'cls' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.queryByText(/Versão 5.1.2600/i)).not.toBeInTheDocument();
  });
});
