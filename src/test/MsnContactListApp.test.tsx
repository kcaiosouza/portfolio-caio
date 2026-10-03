import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MsnContactListApp } from '../components/windows/msn/MsnContactListApp';
import { WindowProvider } from '../context/WindowContext';

describe('MsnContactListApp', () => {
  it('renders contact list with user profile, status dropdown and groups', () => {
    render(
      <WindowProvider>
        <MsnContactListApp isOpen={true} />
      </WindowProvider>
    );

    expect(screen.getAllByText(/MSN Messenger/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dev Caio/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Caio Souza/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Rover Assistente/i)).toBeInTheDocument();
    expect(screen.getByText(/Caio Souza \(Mensagem Direta\)/i)).toBeInTheDocument();
  });

  it('allows changing current user status', () => {
    render(
      <WindowProvider>
        <MsnContactListApp isOpen={true} />
      </WindowProvider>
    );

    const statusBtn = screen.getByRole('button', { name: /status-selector/i });
    fireEvent.click(statusBtn);

    const busyOption = screen.getByRole('button', { name: /Ocupado/i });
    fireEvent.click(busyOption);

    expect(screen.getByText(/Ocupado/i)).toBeInTheDocument();
  });

  it('opens direct message modal when double-clicking direct contact', () => {
    render(
      <WindowProvider>
        <MsnContactListApp isOpen={true} />
      </WindowProvider>
    );

    const directContact = screen.getByText(/Caio Souza \(Mensagem Direta\)/i);
    fireEvent.doubleClick(directContact);

    expect(screen.getByText(/Mensagem Direta do MSN/i)).toBeInTheDocument();
    expect(screen.getByText(/Recurso em breve!/i)).toBeInTheDocument();
  });

  it('allows editing personal status message', () => {
    render(
      <WindowProvider>
        <MsnContactListApp isOpen={true} />
      </WindowProvider>
    );

    const msgElement = screen.getByText(/Ouvindo: Synthwave/i);
    fireEvent.click(msgElement);

    const input = screen.getByDisplayValue(/Ouvindo: Synthwave/i);
    fireEvent.change(input, { target: { value: 'Codando o portfolio XP' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Codando o portfolio XP/i)).toBeInTheDocument();
  });
});

