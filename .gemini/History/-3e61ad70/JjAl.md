# SPECIFICATION: Landing Page Unificada (Nexus Central)
> **Autor:** @planner
> **Alvo Primário:** `src/app/page.tsx` e `src/lib/prisma.ts`
> **Alinhamento HRP:** A Home (Nexus) deve ser o ponto de convergência de todo o tráfego. Ela não deve conter conteúdo extenso, mas sim atuar como um roteador de alta conversão para os Laboratórios (ICM e Psicologia) e consumir os dados mais recentes do nosso Prisma DB.

## 1. Visão Geral e Teleologia
Atualmente, o arquivo `src/app/page.tsx` abriga um texto longo residual ("A Fenomenologia da Incerteza..."). O objetivo desta SPEC é higienizar a página inicial, transformando-a em um Dashboard Público / Landing Page que consolida o acesso às ferramentas criadas e exibe as últimas publicações do banco de dados real.

## 2. Requisitos de Arquitetura (Server-First & Prisma)
- **Instância do Prisma:** A aplicação precisa de um Singleton do Prisma Client (`src/lib/prisma.ts`) para evitar vazamento de conexões em ambiente de desenvolvimento (Next.js hot-reloading).
- **Server Component (Zero JS Shipped):** A Home (`page.tsx`) deve continuar sendo um Server Component puro. Ela fará uma query assíncrona ao banco (`prisma.post.findMany({ take: 3, orderBy: { createdAt: 'desc' } })`) para buscar as publicações mais recentes.
- **Limpeza de Entropia:** O texto estático longo que está lá hoje deve ser removido, pois o conteúdo textual completo agora pertence ao hub dinâmico de `/psicologia-hs`.

## 3. Estrutura de Interface (Bifurcação e Gamificação)
A nova Home será dividida em 3 sessões de impacto:

1. **Hero Section (Acima da Dobra):**
   - Título impactante (ex: "O Edge Mudou de Lugar").
   - Subtítulo: "A harmonia entre a frieza do código binário e a densidade da psicologia humana."
   
2. **Os Dois Laboratórios (Bifurcação do Funil):**
   - Um Grid de 2 colunas contendo Cards gigantes.
   - **Card Esquerdo (Frio/Matemático):** Tons de Ciano/Esmeralda. Aponta para `/tools/icm` (Simulador de Malmuth-Harville).
   - **Card Direito (Quente/Humano):** Tons de Magenta/Fúcsia. Aponta para `/psicologia-hs` (Análise Epistêmica).
   - *Gamificação:* Efeito `glass-panel` com `hover:-translate-y-1` para induzir o clique.

3. **Feed de Últimos Protocolos (A Ingestão de Dados):**
   - Módulo inferior que mapeia os 3 artigos recentes extraídos do Prisma.
   - Exibição limpa em lista ou mini-cards, validando visualmente que o banco de dados está online e injetando conteúdo fresco no SEO da página inicial.

## 4. O Roteamento Temporal (Consciência do Passado e Futuro)
- **Passado:** Respeitar integralmente o `globals.css` que o Raphael já estabilizou. Usar `animate-fade-up` e classes semânticas já existentes.
- **Futuro:** A arquitetura desta Home deve permitir que novos módulos (ex: Hand2Note Parser, Calculadora FGS) sejam adicionados à Vitrine sem quebrar o CSS Grid.

## 5. Ordem de Implementação (Para o @implementor)
1. **Setup do Prisma:** Criar o arquivo `src/lib/prisma.ts` exportando o Prisma Client.
2. **Refatoração da Home:** Apagar o conteúdo estático do `src/app/page.tsx` preservando apenas o "Self-Awareness Header" (HRP V2).
3. **Construção da UI:** Criar o novo layout (Hero + Vitrine de Laboratórios).
4. **Conexão com Banco:** Importar o `prisma` na Home, realizar o fetch e iterar sobre a nova seção de "Últimos Protocolos".