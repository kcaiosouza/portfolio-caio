import { MsnContact } from '../types/msn';
import { PORTFOLIO_DATA } from './data';

export const MSN_EMOTICONS: { code: string; label: string; icon: string }[] = [
  { code: ':)', label: 'Sorrindo', icon: '😊' },
  { code: ':D', label: 'Rindo', icon: '😃' },
  { code: ';)', label: 'Piscando', icon: '😉' },
  { code: ':P', label: 'Mostrando a língua', icon: '😛' },
  { code: '(L)', label: 'Coração', icon: '❤️' },
  { code: '(H)', label: 'Descolado', icon: '😎' },
  { code: '(Y)', label: 'Joinha', icon: '👍' },
  { code: ':S', label: 'Preocupado', icon: '😖' },
  { code: ':O', label: 'Surpreso', icon: '😮' },
];

export const DEFAULT_MSN_CONTACTS: MsnContact[] = [
  {
    id: 'caio',
    name: 'Caio Souza',
    status: 'online',
    personalMessage: 'Full Stack Dev | Single Software (Pleno III) 🚀',
    group: 'online',
    isDirectContact: false,
  },
  {
    id: 'rover',
    name: 'Rover Assistente',
    status: 'online',
    personalMessage: 'Au au! Assistente fiel do Caio XP 🐶',
    group: 'online',
    isDirectContact: false,
  },
  {
    id: 'caio-direct',
    name: 'Caio Souza (Mensagem Direta)',
    status: 'offline',
    personalMessage: '[Em breve: Envio direto ao e-mail] ✉️',
    group: 'direct',
    isDirectContact: true,
  },
  {
    id: 'recruiter',
    name: 'Recrutador Tech',
    status: 'offline',
    personalMessage: 'Buscando talentos Full Stack apaixonados por produto...',
    group: 'offline',
    isDirectContact: false,
  },
  {
    id: 'steve',
    name: 'Steve Ballmer',
    status: 'offline',
    personalMessage: 'Developers, developers, developers! 💻',
    group: 'offline',
    isDirectContact: false,
  },
];

export function parseEmoticonText(
  text: string
): (string | { code: string; label: string; icon: string })[] {
  if (!text) return [];

  const escapedCodes = MSN_EMOTICONS.map(e =>
    e.code.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  ).join('|');

  const regex = new RegExp(`(${escapedCodes})`, 'g');
  const parts = text.split(regex);

  return parts
    .filter(part => part.length > 0)
    .map(part => {
      const match = MSN_EMOTICONS.find(e => e.code === part);
      if (match) return match;
      return part;
    });
}

export function generateMsnReply(userText: string): string {
  const lower = userText.toLowerCase().trim();

  if (lower === '[nudge]') {
    return 'Opa! Tremeu a tela aqui! 😄 Em que posso te ajudar hoje? (H)';
  }

  if (
    lower.includes('oi') ||
    lower.includes('ola') ||
    lower.includes('olá') ||
    lower.includes('e ai') ||
    lower.includes('e aí') ||
    lower.includes('bom dia') ||
    lower.includes('boa tarde')
  ) {
    return 'E aí! Beleza? Bem-vindo ao meu MSN Messenger! Pode perguntar sobre meus projetos, carreira ou stack técnica! :)';
  }

  if (
    lower.includes('projeto') ||
    lower.includes('hinario') ||
    lower.includes('hinário') ||
    lower.includes('igcg') ||
    lower.includes('app')
  ) {
    return 'Desenvolvi o Hinário EAV (app React Native publicado na Play Store com RAG/IA embutido!) e a plataforma de streaming IGCG Music com backend em Docker, Traefik e MinIO. Você pode testá-los na pasta "Meus Projetos" ou no Emulador Móvel! (Y)';
  }

  if (
    lower.includes('stack') ||
    lower.includes('tecnologia') ||
    lower.includes('react') ||
    lower.includes('node') ||
    lower.includes('python') ||
    lower.includes('typescript')
  ) {
    return `Minha stack principal envolve ${PORTFOLIO_DATA.skills.slice(0, 7).join(', ')} e infraestrutura em Docker. Curto muito construir interfaces fluidas e backends resilientes! (H)`;
  }

  if (
    lower.includes('empresa') ||
    lower.includes('trabalho') ||
    lower.includes('experiencia') ||
    lower.includes('experiência') ||
    lower.includes('single') ||
    lower.includes('pleno')
  ) {
    return 'Atuo como Desenvolvedor Full Stack (Pleno III) na Single Software, além de cursar Sistemas de Informação na Unifacisa. Tenho mais de 6 anos no mercado e programo desde os 12 anos! 🚀';
  }

  if (
    lower.includes('contato') ||
    lower.includes('email') ||
    lower.includes('e-mail') ||
    lower.includes('falar') ||
    lower.includes('proposta')
  ) {
    return 'Você pode entrar em contato comigo pelo e-mail kcaiosouza@gmail.com ou pelo LinkedIn! Em breve, você também poderá mandar uma mensagem direta por este chat que cairá no meu e-mail! (L)';
  }

  return 'Legal sua mensagem! Como sou a réplica interativa do Caio no MSN, você pode me perguntar sobre meus projetos publicados, minha experiência na Single Software ou como construí esse Windows XP! :D';
}
