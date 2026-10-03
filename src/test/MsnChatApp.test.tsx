import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MsnChatApp } from '../components/windows/msn/MsnChatApp';

describe('MsnChatApp', () => {
  it('renders chat window with contact name, personal message and initial greeting', () => {
    render(<MsnChatApp isOpen={true} />);

    expect(screen.getAllByText(/Caio Souza/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Full Stack Dev/i)).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo ao meu MSN Messenger/i)).toBeInTheDocument();
  });

  it('sends user message and displays bot response', async () => {
    render(<MsnChatApp isOpen={true} />);
    const input = screen.getByPlaceholderText(/Digite sua mensagem aqui/i);
    const sendBtn = screen.getByRole('button', { name: /Enviar/i });

    fireEvent.change(input, { target: { value: 'Quais são seus projetos?' } });
    fireEvent.click(sendBtn);

    expect(input).toHaveValue('');
    expect(screen.getByText('Quais são seus projetos?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Hinário EAV/i)).toBeInTheDocument();
    });
  });

  it('handles Nudge (Chamar Atenção) button click', () => {
    render(<MsnChatApp isOpen={true} />);
    const nudgeBtn = screen.getByRole('button', { name: /Chamar atenção/i });

    fireEvent.click(nudgeBtn);
    expect(screen.getByText(/Você acabou de chamar a atenção!/i)).toBeInTheDocument();
  });
});
