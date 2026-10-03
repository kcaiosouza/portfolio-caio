import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PuppyAssistant } from '../components/assistant/PuppyAssistant';

describe('PuppyAssistant', () => {
  it('renders puppy image and speech balloon with initial message', () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const puppyImg = screen.getByAltText('Cachorro Ajudante');
    expect(puppyImg).toBeInTheDocument();
    expect(puppyImg).toHaveAttribute('src', '/assets/beagle-puppy.png');

    expect(
      screen.getByText(
        'Como posso te ajudar hoje? Alguma dúvida sobre como mexer no portfólio ou alguma pergunta sobre o Caio?'
      )
    ).toBeInTheDocument();
  });

  it('respects defaultOpen=false and can open by clicking puppy', () => {
    render(<PuppyAssistant defaultOpen={false} />);
    const puppyImg = screen.getByAltText('Cachorro Ajudante');
    expect(puppyImg).toBeInTheDocument();

    expect(
      screen.queryByText(/Como posso te ajudar hoje\?/i)
    ).not.toBeInTheDocument();

    fireEvent.click(puppyImg);
    expect(
      screen.getByText(/Como posso te ajudar hoje\?/i)
    ).toBeInTheDocument();
  });

  it('can close balloon via close button and reopen by clicking puppy image', () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const closeBtn = screen.getByRole('button', { name: /Fechar balão/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(
      screen.queryByText(/Como posso te ajudar hoje\?/i)
    ).not.toBeInTheDocument();

    const puppyImg = screen.getByAltText('Cachorro Ajudante');
    fireEvent.click(puppyImg);
    expect(
      screen.getByText(/Como posso te ajudar hoje\?/i)
    ).toBeInTheDocument();
  });

  it('sends user message via Enviar button and updates speech bubble with new reply', async () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const input = screen.getByPlaceholderText(/Pergunte algo\.\.\./i);
    const sendBtn = screen.getByRole('button', { name: /Enviar/i });

    fireEvent.change(input, { target: { value: 'Quais são os projetos do Caio?' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    await waitFor(() => {
      expect(
        screen.getByText(/O Caio desenvolveu projetos.*como o Hinário EAV/i)
      ).toBeInTheDocument();
    });

    // Ensure only the single latest message is visually displayed
    expect(
      screen.queryByText(/Como posso te ajudar hoje\?/i)
    ).not.toBeInTheDocument();
    // User query should not be kept in visual speech balloon log
    expect(
      screen.queryByText('Quais são os projetos do Caio?')
    ).not.toBeInTheDocument();
  });

  it('allows sending user message via Enter key', async () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const input = screen.getByPlaceholderText(/Pergunte algo\.\.\./i);

    fireEvent.change(input, { target: { value: 'Qual a sua stack?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    await waitFor(() => {
      expect(
        screen.getByText(/O Caio trabalha com React, TypeScript/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/Como posso te ajudar hoje\?/i)
    ).not.toBeInTheDocument();
  });

  it('does not send empty messages', () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const input = screen.getByPlaceholderText(/Pergunte algo\.\.\./i);
    const sendBtn = screen.getByRole('button', { name: /Enviar/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendBtn);

    // Initial message stays intact
    expect(
      screen.getByText(/Como posso te ajudar hoje\?/i)
    ).toBeInTheDocument();
  });

  it('stops click propagation inside the balloon to avoid desktop deselection', () => {
    const parentClickSpy = vi.fn();
    render(
      <div onClick={parentClickSpy}>
        <PuppyAssistant defaultOpen={true} />
      </div>
    );

    const input = screen.getByPlaceholderText(/Pergunte algo\.\.\./i);
    fireEvent.click(input);

    expect(parentClickSpy).not.toHaveBeenCalled();
  });

  it('handles multi-turn conversation displaying only the latest response', async () => {
    render(<PuppyAssistant defaultOpen={true} />);
    const input = screen.getByPlaceholderText(/Pergunte algo\.\.\./i);
    const sendBtn = screen.getByRole('button', { name: /Enviar/i });

    // Turn 1
    fireEvent.change(input, { target: { value: 'Quais são os projetos?' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/O Caio desenvolveu projetos.*como o Hinário EAV/i)
      ).toBeInTheDocument();
    });

    // Turn 2
    fireEvent.change(input, { target: { value: 'Quem é o Caio?' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Caio Souza é Desenvolvedor Full Stack/i)
      ).toBeInTheDocument();
    });

    // Previous turn response should no longer be displayed
    expect(
      screen.queryByText(/O Caio desenvolveu projetos como o Hinário EAV/i)
    ).not.toBeInTheDocument();
  });
});
