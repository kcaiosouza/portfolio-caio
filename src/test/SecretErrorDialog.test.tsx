import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SecretErrorDialog } from '../components/modals/SecretErrorDialog';

describe('SecretErrorDialog Component', () => {
  it('renders dialog with title Easter Egg do Sistema and notification text when open', () => {
    const handleClose = vi.fn();
    render(<SecretErrorDialog isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Easter Egg do Sistema')).toBeInTheDocument();
    expect(
      screen.getByText('Código secreto ativo! Jogos liberados (Minecraft e GTA)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Novos atalhos foram desbloqueados na pasta Hobbies e no Prompt de Comando.')
    ).toBeInTheDocument();

    const okButton = screen.getByRole('button', { name: /^ok$/i });
    expect(okButton).toBeInTheDocument();
    fireEvent.click(okButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when isOpen is false', () => {
    render(<SecretErrorDialog isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Easter Egg do Sistema')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<SecretErrorDialog isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside on the backdrop', () => {
    const handleClose = vi.fn();
    render(<SecretErrorDialog isOpen={true} onClose={handleClose} />);

    const overlay = screen.getByTestId('secret-error-dialog-overlay');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the window content', () => {
    const handleClose = vi.fn();
    render(<SecretErrorDialog isOpen={true} onClose={handleClose} />);

    const dialogContent = screen.getByTestId('secret-error-dialog-content');
    fireEvent.click(dialogContent);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('focuses OK button automatically when dialog is open', () => {
    render(<SecretErrorDialog isOpen={true} onClose={vi.fn()} />);
    const okButton = screen.getByRole('button', { name: /^ok$/i });
    expect(document.activeElement).toBe(okButton);
  });

  it('calls onClose when pressing Escape key', () => {
    const handleClose = vi.fn();
    render(<SecretErrorDialog isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
