import { DesktopIconItem, HobbyItem, ProjectItem } from '../types';

export const PORTFOLIO_DATA = {
  name: 'Dev Caio',
  title: 'Engenheiro de Software Fullstack',
  yearsOfExperience: 8,
  summary: 'Desenvolvedor Fullstack com +8 anos de experiência em arquitetura web moderna, aplicações de alto desempenho e interfaces ricas. Especialista no ecossistema JavaScript/TypeScript, construindo soluções escaláveis e intuitivas de ponta a ponta.',
  skills: [
    'React', 'Next.js', 'Node.js', 'React Native',
    'TypeScript', 'JavaScript', 'CSS3 / Tailwind', 'HTML5',
    'PostgreSQL / MongoDB', 'Git / CI/CD', 'REST / GraphQL'
  ],
  languages: [
    { lang: 'Português', level: 'Nativo' },
    { lang: 'Inglês', level: 'Fluente (Profissional)' },
    { lang: 'Espanhol', level: 'Intermediário' }
  ],
  experience: [
    {
      period: '2021 - Presente',
      role: 'Senior Fullstack Engineer',
      description: 'Liderança técnica no desenvolvimento de aplicações escaláveis em React, Next.js e Node.js. Otimização de performance web e microsserviços.'
    },
    {
      period: '2018 - 2021',
      role: 'Fullstack Developer',
      description: 'Construção de ecossistemas web e mobile com React Native, integrações de APIs REST e arquitetura frontend modular.'
    },
    {
      period: '2016 - 2018',
      role: 'Frontend Developer',
      description: 'Desenvolvimento de interfaces SPA dinâmicas, componentização e responsividade focada na experiência do usuário.'
    }
  ],
  contacts: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'mailto:caio@exemplo.com'
  }
};

export const DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'recycle-bin', title: 'Lixeira', iconType: 'trash', windowId: 'recycle-bin-window' },
  { id: 'cv', title: 'caio-cv.pdf', iconType: 'pdf', windowId: 'cv-window' },
  { id: 'about', title: 'sobre-caio.txt', iconType: 'notepad', windowId: 'about-window' },
  { id: 'hinario-eav', title: 'Hinario EAV', iconType: 'smartphone', windowId: 'mobile-app-window' },
  { id: 'projects', title: 'projetos', iconType: 'folder', windowId: 'projects-window' },
  { id: 'hobbies', title: 'hobbies', iconType: 'folder', windowId: 'hobbies-window' }
];

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'hinario-eav',
    title: 'Hinario EAV',
    fileTitle: 'Hinario_EAV.apk',
    url: 'https://www.igrejaemcampinagrande.com.br/hinario/',
    description: 'Aplicativo mobile de hinário com cifras, busca rápida por número/título e partituras, projetado com layout responsivo para smartphones.',
    tags: ['Mobile App', 'React', 'TypeScript', 'PWA / Web'],
    type: 'mobile',
    featured: true
  },
  {
    id: 'igcgmusic',
    title: 'IGCG Music',
    fileTitle: 'IGCG_Music.url',
    url: 'https://igcgmusic.com.br',
    description: 'Plataforma completa de música, streaming de web rádio e catálogo de cifras musicais, desenvolvida com React, Node.js e arquitetura moderna.',
    tags: ['React', 'Node.js', 'Web Radio', 'Cifras', 'Audio Streaming', 'CSS3'],
    type: 'web',
    featured: true
  }
];

export const HOBBIES_ITEMS: HobbyItem[] = [
  {
    id: 'cafe',
    title: 'Cafe_Especial.txt',
    type: 'text',
    content: 'Entusiasta de cafés especiais: métodos V60, Chemex e Prensa Francesa. O combustível perfeito para codificar interfaces complexas!',
    description: 'Notas de degustação e métodos favoritos'
  },
  {
    id: 'setup',
    title: 'Setup_Gamer.jpg',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'Estética retrô & PC Gaming'
  },
  {
    id: 'musica',
    title: 'Musica_e_Lofi.txt',
    type: 'text',
    content: 'Synthwave dos anos 80, Lofi hip-hop e trilhas sonoras de videogames clássicos acompanhando cada commit.',
    description: 'Playlist & Inspiração Sonora'
  },
  {
    id: 'open-source',
    title: 'Open_Source.txt',
    type: 'text',
    content: 'Criador e contribuidor de bibliotecas open-source e ferramentas voltadas para a comunidade de desenvolvedores.',
    description: 'Projetos e contribuições'
  }
];

export const TRASH_ITEMS = [
  { name: 'Internet Explorer 6.exe', size: '14.2 MB', date: '15/08/2001' },
  { name: 'Adobe Flash Player.plugin', size: '8.4 MB', date: '31/12/2020' },
  { name: 'jQuery 1.4.2.js', size: '72 KB', date: '19/02/2010' },
  { name: 'Bugs em Producao.log', size: '0 KB', date: 'Hoje' }
];
