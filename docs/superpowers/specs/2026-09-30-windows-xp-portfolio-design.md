# Especificação de Design: Portfólio Retrô Windows XP (Dev Caio)

**Data:** 30/09/2026  
**Status:** Aprovado  
**Autor:** Dev Caio & Antigravity  

---

## 1. Visão Geral

O projeto consiste no desenvolvimento do portfólio profissional de **Dev Caio**, concebido como uma recriação imersiva, nostálgica e altamente fiel ao sistema operacional Windows XP (tema clássico Luna Blue), sem utilização de marcas registradas ou nomes patenteados da Microsoft.

O fluxo do usuário é composto por:
1. **Tela de Carregamento / BIOS (POST):** Fundo preto com listagem dinâmica de habilidades técnicas e experiência; rodapé interativo `Press DEL to enter SETUP` que atua como atalho para pular o carregamento.
2. **Tela de Boas-Vindas (Login):** Interface clássica azul do XP com o usuário "Dev Caio", avatar de caneca de café, transição com o icônico som retrô de inicialização.
3. **Área de Trabalho (Desktop XP):**
   - Papel de parede estilo *Bliss* (colinas verdes e céu azul).
   - Ícones na área de trabalho: `Lixeira`, `caio-cv.pdf`, `sobre-caio.txt` e pasta `hobbies`.
   - Gerenciador de janelas completo (arrasto, redimensionamento, minimizar para a barra de tarefas, maximizar, fechar e controle de profundidade `z-index`).
   - Barra de tarefas com botão "iniciar", lista de janelas ativas e bandeja do sistema (*System Tray*) com relógio em tempo real, controle de volume e botão de alternância do efeito CRT.
   - Menu Iniciar em duas colunas com atalhos, links sociais e opções de logoff/desligamento.
4. **Camada CRT (Tela de Tubo):** Filtro persistente por cima de toda a página simulando scanlines, curvatura e brilho de fósforo de monitores CRT dos anos 2000, com opção de ligar/desligar na bandeja do sistema.
5. **Modo VGA (Detecção Mobile):** Alerta retrô para dispositivos móveis com opção de continuar no modo adaptado ou abrir versão expressa do currículo.

---

## 2. Requisitos e Telas

### 2.1 Tela BIOS (Carregamento / POST)
- **Visual:** Fundo `#000000`, tipografia monoespaçada em verde/branco (`Courier New`, `Fixedsys` ou monospace).
- **Conteúdo exibido progressivamente:**
  - Header: `Dev Caio Modular BIOS v2.0 - Energy Star Compatible`
  - `CPU: 8+ Years Engineering Processor @ Ultra Performance`
  - `Memory Test: 16384KB OK`
  - `Loading Skills: React, Next.js, Node.js, React Native, TypeScript, JavaScript, CSS3, HTML5... [OK]`
  - `Languages Detected: Portuguese (Native), English (Fluent), Spanish (Intermediate)... [OK]`
  - `Mounting Drives: C:\dev-caio\portfolio... [OK]`
- **Comportamento:**
  - Rodapé piscando: `Press DEL to enter SETUP`.
  - Pressionar a tecla `Delete` ou clicar na tela interrompe a animação imediatamente, emite um bip clássico de BIOS e transiciona para a tela de login.
  - Carregamento natural automático encerra em ~4 segundos caso não haja interação.

### 2.2 Tela de Login (Boas-Vindas)
- **Visual:** Gradiente azul marinho e azul celeste, com barra horizontal escura e filetes laranja/amarelo fiéis ao Windows XP Welcome Screen.
- **Card de Usuário:**
  - Moldura de avatar quadrada com cantos arredondados, exibindo ilustração de uma caneca de café estilizada.
  - Nome: `Dev Caio`.
  - Subtítulo: `Engenheiro de Software Fullstack`.
  - Status informativo: `Clique para iniciar sessão`.
- **Ações:**
  - Clique no usuário: dispara o som retrô de inicialização (*Startup Chime*), desbloqueia o AudioContext do navegador e carrega o Desktop com transição suave.
  - Botão vermelho inferior: `Desligar o computador` (abre diálogo para reiniciar ou voltar à BIOS).

### 2.3 Área de Trabalho e Gerenciador de Janelas (Window Manager)
- **Fidelidade Visual:**
  - Tema Luna Blue com gradiente real nas barras de título (`#0058EE` para `#0372FD`), botões arredondados com sombra, botão `X` vermelho com hover luminoso.
  - Barras de título inativas assumem tom cinza-azulado desbotado (`#7A96DF`).
- **Comportamento das Janelas:**
  - **Arrastar (Drag):** Janela se move pela barra de título com contenção de bordas da viewport.
  - **Empilhamento (`z-index`):** Clicar em qualquer parte da janela a coloca no topo de todas as outras.
  - **Minimizar:** Oculta a janela e a destaca como minimizada no botão correspondente da barra de tarefas.
  - **Maximizar / Restaurar:** Alterna entre as coordenadas/dimensões flutuantes originais e 100% da tela visível (preservando a barra de tarefas).
  - **Fechar:** Encerra a instância da janela e remove seu botão da barra de tarefas.

### 2.4 Aplicativos e Ícones da Área de Trabalho
1. **Bloco de Notas (`sobre-caio.txt`):**
   - Menus: `Arquivo`, `Editar`, `Formatar`, `Exibir`, `Ajuda`.
   - Barra de status inferior: contagem de linhas e colunas.
   - Texto: trajetória de Caio (+8 anos de experiência), especialidades técnicas (React, Node, Next.js, React Native, TypeScript, CSS, JS, HTML), fluência em idiomas e links de contato direto.
2. **Visualizador de PDF (`caio-cv.pdf`):**
   - Interface de leitor de documentos retrô com controles de zoom, paginação e botão destacado `Salvar / Baixar CV` para download do PDF real.
   - Exibição estruturada do currículo em formato clássico e legível.
3. **Pasta de Hobbies (`hobbies`):**
   - Janela do Windows Explorer com botões de navegação, painel lateral esquerdo azul com "Tarefas comuns" e área principal com ícones:
     - `Cafe_Especial.txt`
     - `Setup_Gamer.jpg`
     - `Musica_e_Codificacao.mp3`
     - `Open_Source.lnk`
   - Duplo-clique em qualquer item abre sua respectiva janela (ex.: Visualizador de Imagens para o `.jpg`).
4. **Lixeira (`Lixeira`):**
   - Contém itens nostálgicos como Easter eggs: `Internet Explorer 6.exe`, `Adobe Flash Player.plugin`, `jQuery 1.4.js`, `Bugs em Producao.log`.
   - Botão `Esvaziar a lixeira` com diálogo modal de confirmação e som retrô de trituração de papel.

### 2.5 Barra de Tarefas, Menu Iniciar e Bandeja do Sistema
- **Botão Iniciar:** Cor verde reluzente (`#388E3C` / `#4CAF50`), tipografia itálica clássica.
- **Menu Iniciar:** Layout de duas colunas com avatar e nome de Caio no topo, atalhos rápidos à esquerda, utilitários e redes sociais à direita, botões de logoff e desligamento na base.
- **Bandeja do Sistema (Tray):**
  - Controle de Volume: permite silenciar ou restaurar o áudio dos efeitos sonoros.
  - Alternador CRT: botão para ativar/desativar a camada de tubo com um único clique.
  - Relógio digital: atualização em tempo real (HH:MM).

### 2.6 Efeito de Tela de Tubo (CRT)
- Camada de sobreposição com `pointer-events: none` contendo:
  - Padrão SVG/CSS de scanlines horizontais repetitivas.
  - Leve vinheta radial escurecendo cantos e simulando curvatura esférica de vidro de monitor CRT.
  - Sutil brilho de fósforo (*bloom*) que intensifica as cores retro.
  - Estado persistido em `localStorage`.

### 2.7 Modo VGA (Mobile Fallback)
- Em telas com largura inferior a 768px:
  - Exibe prompt estilo tela de diagnóstico retrô avisando sobre resolução reduzida.
  - Oferece escolha entre continuar em modo adaptado (janelas maximizadas) ou visualizar o currículo em formato direto.

---

## 3. Arquitetura Técnica

- **Framework:** React 18/19 com Vite e TypeScript.
- **Estilização:** Tailwind CSS + utilitários CSS para gradientes precisos e sombras do tema Luna Blue.
- **Gerenciamento de Estado:**
  - `SystemContext`: Controla a tela atual (`bios` | `login` | `desktop`), persistência do CRT e preferências.
  - `WindowContext`: Gerencia a lista de janelas, posições, dimensões, estados minimizado/maximizado e profundidade `z-index`.
  - `AudioContext`: Motor de áudio baseado na Web Audio API para reprodução de sons retrô (bip de BIOS, startup chime, clique de janela, esvaziar lixeira, erro).
- **Acessibilidade e Desempenho:**
  - Atalhos de teclado (DEL, Esc, Enter).
  - Isolamento de componentes e renderização sem gargalos de CPU/GPU.

---

## 4. Plano de Verificação e Testes

- **Testes Unitários:**
  - Transições de estado do Window Manager (abrir, fechar, focar, minimizar, maximizar).
  - Cálculo de `z-index` crescente para janelas ativas.
  - Lógica de bypass da tela de BIOS via tecla DEL.
- **Verificação Manual Interativa:**
  - Inicialização completa (BIOS -> Login -> Desktop).
  - Abertura simultânea de todas as janelas e verificação de arrasto sem sobreposição incorreta.
  - Verificação visual da camada CRT e resposta do botão de alternância na bandeja do sistema.
  - Teste de áudio e função mudo na bandeja.
