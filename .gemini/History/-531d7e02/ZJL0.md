# 📐 SPEC SOTA: Arquitetura de Roteamento (Next.js 16) e Banco de Dados (Prisma/SQLite)

> **Autor:** @planner (Revisado por CHICO)
> **Status:** Blindado e Pronto para o @implementor
> **Objetivo:** Estabelecer a fundação do Produto (Blog/Cursos) usando App Router e persistência em Disco/Turso (SQLite).

---

## 1. Estrutura SOTA de Roteamento (App Router)

A organização de diretórios dentro de `frontend/src/app/` abraça o paradigma Server-First do Next.js 16.

### 1.1. Árvore de Diretórios (Rotas)

- `/` (Home): `frontend/src/app/page.tsx` -> Interface principal, hub de conteúdo, manifesto estético.
- `/blog`: `frontend/src/app/blog/page.tsx` -> Feed de artigos (Lógica de paginação no servidor).
- `/blog/[slug]`: `frontend/src/app/blog/[slug]/page.tsx` -> O artigo individual renderizado.
- `/categorias`: `frontend/src/app/categorias/page.tsx` -> Índice semântico de categorias.
- `/categorias/[slug]`: `frontend/src/app/categorias/[slug]/page.tsx` -> Artigos filtrados por categoria específica.

### 1.2. Módulos e Componentes (Isolamento)

A pasta `frontend/src/components/` será a biblioteca de Lego da nossa UI:

- **Layout:** `Header.tsx`, `Footer.tsx`, `Navigation.tsx`
- **Cards:** `ArticleCard.tsx`, `ProductCard.tsx`
- **UI/UX:** `CyberButton.tsx`, `GlowEffect.tsx`

---

## 2. A Camada de Dados (Prisma + SQLite)

> **Atenção @implementor:** Nosso motor local e produtivo opera sobre SQLite, e não PostgreSQL. Siga este schema rigidamente.

**Arquivo Alvo:** `frontend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // aponta para "file:./dev.db" localmente
}

model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  content     String
  published   Boolean   @default(false)
  readTime    Int?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relacionamentos em SQLite exigem tabelas explícitas, mas para MVP 1.0 (State of the Art) usaremos strings separadas por vírgula se precisarmos de tags simples.
  tags        String?   // Ex: "poker,mindset,teoria-dos-jogos"
}
```

---

## 3. Plano de Execução para o @implementor

## 3. Plano de Forja (God Mode SOTA)

> **Status Atualizado:** A instalação do Prisma já foi realizada nativamente pelo usuário. O banco SQLite já está operante.
> **Estado Temporal Sincronizado:** O ecossistema NÃO é Greenfield. O Prisma já está instalado e a infraestrutura básica já existe. O foco é a materialização das features.

1.  ~~**Executar Comando:** `cd frontend ; npm install prisma @prisma/client`~~ (CONCLUÍDO)
2.  ~~**Executar Comando:** `cd frontend ; npx prisma init`~~ (CONCLUÍDO)
3.  **Verificar Arquivo:** Conferir se o `frontend/prisma/schema.prisma` possui o schema exato listado acima. Se faltar algo, sobrescreva via God Mode.
4.  **Materializar Arquivos:** Criar a estrutura de rotas vazias no NextJS.
5.  **Sincronização de Schema:** Verificar se o arquivo `frontend/prisma/schema.prisma` reflete o modelo de `Post` listado acima. Atualize-o via God Mode se houver divergências.
6.  **Sincronização de Banco:** Executar comando `cd frontend ; npx prisma db push` para garantir que o SQLite local espelha as últimas mudanças do schema.
7.  **Materializar Rotas SOTA:** Criar a estrutura de pastas e os arquivos `.tsx` vazios para as rotas do Blog mencionadas na Seção 1.1.
