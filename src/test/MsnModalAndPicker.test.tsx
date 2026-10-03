import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MsnDirectMessageModal } from '../components/windows/msn/MsnDirectMessageModal';
import { MsnEmoticonPicker } from '../components/windows/msn/MsnEmoticonPicker';

describe('MSN Modal and Emoticon Picker', () => {
  it('renders MsnDirectMessageModal with Em Breve info and action buttons', () => {
    const handleClose = vi.fn();
    render(<MsnDirectMessageModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Mensagem Direta do MSN/i)).toBeInTheDocument();
    expect(screen.getByText(/Recurso em breve/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar E-mail Agora/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar E-mail/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /OK/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders MsnEmoticonPicker and selects an emoticon', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();
    render(<MsnEmoticonPicker isOpen={true} onSelectEmoticon={handleSelect} onClose={handleClose} />);

    const heartBtn = screen.getByTitle('Coração ((L))');
    expect(heartBtn).toBeInTheDocument();

    fireEvent.click(heartBtn);
    expect(handleSelect).toHaveBeenCalledWith('(L)');
  });
});
