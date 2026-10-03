export interface CommandContext {
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  setScreenMode: (mode: 'bios' | 'login' | 'desktop') => void;
  openBrowser?: (url?: string) => void;
  openMobileApp?: (url?: string) => void;
}

export interface CommandResult {
  output: string[];
  clear?: boolean;
  exit?: boolean;
}

export const CMD_BANNER: string[] = [
  'Caio XP Professional [Versão 5.1.2600]',
  '(C) Copyright 2016-2026 Caio Souza. Todos os direitos reservados.',
  ''
];

export const PROMPT_PATH = 'C:\\Caio\\Desktop>';

export function executeCommand(rawInput: string, ctx: CommandContext): CommandResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { output: [] };
  }

  const spaceIndex = trimmed.indexOf(' ');
  const command = (spaceIndex === -1 ? trimmed : trimmed.substring(0, spaceIndex)).toLowerCase();
  const args = spaceIndex === -1 ? '' : trimmed.substring(spaceIndex + 1).trim();

  switch (command) {
    case 'help':
    case '?':
      return {
        output: [
          'Comandos disponíveis no Caio XP Professional:',
          '',
          '  HELP                  Exibe esta lista de comandos de ajuda.',
          '  CLS / CLEAR           Limpa a tela do Prompt de Comando.',
          '  VER                   Exibe a versão do Caio XP Professional.',
          '  DIR / LS              Lista arquivos e pastas da Área de Trabalho.',
          '  NOTEPAD [arquivo]     Abre o Bloco de Notas (ex: notepad sobre-caio.txt).',
          '  TASKMGR               Abre o Gerenciador de Tarefas do Windows.',
          '  WINMINE / MINESWEEPER Abre o jogo Campo Minado.',
          '  SPIDER / SOLITAIRE    Abre o jogo Paciência Spider.',
          '  MINECRAFT             Abre o jogo Minecraft Classic.',
          '  EXPLORER [pasta]      Abre o Windows Explorer (projetos ou hobbies).',
          '  IEXPLORE [url]        Abre o navegador Internet Explorer.',
          '  HINARIO               Abre o emulador móvel do aplicativo Hinário EAV.',
          '  CV / PDF              Abre o currículo completo em PDF.',
          '  ECHO [mensagem]       Exibe uma mensagem na tela.',
          '  DATE                  Exibe a data atual do sistema.',
          '  TIME                  Exibe a hora atual do sistema.',
          '  SHUTDOWN              Reinicia o computador para a tela de BIOS.',
          '  EXIT                  Fecha a janela do Prompt de Comando.',
          ''
        ]
      };

    case 'cls':
    case 'clear':
      return {
        output: [],
        clear: true
      };

    case 'ver':
    case 'version':
      return {
        output: [
          'Caio XP Professional [Versão 5.1.2600]',
          '(C) Copyright 2016-2026 Caio Souza. Todos os direitos reservados.'
        ]
      };

    case 'dir':
    case 'ls':
      return {
        output: [
          ' O volume na unidade C é CAIO_XP',
          ' O Número de Série do Volume é 2026-CA10',
          '',
          ' Pasta de C:\\Caio\\Desktop',
          '',
          '01/10/2026  10:00    <DIR>          .',
          '01/10/2026  10:00    <DIR>          ..',
          '01/10/2026  10:00    <DIR>          projetos',
          '01/10/2026  10:00    <DIR>          hobbies',
          '01/10/2026  10:00    <DIR>          Lixeira',
          '01/10/2026  10:00             1.420 sobre-caio.txt',
          '01/10/2026  10:00           154.218 caio-cv.pdf',
          '01/10/2026  10:00               482 Prompt de comando.lnk',
          '               3 arquivo(s)        156.120 bytes',
          '               5 pasta(s)   124.582.912 bytes livres'
        ]
      };

    case 'shutdown':
    case 'reboot':
    case 'restart':
      ctx.setScreenMode('bios');
      return {
        output: ['Reiniciando o sistema Caio XP Professional...']
      };

    case 'notepad':
    case 'bloco':
      if (args.toLowerCase().includes('sobre') || args.toLowerCase().includes('caio')) {
        ctx.openWindow('about-window');
        return { output: ['Abrindo sobre-caio.txt no Bloco de notas...'] };
      }
      ctx.openWindow('notepad-blank-window');
      return { output: ['Iniciando Bloco de notas...'] };

    case 'taskmgr':
    case 'taskmanager':
      ctx.openWindow('task-manager-window');
      return { output: ['Iniciando Gerenciador de tarefas...'] };

    case 'winmine':
    case 'minesweeper':
    case 'minado':
      ctx.openWindow('minesweeper-window');
      return { output: ['Iniciando Campo Minado...'] };

    case 'spider':
    case 'paciencia':
    case 'solitaire':
      ctx.openWindow('spider-solitaire-window');
      return { output: ['Iniciando Paciência Spider...'] };

    case 'minecraft':
    case 'mc':
    case 'craft':
      ctx.openWindow('minecraft-window');
      return {
        output: [
          'Iniciando Minecraft Classic...',
          'Dica: Clique na tela para capturar o mouse. Pressione Esc para liberar.'
        ]
      };

    case 'explorer':
      if (args.toLowerCase().includes('hobb')) {
        ctx.openWindow('hobbies-window');
        return { output: ['Abrindo pasta hobbies...'] };
      }
      ctx.openWindow('projects-window');
      return { output: ['Abrindo pasta projetos...'] };

    case 'iexplore':
    case 'browser':
    case 'internet':
      if (ctx.openBrowser) {
        ctx.openBrowser(args || undefined);
      } else {
        ctx.openWindow('browser-window');
      }
      return { output: ['Iniciando Internet Explorer...'] };

    case 'hinario':
    case 'mobile':
      if (ctx.openMobileApp) {
        ctx.openMobileApp();
      } else {
        ctx.openWindow('mobile-app-window');
      }
      return { output: ['Iniciando Hinario EAV (Emulador Móvel)...'] };

    case 'cv':
    case 'pdf':
    case 'curriculo':
      ctx.openWindow('cv-window');
      return { output: ['Abrindo currículo (caio-cv.pdf)...'] };

    case 'echo':
      return {
        output: [args]
      };

    case 'date': {
      const now = new Date();
      return {
        output: [`Data atual: ${now.toLocaleDateString('pt-BR')}`]
      };
    }

    case 'time': {
      const now = new Date();
      return {
        output: [`Hora atual: ${now.toLocaleTimeString('pt-BR')}`]
      };
    }

    case 'exit':
      ctx.closeWindow('cmd-window');
      return {
        output: [],
        exit: true
      };

    default:
      return {
        output: [
          `'${command}' não é reconhecido como um comando interno ou externo,`,
          'um programa operável ou um arquivo em lotes.',
          "Digite 'help' para ver os comandos disponíveis."
        ]
      };
  }
}
