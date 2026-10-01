import { describe, it, expect } from 'vitest';
import {
  INITIAL_ASSISTANT_MESSAGE,
  getInitialMessages,
  sendAssistantMessage
} from '../services/assistantService';

describe('assistantService', () => {
  it('returns the initial greeting message', () => {
    const history = getInitialMessages();
    expect(history.length).toBe(1);
    expect(history[0].role).toBe('assistant');
    expect(history[0].content).toBe(INITIAL_ASSISTANT_MESSAGE);
    expect(history[0].content).toContain('Como posso te ajudar hoje?');
  });

  it('appends user message and returns assistant response with full history', async () => {
    const initial = getInitialMessages();
    const result = await sendAssistantMessage(initial, 'Quais são os projetos do Caio?');
    expect(result.reply).toBeDefined();
    expect(result.updatedHistory.length).toBe(3); // [assistant greeting, user msg, assistant reply]
    expect(result.updatedHistory[1].role).toBe('user');
    expect(result.updatedHistory[1].content).toBe('Quais são os projetos do Caio?');
    expect(result.updatedHistory[2].role).toBe('assistant');
    expect(result.updatedHistory[2].content).toBe(result.reply);
  });

  it('handles multi-turn conversation and maintains all previous turns', async () => {
    const initial = getInitialMessages();
    const turn1 = await sendAssistantMessage(initial, 'Como navegar pelo portfólio?');
    expect(turn1.updatedHistory.length).toBe(3);

    const turn2 = await sendAssistantMessage(turn1.updatedHistory, 'Qual a stack dele?');
    expect(turn2.updatedHistory.length).toBe(5);
    expect(turn2.updatedHistory[3].role).toBe('user');
    expect(turn2.updatedHistory[3].content).toBe('Qual a stack dele?');
    expect(turn2.updatedHistory[4].role).toBe('assistant');
    expect(turn2.updatedHistory[4].content).toBe(turn2.reply);
  });
});
