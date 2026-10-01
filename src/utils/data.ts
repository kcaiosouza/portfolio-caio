import { DesktopIconItem, HobbyItem, ProjectItem } from '../types';

export const PORTFOLIO_DATA = {
  name: 'Caio Souza',
  title: 'Desenvolvedor Full Stack (Pleno III)',
  company: 'Single Software',
  yearsOfExperience: 8,
  summary: 'Desenvolvedor Full Stack que aprende explorando e testando na prática. Promovido de Junior a Pleno III em 1 ano e 3 meses na Single Software. Do front à infra: backend, Docker, Traefik, storage S3 e apps mobile completos.',
  skills: [
    'React', 'Next.js', 'Node.js', 'React Native',
    'TypeScript', 'JavaScript', 'Tailwind', 'Docker',
    'PostgreSQL', 'GraphQL', 'Expo', 'Python', 'Vue / Nuxt'
  ],
  languages: [
    { lang: 'Português', level: 'Nativo' },
    { lang: 'Inglês', level: 'Fluente (Profissional)' },
    { lang: 'Espanhol', level: 'Intermediário' }
  ],
  experience: [
    {
      period: '2025 - Presente',
      role: 'Desenvolvedor Pleno III',
      company: 'Single Software',
      description: 'Promovido de Junior a Pleno III em 1 ano e 3 meses na Single Software. Atuação com Vue, Nuxt, Python e ecossistemas web/mobile.'
    },
    {
      period: '2024 - 2025',
      role: 'Desenvolvedor de Software (Estágio)',
      company: 'Unifacisa Centro Universitário',
      description: 'Desenvolvimento de sistemas institucionais utilizando AngularJS.'
    },
    {
      period: '2021 - 2023',
      role: 'Desenvolvedor Full Stack',
      company: 'Redepharma',
      description: 'Desenvolvimento Full Stack presencial com React.js, PHP, Python e bancos relacionais.'
    }
  ],
  contacts: {
    github: 'https://github.com/kcaiosouza',
    linkedin: 'https://linkedin.com/in/kcaiosouza',
    email: 'mailto:caio@exemplo.com'
  }
};

export const DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'recycle-bin', title: 'Lixeira', iconType: 'trash', windowId: 'recycle-bin-window' },
  { id: 'cv', title: 'caio-cv.pdf', iconType: 'pdf', windowId: 'cv-window' },
  { id: 'about', title: 'sobre-caio.txt', iconType: 'notepad', windowId: 'about-window' },
  { id: 'projects', title: 'projetos', iconType: 'folder', windowId: 'projects-window' },
  { id: 'hobbies', title: 'hobbies', iconType: 'folder', windowId: 'hobbies-window' }
];

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'hinario-eav',
    title: 'Hinario EAV',
    fileTitle: 'Hinario_EAV.apk',
    url: 'https://www.igrejaemcampinagrande.com.br/hinario/',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=br.com.igrejacg.hinarioeav',
    description: 'Aplicativo mobile de hinário publicado oficialmente na Google Play Store. Conta com cifras, busca rápida por número/título, partituras e assistente de IA, desenvolvido com React Native e Expo.',
    tags: ['Google Play', 'Mobile App', 'React Native', 'Expo', 'IA / RAG'],
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
