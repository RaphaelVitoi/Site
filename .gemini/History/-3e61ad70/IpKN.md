# SPECIFICATION: A Membrana Inteligente (Smart CLI v2.0)
# SPECIFICATION: Landing Page Unificada (Nexus Central)
> **Autor:** @planner
> **Origem:** Relatório de Inovação `@maverick` (init_cli_innovation.ps1)
> **Alvo Primário:** `do.ps1`
> **Alinhamento HRP:** A interface CLI deve atuar como injetora primária de intenção, compreendendo o estado atual do ecossistema e roteando as entradas com precisão cirúrgica.
> **Alvo Primário:** `src/app/page.tsx` e `src/lib/prisma.ts`
> **Alinhamento HRP:** A Home (Nexus) deve ser o ponto de convergência de todo o tráfego. Ela não deve conter conteúdo extenso, mas sim atuar como um roteador de alta conversão para os Laboratórios (ICM e Psicologia) e consumir os dados mais recentes do nosso Prisma DB.

## 1. Visão Geral e Teleologia
Atualmente, o script `do.ps1` atua como um duto passivo, inserindo tarefas na malha (via `Agent-TaskManager.psm1`) sem qualificação prévia de roteamento. O objetivo desta evolução é transformar o `do.ps1` em uma "Membrana Semipermeável", capaz de identificar a intenção do usuário no momento do input através de heurísticas de Regex, sugerindo o agente ideal para tratar a demanda e reduzindo a entropia na fila de tarefas.
Atualmente, o arquivo `src/app/page.tsx` abriga um texto longo residual ("A Fenomenologia da Incerteza..."). O objetivo desta SPEC é higienizar a página inicial, transformando-a em um Dashboard Público / Landing Page que consolida o acesso às ferramentas criadas e exibe as últimas publicações do banco de dados real.

## 2. Requisitos de Arquitetura (Heurística de Baixa Latência)
Para garantir latência zero e manter a fluidez implacável no terminal:
- **Ausência de IA Pesada na Membrana:** O roteamento deve ocorrer através de um mapa de intenções (Dicionário/Hashtable em PowerShell) contendo o mapeamento entre Agentes e Palavras-chave (Regex).
- **Fallback / Override Explícito:** Se a string de input iniciar diretamente com o handle do agente (ex: `@implementor cria a interface...`), a heurística deve ser evitada e o override absoluto acionado.
- **Isolamento de Modificadores:** A flag `-Force` deve ser honrada integralmente. Se utilizada, o sistema assume a sua melhor suposição de agente e suprime qualquer confirmação manual (vital para scripts automatizados ou fluxos rápidos).
## 2. Requisitos de Arquitetura (Server-First & Prisma)
- **Instância do Prisma:** A aplicação precisa de um Singleton do Prisma Client (`src/lib/prisma.ts`) para evitar vazamento de conexões em ambiente de desenvolvimento (Next.js hot-reloading).
- **Server Component (Zero JS Shipped):** A Home (`page.tsx`) deve continuar sendo um Server Component puro. Ela fará uma query assíncrona ao banco (`prisma.post.findMany({ take: 3, orderBy: { createdAt: 'desc' } })`) para buscar as publicações mais recentes.
- **Limpeza de Entropia:** O texto estático longo que está lá hoje deve ser removido, pois o conteúdo textual completo agora pertence ao hub dinâmico de `/psicologia-hs`.

## 3. O Córtex Heurístico (Matriz de Intenção)
A heurística será baseada em um algoritmo de pontuação simples. A string de entrada será testada contra expressões regulares (Case Insensitive). O agente que obtiver o maior número de ocorrências na frase "ganha" a sugestão de roteamento.
## 3. Estrutura de Interface (Bifurcação e Gamificação)
A nova Home será dividida em 3 sessões de impacto:

*Mapeamento Base Sugerido (`$IntentMap`):*
- `@implementor`: `(cria|codific|implement|bug|fix|erro|script|código|js|html|css|layout|design|ui|ux)`
- `@pesquisador`: `(pesquisa|busca|encontr|estado da arte|compar|lista)`
- `@planner`: `(planej|estrutur|spec|prd|roadmap|arquitetur)`
- `@auditor`: `(audit|confer|revis|compliance|check)`
- `@securitychief`: `(seguran|lgpd|vazamento|permiss|acesso)`
- `@maverick`: `(ideia|inova|estratégia|sentinela|invent|melhorar)`
1. **Hero Section (Acima da Dobra):**
   - Título impactante (ex: "O Edge Mudou de Lugar").
   - Subtítulo: "A harmonia entre a frieza do código binário e a densidade da psicologia humana."
   
2. **Os Dois Laboratórios (Bifurcação do Funil):**
   - Um Grid de 2 colunas contendo Cards gigantes.
   - **Card Esquerdo (Frio/Matemático):** Tons de Ciano/Esmeralda. Aponta para `/tools/icm` (Simulador de Malmuth-Harville).
   - **Card Direito (Quente/Humano):** Tons de Magenta/Fúcsia. Aponta para `/psicologia-hs` (Análise Epistêmica).
   - *Gamificação:* Efeito `glass-panel` com `hover:-translate-y-1` para induzir o clique.

## 4. Fluxo de Execução e Estado (UX/UI do Terminal)
3. **Feed de Últimos Protocolos (A Ingestão de Dados):**
   - Módulo inferior que mapeia os 3 artigos recentes extraídos do Prisma.
   - Exibição limpa em lista ou mini-cards, validando visualmente que o banco de dados está online e injetando conteúdo fresco no SEO da página inicial.

**Fase 1: Ingestão de Dados**
- O script recebe o `$InputString`.
- Se estiver vazio, entra em modo de escuta interativo invocando: `[NEXUS] Awaiting Directive >`.
## 4. O Roteamento Temporal (Consciência do Passado e Futuro)
- **Passado:** Respeitar integralmente o `globals.css` que o Raphael já estabilizou. Usar `animate-fade-up` e classes semânticas já existentes.
- **Futuro:** A arquitetura desta Home deve permitir que novos módulos (ex: Hand2Note Parser, Calculadora FGS) sejam adicionados à Vitrine sem quebrar o CSS Grid.

**Fase 2: Análise de Intenção (Scoring Engine)**
- O sistema de *Resolve-Intent* aplica as expressões regulares.
- Invoca feedback sonoro simulando escaneamento digital (Beeps curtos, se suportados pelo SO).

**Fase 3: A Negociação (Handshake)**
- Se um agente for detectado: O terminal exibe na cor Cyano a suposição.
  `[PATTERN MATCH] Intent detected: '@planner' [OK]. Confirm? [Y/n]`
- Se o usuário responder `Y` (ou pressionar Enter vazio): O agente detectado é confirmado.
- Se o usuário responder `n` (ou `N`): O sistema solicita entrada manual: `[MANUAL OVERRIDE] Enter agent ID >`
- Se a flag `-Force` foi injetada: Confirma automaticamente sem exibir prompt.

**Fase 4: Injeção Segura na Fila**
- O `do.ps1` constrói o objeto hash da Task com status `pending`.
- Invoca a função de Kernel `Add-AgentTask` e consolida os dados na base JSON.

## 5. Gamificação Visceral (Feedback Sensorial)
Honrando o princípio de "Transformar dados em sensação" (`GLOBAL_INSTRUCTIONS.md`), o CLI fará uso do método `[console]::Beep()` com frequências modulares:
- **'Boot':** Inicialização da Membrana.
- **'Scan':** Computando a heurística.
- **'Match':** Quando a heurística encontra um agente.
- **'Success':** Confirmação atômica da tarefa na fila.
A paleta de cores exigida: `Cyan`, `Magenta`, `DarkGray`, e `Green`.

## 6. Passos para a Implementação (Roadmap para o @implementor)
1. **Refatoração do Setup:** Preservar a importação segura do Kernel (`Agent-TaskManager.psm1`).
2. **Implementação de Synonyms:** Opcionalmente criar a lógica para carregar um `synonyms.psd1` (dicionário externo) se ele existir, para não inchar o `do.ps1` no futuro.
3. **Criação do Engine:** Desenvolver a função `Resolve-Intent`.
4. **UI do Terminal:** Ajustar as saídas (Write-Host) e os inputs (Read-Host) com a formatação Cyber/Estética descrita.
5. **Orquestração de Handshake:** Escrever as ramificações `if/else` que ligam a heurística ao `-Force` ou ao input humano.
6. **Injeção de Easter Eggs (opcional):** Inserir de 5 a 10% de chance de exibição de um aforismo do `@maverick` no cabeçalho do console.
## 5. Ordem de Implementação (Para o @implementor)
1. **Setup do Prisma:** Criar o arquivo `src/lib/prisma.ts` exportando o Prisma Client.
2. **Refatoração da Home:** Apagar o conteúdo estático do `src/app/page.tsx` preservando apenas o "Self-Awareness Header" (HRP V2).
3. **Construção da UI:** Criar o novo layout (Hero + Vitrine de Laboratórios).
4. **Conexão com Banco:** Importar o `prisma` na Home, realizar o fetch e iterar sobre a nova seção de "Últimos Protocolos".