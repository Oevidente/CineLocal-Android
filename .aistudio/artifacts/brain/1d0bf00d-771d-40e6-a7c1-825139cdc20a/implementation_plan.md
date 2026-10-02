# CineLocal Android & Web PWA: Streaming e Biblioteca Local com Geração de APK

Plano completo para migrar a plataforma para Android com suporte a geração de APK nativo completo via Capacitor e GitHub Actions, mantendo compatibilidade 100% estática para GitHub Pages, PWA instalável no PC e Android, navegação fluida desktop e layout mobile com ergonomia por abas inferiores.

## Decisões Confirmadas com o Usuário

> [!IMPORTANT]
> Decisões alinhadas e confirmadas na fase de clarificação interativa:

- **Arquitetura Android**: Capacitor configurado na base do projeto com workflow automatizado no GitHub Actions para compilação contínua e download do APK (`build-apk.yml`).
- **Acesso a Arquivos e Mídia**: Seletor nativo de arquivos e pastas compatível tanto com o ambiente Android (Storage Access Framework / File System nativo) quanto no desktop via File System Access API e IndexedDB local persistente com zero custo de servidor ou cotas de banco de dados.
- **Reprodução Multimídia**: Reprodutor web embutido acelerado por hardware com suporte unificado para vídeos locais (MP4, WebM, MKV compatível), fluxos de TV ao vivo HLS (.m3u8 / IPTV) e WebTorrent no cliente.
- **Zero Custos e Sem IA**: Nenhuma dependência paga, nenhum banco de dados com limite de cotas (armazenamento 100% local no dispositivo e cache offline) e sem recursos de inteligência artificial conforme solicitado.
- **PWA & GitHub Pages**: Deploy automatizado no GitHub Pages via GitHub Actions e Service Worker PWA com botão de instalação rápida no PC e no celular.

---

## 1. Visão Geral e Conceito do Produto

O **CineLocal** evolui de um app estritamente dependente de Node.js local para uma plataforma híbrida universal com foco primordial em **Android (APK)**, **PWA móvel** e **Web Desktop fluido**:
- **Experiência Android**: Aplicativo instalado nativamente ou via PWA com visual estilo Netflix escuro cinematográfico, barra de navegação inferior por polegar (thumb-friendly), busca instantânea, reprodução em tela cheia sem bordas e acesso a arquivos locais, canais de TV ao vivo (IPTV aberto gratuito) e reprodução de torrents.
- **Experiência Desktop**: Catálogo imersivo com Hero Banner cinematográfico, fileiras dinâmicas de carrossel, atalhos de teclado ágeis (Espaço para pausar/retomar, F para tela cheia, setas para avanço/volume) e suporte a múltiplos monitores.
- **Totalmente Gratuito e Descentralizado**: Não utiliza bancos de dados em nuvem pagos ou com limite de cotas; todo o catálogo, progresso de reprodução, pastas sincronizadas e favoritos de IPTV ficam salvos no armazenamento local do dispositivo (IndexedDB e LocalStorage).

---

## 2. Experiência do Usuário e Design Visual

### A. Navegação Mobile Organizada (Ergonomia por Polegar)
- **Barra de Abas Inferior Fixa (Bottom Nav Bar)**:
  - Destinos claros com ícones e rótulos unificados: `Início`, `Filmes`, `Séries`, `TV ao Vivo`, `Torrents`.
  - Área de toque ampliada ($\ge 48\text{px}$) com feedback tátil suave e indicador ativo elegante.
  - Altura respeitando o limite de 15% da altura da viewport para maximizar a área de conteúdo visível.
- **Top Bar Compacta e Limpa**:
  - Marca minimalista à esquerda, botão de busca rápida, botão de adicionar pasta/mídia local e atalho de instalação PWA/APK.
- **Modais e Fichas em Estilo Bottom Sheet**:
  - Detalhes de filmes e séries, seletor de episódios e configurações abrem como folhas inferiores deslizantes suaves com cantos arredondados (`rounded-t-3xl`) e fecho fácil por deslize ou toque no fundo.
- **Player Mobile Otimizado**:
  - Controles em tela cheia com bloqueio de orientação opcional, botões de retroceder/avançar 10s bem espaçados para o polegar e seletor de faixas de áudio/legendas.

### B. Navegação Desktop Fluida
- **Hero Banner Panorâmico**: Destaque imersivo com reprodução de trailer ou arte de fundo em alta resolução, gradiente cinematográfico e botões de ação imediata ("Assistir", "Mais Informações").
- **Carrosséis Horizontais de Alta Performance**: Linhas categorizadas ("Continuar Assistindo", "Filmes Recentes", "Séries Adicionadas", "Canais Favoritos") com paginação contínua e rolagem por inércia sem travamentos.
- **Zero-Pill & Tipografia Cinematográfica**:
  - Títulos elegantes com bom contraste, metadados limpos separados por pontos sutis (`·`), sem cápsulas artificiais ou poluição visual.
  - Paleta escura consistente (`#141414`, `#1f1f1f`, `#e5e5e5`) com destaque pontual vermelho cinematográfico (`#E50914`).

---

## 3. Principais Decisões Técnicas e Arquitetura

### Decisão 1: Dual-Mode Runtime (Web Standalone + Capacitor Android APK)
- **Abordagem**: A base de código React + TypeScript + Vite operará em modo dual:
  1. No navegador (GitHub Pages / PWA / Servidor local): utiliza File System Access API para ler pastas do disco e APIs do navegador.
  2. No Android (Capacitor APK): utiliza os plugins nativos do Capacitor para acesso ao armazenamento interno/pastas do Android, mantendo os mesmos componentes de interface.
- **Por quê**: Permite gerar tanto o APK pronto para instalar no smartphone quanto o site estático no GitHub Pages a partir do mesmo repositório sem duplicação de código.

### Decisão 2: Persistência Local com Zero Custos de Banco de Dados
- **Abordagem**: Implementação de um repositório cliente baseado em **IndexedDB** (`idb-keyval` ou wrapper nativo IndexedDB) para armazenar:
  - Metadados dos vídeos catalogados (títulos, sinopses, capas em base64/blob, duração).
  - Handles de permissão de pastas locais (para reabertura sem precisar selecionar a pasta novamente).
  - Histórico de reprodução e marcação de tempo (para continuar de onde parou).
  - Listas e canais favoritos de IPTV.
- **Por quê**: Cumpre integralmente a diretriz de poupar o banco de dados e evitar estouro de cotas, tornando a aplicação independente de conexão com servidores externos para sua coleção local.

### Decisão 3: Pipelines de CI/CD via GitHub Actions
- **Workflow 1: `deploy-gh-pages.yml`**: Compila os assets estáticos via Vite e publica automaticamente na branch `gh-pages` com base de caminho configurada (`/`).
- **Workflow 2: `build-apk.yml`**: Configura o ambiente Java/Android SDK no GitHub Actions, executa `npx cap sync android` e `./gradlew assembleDebug` / `assembleRelease`, disponibilizando o arquivo `.apk` pronto para download como Artifact do GitHub ou Release.

---

## 4. Arquitetura do Sistema e Fluxo de Dados

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CineLocal Universal App                         │
│                                                                        │
│  ┌───────────────────────┐                  ┌───────────────────────┐  │
│  │    Android App (APK)  │                  │  Web / PWA (Browser)  │  │
│  │   (Capacitor Runtime) │                  │ (GitHub Pages / Local)│  │
│  └───────────┬───────────┘                  └───────────┬───────────┘  │
│              │                                          │              │
│              ▼                                          ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Camada de Apresentação                        │  │
│  │  - Desktop: Top Bar, Hero Banner, Carrosséis Horizontais         │  │
│  │  - Mobile: Top Bar Compacta, Bottom Navigation Tab Bar (48px)    │  │
│  │  - Modais: Bottom Sheet Responsiva para Detalhes e Ajustes       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Núcleo de Mídia & Player                     │  │
│  │  - HTML5 Video Engine + HLS.js (IPTV / M3U8 Streaming)           │  │
│  │  - WebTorrent Client (Streaming P2P direto no app)               │  │
│  │  - Gerenciador de Legendas (.vtt / .srt local e online gratuita) │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Armazenamento Local e Persistência                  │  │
│  │  - IndexedDB (Catálogo, Histórico, Favoritos, Handles de Pastas) │  │
│  │  - File System Access / Capacitor Filesystem (Vídeos do Aparelho)│  │
│  │  - LocalStorage (Preferências de volume, tema e idioma)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Mapeamento de Componentes e Telas

1. **`BottomNav.tsx` (Novo)**:
   - Fixado na base em telas móveis (`md:hidden fixed bottom-0 left-0 right-0 z-40`).
   - Abas: `Início`, `Filmes`, `Séries`, `TV ao Vivo`, `Torrents`.
   - Área tátil de 48px, ícones lúcidos com rótulos legíveis e compensação ótica para tela escura.

2. **`Navbar.tsx` (Ajustado)**:
   - Em desktop: Contrato de 3 zonas com links de categorias, busca e ações.
   - Em mobile: Wordmark limpo, botão de busca e botão rápido de adicionar pasta/PWA.

3. **`VideoPlayer.tsx` & `TorrentPlayer.tsx` & `IptvPlayerModal.tsx`**:
   - Player responsivo unificado adaptável ao toque (toque duplo para saltar 10s, controles autohide, suporte a tela cheia nativa no Android).

4. **`localMediaService.ts` & `libraryStore.ts`**:
   - Abstração que faz leitura direta de arquivos locais usando File System Access API / File API em modo estático/PWA e Capacitor no Android, salvando o catálogo em IndexedDB local sem custos de banco de dados na nuvem.

5. **Configurações de Build Android & GitHub Actions**:
   - `capacitor.config.ts`: ID de aplicativo Android (`com.cinelocal.app`), nome e configurações de webDir (`dist`).
   - `android/`: Estrutura do projeto Android com permissões de armazenamento e internet no `AndroidManifest.xml`.
   - `.github/workflows/deploy-gh-pages.yml`: Deploy automatizado para GitHub Pages.
   - `.github/workflows/build-apk.yml`: Compilação contínua do APK para download.
