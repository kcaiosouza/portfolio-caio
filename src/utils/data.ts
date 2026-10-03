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
  { id: 'cmd', title: 'Prompt de comando', iconType: 'cmd', windowId: 'cmd-window' },
  { id: 'projects', title: 'projetos', iconType: 'folder', windowId: 'projects-window' },
  { id: 'hobbies', title: 'hobbies', iconType: 'folder', windowId: 'hobbies-window' },
  { id: 'spider', title: 'Paciência Spider', iconType: 'spider', windowId: 'spider-solitaire-window' },
  { id: 'msn', title: 'MSN Messenger', iconType: 'msn', windowId: 'msn-window' },
  { id: 'winamp', title: 'Winamp', iconType: 'winamp', windowId: 'winamp-window' }
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
    title: 'Minhas_Musicas.txt',
    type: 'text',
    content: `======================================================================
MINHAS-MUSICAS.TXT - BLOCO DE NOTAS DO CAIO
======================================================================

PERFIL MUSICAL:   100% Eclético | Sem rótulos ou preconceitos
LEMA:             "Música boa é música que toca a alma e inspira código"
PRESENÇA:         Fone de ouvido ligado o dia inteiro no setup
PROJETO REAL:     Criador do IGCG Music (plataforma completa de áudio)

----------------------------------------------------------------------
[1] MEU GOSTO MUSICAL & RELAÇÃO COM A MÚSICA
----------------------------------------------------------------------
Se tem uma coisa que define o que ouço, é a diversidade. A IA inventou
que eu só ouvia 'Synthwave e Lofi', mas a verdade é que no meu dia a dia
o repertório vai de um extremo ao outro com total naturalidade:

  > Pop Nacional & Internacional: refrões marcantes, produções modernas
  > Sertanejo (raiz ao universitário): clássicos de estrada e modões
  > Rap & Hip Hop: ritmo, rimas inteligentes e foco no flow
  > Funk: batidas contagiantes para dar aquela acelerada no ritmo
  > Pop Rock & Classic Rock: guitarras marcantes e energia para debugs
  > Country: violões acústicos, melodias autênticas e storytelling
  > Gospel & Hinos: paz, adoração profunda e renovação de forças
  > Trilhas Sonoras de Games & Animes: nostalgia pura da infância

Essa paixão por música não fica só nos fones de ouvido: me levou a
desenvolver soluções reais de tecnologia musical, como o IGCG Music
(web rádio e catálogo) e o Hinário EAV (app mobile na Play Store).

----------------------------------------------------------------------
[2] TOP MÚSICAS & ARTISTAS FAVORITOS
----------------------------------------------------------------------
Algumas das faixas que estão sempre no repeat ou marcadas no Winamp:

[ GOSPEL & ADORAÇÃO ]
  * My Prayer - Editora Árvore da Vida
  * Anelo por Tua Presença - Editora Árvore da Vida
  * Hinos Clássicos & Cânticos Espirituais

[ POP & INTERNACIONAL ]
  * M83 - Midnight City
  * Crusher-P - Echo
  * The Weeknd / Bruno Mars / Coldplay

[ ROCK & POP ROCK ]
  * Legião Urbana / Capital Inicial / Charlie Brown Jr.
  * Queen / Linkin Park / Bon Jovi

[ SERTANEJO & BRASIL ]
  * Jorge & Mateus / Henrique & Juliano / Chitãozinho & Xororó
  * Clássicos sertanejos dos anos 90 e 2000

----------------------------------------------------------------------
[3] WINAMP 2.91 NO WINDOWS XP
----------------------------------------------------------------------
Abra o ícone do Winamp na Área de Trabalho para ouvir faixas reais
tocando direto pelo nosso player retrô de alta fidelidade com visualizer
de espectro e equalizador de 10 bandas!`,
    description: 'Gosto Musical Eclético & Inspiração'
  },
  {
    id: 'open-source',
    title: 'Open_Source.txt',
    type: 'text',
    content: 'Criador e contribuidor de bibliotecas open-source e ferramentas voltadas para a comunidade de desenvolvedores.',
    description: 'Projetos e contribuições'
  },
  {
    id: 'minecraft',
    title: 'Minecraft.exe',
    type: 'game',
    content: 'https://classic.minecraft.net/',
    description: 'Versão clássica original de Minecraft (0.0.23a_01) jogável diretamente no navegador.',
    windowId: 'minecraft-window'
  }
];

export const TRASH_ITEMS = [
  { name: 'Internet Explorer 6.exe', size: '14.2 MB', date: '15/08/2001' },
  { name: 'Adobe Flash Player.plugin', size: '8.4 MB', date: '31/12/2020' },
  { name: 'jQuery 1.4.2.js', size: '72 KB', date: '19/02/2010' },
  { name: 'Bugs em Producao.log', size: '0 KB', date: 'Hoje' }
];
