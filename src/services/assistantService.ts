export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export const INITIAL_ASSISTANT_MESSAGE =
  'Como posso te ajudar hoje? Alguma dúvida sobre como mexer no portfólio ou alguma pergunta sobre o Caio?';

export function getInitialMessages(): ChatMessage[] {
  return [
    {
      role: 'assistant',
      content: INITIAL_ASSISTANT_MESSAGE,
      timestamp: Date.now(),
    },
  ];
}

function generateMockReply(userText: string): string {
  const lower = userText.toLowerCase().trim();

  if (
    lower.includes('projeto') ||
    lower.includes('portfolio') ||
    lower.includes('portfólio') ||
    lower.includes('hinario') ||
    lower.includes('hinário') ||
    lower.includes('igcg') ||
    lower.includes('whatwatch') ||
    lower.includes('app') ||
    lower.includes('sistema')
  ) {
    return 'O Caio desenvolveu projetos incríveis como o Hinário EAV (app oficial já publicado na Google Play Store!), o IGCG Music e IGCG Music Beta (plataforma musical para igrejas), e o WhatWatch. Você pode abrir a pasta "Meus Projetos" para experimentar no emulador ou baixar direto na Play Store!';
  }

  if (
    lower.includes('stack') ||
    lower.includes('tecnologia') ||
    lower.includes('linguagem') ||
    lower.includes('react') ||
    lower.includes('typescript') ||
    lower.includes('node') ||
    lower.includes('c#') ||
    lower.includes('python') ||
    lower.includes('ferramenta')
  ) {
    return 'O Caio trabalha com React, TypeScript, Next.js, Node.js, C#/.NET, Python, Tailwind CSS e bancos relacionais e NoSQL. Ele atua como Desenvolvedor Full Stack (Pleno III) na Single Software!';
  }

  if (
    lower.includes('quem') ||
    lower.includes('caio') ||
    lower.includes('sobre') ||
    lower.includes('bio') ||
    lower.includes('experiencia') ||
    lower.includes('experiência') ||
    lower.includes('curriculo') ||
    lower.includes('currículo')
  ) {
    return 'Caio Souza é Desenvolvedor Full Stack (Pleno III) na Single Software, com mais de 6 anos no mercado e programando desde os 12 anos. Ele estuda Sistemas de Informação na Unifacisa. Dê dois cliques em "sobre-caio.txt" na Área de Trabalho para ler a bio completa!';
  }

  if (
    lower.includes('navegar') ||
    lower.includes('mexer') ||
    lower.includes('usar') ||
    lower.includes('como') ||
    lower.includes('ajuda') ||
    lower.includes('janela') ||
    lower.includes('desktop')
  ) {
    return 'Você pode usar este portfólio como se fosse o clássico Windows XP! Dê dois cliques nos ícones da Área de Trabalho para abrir pastas e programas, use o Menu Iniciar no canto inferior esquerdo, arraste e redimensione as janelas à vontade!';
  }

  if (
    lower.includes('contato') ||
    lower.includes('email') ||
    lower.includes('e-mail') ||
    lower.includes('github') ||
    lower.includes('linkedin') ||
    lower.includes('falar')
  ) {
    return 'Você pode entrar em contato com o Caio pelo e-mail kcaiosouza@gmail.com, ou abrir o aplicativo "Contato" na Área de Trabalho para acessar seus perfis no GitHub e LinkedIn!';
  }

  return 'Au au! 🐶 Sou o assistente do portfólio do Caio! No momento estou operando no modo offline com respostas rápidas, mas em breve o Caio vai me conectar ao backend de IA dele! Pergunte-me sobre os projetos, a stack, quem é o Caio ou como navegar pelo sistema!';
}

export async function sendAssistantMessage(
  history: ChatMessage[],
  userText: string
): Promise<{ reply: string; updatedHistory: ChatMessage[] }> {
  // Simulate typing latency in non-test environments
  const isTest =
    (typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.MODE === 'test')) ||
    (typeof globalThis !== 'undefined' && Boolean((globalThis as any).process?.env?.NODE_ENV === 'test'));
  if (!isTest) {
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  const userMessage: ChatMessage = {
    role: 'user',
    content: userText,
    timestamp: Date.now(),
  };

  const newHistory = [...history, userMessage];

  // Placeholder for external AI backend connection (e.g., POST /api/chat):
  /*
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newHistory,
        prompt: userText,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const reply = data.reply || data.message;
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      return { reply, updatedHistory: [...newHistory, assistantMessage] };
    }
  } catch (error) {
    console.error('Error contacting AI assistant endpoint:', error);
  }
  */

  const reply = generateMockReply(userText);
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: reply,
    timestamp: Date.now(),
  };

  return {
    reply,
    updatedHistory: [...newHistory, assistantMessage],
  };
}
