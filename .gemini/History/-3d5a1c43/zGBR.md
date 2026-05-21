# SPECIFICATION: Leitura de Protocolo (Página de Artigo Individual)
> **Autor:** @planner
> **Alvo Primário:** `src/app/psicologia-hs/[slug]/page.tsx`
> **Alinhamento HRP:** Consumir um artigo específico do banco de dados baseado na URL dinâmica e apresentá-lo em uma interface de leitura limpa, mantendo o usuário engajado no ecossistema sem distrações.

## 1. Visão Geral e Teleologia
Ao clicar em um "Protocolo" na vitrine de `psicologia-hs`, o usuário será redirecionado para `/psicologia-hs/nome-do-artigo`. Essa página precisa gerar metadados de SEO dinamicamente (para ranqueamento no Google) e renderizar o corpo do texto com altíssima legibilidade, respeitando a paleta estética Dark/Cyber (espectro Fúcsia/Magenta).

## 2. Requisitos de Arquitetura (Dynamic Server Component)
- **Parâmetros Dinâmicos:** A rota `[slug]/page.tsx` receberá o `params.slug` nativamente.
- **Fetch Isolado:** Utilizar o `prisma.post.findUnique({ where: { slug } })` para buscar os dados.
- **Tratamento de Exceções:** Se o artigo não existir, invocar a função `notFound()` do Next.js, que redirecionará para uma página 404 estilizada do projeto.
- **Metadata Dinâmica:** O Next.js requer a exportação de uma função `generateMetadata({ params })` para injetar as tags `<title>` e `<meta name="description">` exclusivas de cada artigo.

## 3. Estrutura de Interface (UX de Leitura)
- **Cabeçalho do Artigo (Hero):** 
  - Título em destaque com a fonte `var(--font-heading)`.
  - Tags, tempo de leitura (fonte `data-mono`) e data de publicação.
- **Corpo do Texto (Prose):**
  - Utilizar a tag nativa `<article className="sales-article">` já estabilizada no seu `globals.css` para garantir que `h2`, `h3`, `p`, e `blockquote` herdem o espaçamento e os filetes em gradiente do layout padrão.
- **Navegação de Retorno:**
  - Um link/botão "← Voltar para Laboratório" no topo da página.

## 4. O Roteamento Temporal (Antevisão)
O corpo do texto virá do banco de dados, possivelmente em formato Markdown no futuro. O `@implementor` deve preparar a injeção do conteúdo via `dangerouslySetInnerHTML` (se for HTML sanitizado) ou acoplar uma biblioteca como `react-markdown` para desenhar o post sem quebrar a segurança (XSS).

## 5. Passos para a Implementação (Para o @implementor)
1. Criar o diretório `src/app/psicologia-hs/[slug]`.
2. Criar o `page.tsx` inserindo o HRP V2.
3. Implementar a query Prisma e a UI de leitura.