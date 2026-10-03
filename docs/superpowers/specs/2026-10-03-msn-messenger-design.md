# Especificação de Design: MSN Messenger 7.5 (Caio Messenger XP)

**Data:** 2026-10-03  
**Status:** Aprovado  
**Autor:** Caio Souza & Antigravity  

---

## 1. Visão Geral e Objetivo

Implementar uma réplica fiel e nostálgica do **MSN Messenger 7.5** integrado ao ecossistema do **Windows XP (Luna Blue)** do portfólio. A aplicação proporcionará uma experiência imersiva e interativa para recrutadores e visitantes, permitindo:
1. Navegar por uma **Lista de Contatos autêntica** com perfil do usuário, status e grupos de amigos/recrutadores.
2. Abrir uma **Janela de Conversa independente** com o bot do próprio Caio Souza para tirar dúvidas sobre projetos, experiência profissional, stack técnica e curiosidades.
3. Utilizar o icônico botão **"Chamar Atenção" (Nudge)**, com vibração real da janela de chat e efeito sonoro característico.
4. Experimentar **efeitos sonoros sintetizados** do MSN (o famoso *Tudum*, som de mensagem instantânea e alerta de atenção).
5. Visualizar o canal de contato direto **"Falar com o Caio Real [Em breve]"** que exibirá um modal retrô explicando a futura integração direta por e-mail com atalhos imediatos.

---

## 2. Arquitetura e Estrutura de Componentes

Seguindo o padrão do projeto e aproveitando o componente [`WindowFrame`](file:///C:/devPasta/portfolio-caio/src/components/windows/WindowFrame.tsx) existente, a funcionalidade será dividida em:

```
src/
├── components/
│   └── windows/
│       ├── msn/
│       │   ├── MsnContactListApp.tsx     # Janela principal de contatos (msn-window)
│       │   ├── MsnChatApp.tsx            # Janela de conversa independente (msn-chat-window)
│       │   ├── MsnDirectMessageModal.tsx # Modal retrô do contato direto [Em breve]
│       │   └── MsnEmoticonPicker.tsx     # Seletor de emoticons clássicos do MSN
├── types/
│   └── msn.ts                            # Interfaces de contatos, mensagens e status
├── utils/
│   ├── msnEngine.ts                      # Respostas inteligentes do bot do Caio e parser de emoticons
│   └── soundEffects.ts                   # Extensão com os sons síntetizados do MSN
```

### 2.1. Janelas Registradas em [`WindowContext.tsx`](file:///C:/devPasta/portfolio-caio/src/context/WindowContext.tsx)

1. `msn-window` (Lista de Contatos):
   * Título: `MSN Messenger`
   * Ícone: `msn` (SVG autêntico com os dois bonequinhos verde e azul)
   * Dimensões iniciais: `{ x: 80, y: 40, width: 300, height: 530 }`
2. `msn-chat-window` (Janela de Bate-Papo):
   * Título: `Caio Souza - Conversa`
   * Ícone: `msn`
   * Dimensões iniciais: `{ x: 260, y: 70, width: 490, height: 470 }`

---

## 3. Especificação Detalhada das Telas e Interações

### 3.1. Janela Principal de Contatos (`MsnContactListApp`)
* **Header de Perfil**:
  * Foto de exibição do usuário (avatar de café com moldura azul do MSN).
  * Nome: `Dev Caio` ou nome do visitante personalizável.
  * Status interativo (Dropdown com bolinhas coloridas):
    * 🟢 *Disponível*
    * 🔴 *Ocupado*
    * 🟡 *Ausente*
    * ⚪ *Invisível*
  * Mensagem Pessoal retrô: *"Ouvindo: Synthwave & Lofi | Desenvolvendo no Caio XP 🚀"*.
* **Abas de Ação Rápida**: Ícones de contatos, correio, serviços MSN.
* **Grupos de Contatos**:
  * **Online (2)**:
    * 🟢 **Caio Souza** — *"Desenvolvedor Full Stack (Pleno III) na Single Software"*.
      *(Duplo clique abre a Janela de Conversa `msn-chat-window`)*.
    * 🟢 **Rover** — *"Au au! Assistente do XP"*.
  * **Fale com o Caio Real (1)**:
    * ✉️ **Caio Souza (Mensagem Direta)** — `[Em breve: Envio direto ao e-mail]`.
      *(Duplo clique abre o modal `MsnDirectMessageModal`)*.
  * **Offline (2)**:
    * ⚪ **Recrutador Tech** — *"Buscando talentos Full Stack..."*.
    * ⚪ **Steve Ballmer** — *"Developers, developers, developers!"*.
* **Rodapé**: Banner decorativo clássico do portal MSN e total de contatos online.

### 3.2. Janela de Conversa (`MsnChatApp`)
* **Barra de Ferramentas Superior**:
  * Botões clássicos com ícones nostálgicos:
    * 📳 **Chamar Atenção**: dispara animação CSS `@keyframes msn-shake` na janela por 600ms, toca `soundEngine.playMsnNudge()` e insere no chat a linha em itálico e negrito: `Você acabou de chamar a atenção!`.
    * 😊 **Emoticons**: abre popover com atalhos nostálgicos: `:)`, `:D`, `;)`, `(L)`, `(H)`, `:P`, `(Y)`.
    * ✉️ **Mensagem Direta [Em breve]**: abre o modal explicativo de envio direto ao e-mail.
* **Painel Central de Mensagens**:
  * Histórico de conversa com estilos clássicos:
    * `Caio Souza diz (HH:mm):` em azul/preto.
    * `Você diz (HH:mm):` em vermelho/preto.
    * Mensagens de sistema em itálico.
  * Parser automático de emoticons transformando textos como `(L)` e `:D` nos respectivos ícones gráficos coloridos.
* **Barra de Digitação e Ações**:
  * Caixa de texto com suporte a `Enter` para envio.
  * Botão tradicional "Enviar" no canto direito.
  * Indicador de digitação dinâmico: *"Caio Souza está digitando uma mensagem..."* enquanto simula o tempo de resposta do bot (300-800ms).
* **Avatar Lateral**: Foto de perfil grande no canto superior direito do chat.

### 3.3. Modal "Falar com o Caio Real [Em Breve]" (`MsnDirectMessageModal`)
* Estilo caixa de diálogo clássica do MSN Messenger / Windows:
  * Título: `Mensagem Direta do MSN`
  * Ícone: Carta postal com o símbolo do MSN.
  * Mensagem:
    > *"Recurso em breve! 📬 Estamos implementando a integração para que suas mensagens digitadas aqui cheguem instantaneamente à caixa de entrada do Caio (`kcaiosouza@gmail.com`). Enquanto isso, você pode continuar conversando com a réplica inteligente do Caio no MSN ou clicar no botão abaixo para abrir seu cliente de e-mail tradicional."*
  * Botões:
    * `Enviar E-mail Agora` (abre link `mailto:kcaiosouza@gmail.com`).
    * `Copiar E-mail` (copia `kcaiosouza@gmail.com` para a área de transferência com feedback visual).
    * `OK` (fecha o modal).

---

## 4. Efeitos Sonoros com Web Audio API

Todas as ondas sonoras serão sintetizadas em [`soundEffects.ts`](file:///C:/devPasta/portfolio-caio/src/utils/soundEffects.ts) sem arquivos externos pesados:
1. `playMsnOnline()`: Arpejo suave simulando o clássico *"Tudum"* do MSN.
2. `playMsnMessage()`: Som cristalino e nostálgico de mensagem recebida.
3. `playMsnNudge()`: Som característico de vibração / buzina curta de chamada de atenção.
* Respeitam automaticamente o estado de mudo (`isMuted`) do sistema.

---

## 5. Pontos de Integração no Sistema

1. **Área de Trabalho (`Desktop.tsx` e `data.ts`)**:
   * Novo ícone `{ id: 'msn', title: 'MSN Messenger', iconType: 'msn', windowId: 'msn-window' }`.
   * SVG dos dois bonequinhos clássicos (azul e verde) adicionado ao renderizador de ícones do [`DesktopIcon.tsx`](file:///C:/devPasta/portfolio-caio/src/components/desktop/DesktopIcon.tsx).
2. **Menu Iniciar (`StartMenu.tsx`)**:
   * Adicionado na coluna esquerda de programas do Menu Iniciar com subtítulo *"Mensagens instantâneas"*.
3. **Prompt de Comando (`cmdEngine.ts`)**:
   * Comandos `msn` e `messenger` mapeados para abrir a janela `msn-window`.
4. **Gerenciador de Tarefas (`TaskManagerApp.tsx`)**:
   * Processo `msnmsgr.exe` registrado dinamicamente na lista de processos e aplicativos ativos.
5. **Barra de Tarefas (`Taskbar.tsx`)**:
   * Suporte às abas `msn-window` e `msn-chat-window` com o ícone característico do MSN Messenger.

---

## 6. Estratégia de Testes

Criar testes unitários e de integração abrangentes com Vitest e Testing Library:
1. `src/test/msnEngine.test.ts`: teste do parser de emoticons e das respostas inteligentes do bot do Caio.
2. `src/test/MsnContactListApp.test.tsx`: renderização da lista de contatos, grupos, status e disparo para abrir a janela de chat ou modal.
3. `src/test/MsnChatApp.test.tsx`: envio de mensagens, recepção de resposta, botão "Chamar Atenção", efeito de tremer e modal de e-mail direto.
4. Ajuste no teste existente [`src/test/soundAndData.test.ts`](file:///C:/devPasta/portfolio-caio/src/test/soundAndData.test.ts) corrigindo a asserção desatualizada do nome do Caio.
