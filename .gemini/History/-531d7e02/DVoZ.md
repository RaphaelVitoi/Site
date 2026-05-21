# SPEC: Arquitetura de Roteamento e Banco de Dados - Blog NextJS

# 📐 SPEC SOTA: Arquitetura de Roteamento (Next.js 16) e Banco de Dados (Prisma/SQLite)

> **Autor:** @planner (via IDE Assistant)
> **Status:** Pronto para Execução via `nexus-bridge`
> **Objetivo:** Definir a estrutura de pastas, rotas e o schema do banco de dados para a aplicação do blog.
> **Autor:** @planner (Revisado por CHICO)
> **Status:** Blindado e Pronto para o @implementor
> **Objetivo:** Estabelecer a fundação do Produto (Blog/Cursos) usando App Router e persistência em Disco/Turso (SQLite).

---

## 1. Arquitetura de Roteamento (Next.js App Router)

## 1. Estrutura SOTA de Roteamento (App Router)

A estrutura de pastas dentro de `frontend/src/app/` seguirá o padrão do App Router para criar as rotas de forma intuitiva.
A organização de diretórios dentro de `frontend/src/app/` abraça o paradigma Server-First do Next.js 16.

### 1.1. Rotas Públicas

### 1.1. Árvore de Diretórios (Rotas)

- **`/(home)`:**
  - **Arquivo:** `frontend/src/app/page.tsx`
- **`/blog`:**
  - **Arquivo:** `frontend/src/app/blog/page.tsx`
- **`/blog/[slug]`:**
  - **Arquivo:** `frontend/src/app/blog/[slug]/page.tsx`
- **`/categorias`:**
  - **Arquivo:** `frontend/src/app/categorias/page.tsx`
- **`/categorias/[slug]`:**
  - **Arquivo:** `frontend/src/app/categorias/[slug]/page.tsx`
- `/` (Home): `frontend/src/app/page.tsx` -> Interface principal, hub de conteúdo, manifesto estético.
- `/blog`: `frontend/src/app/blog/page.tsx` -> Feed de artigos (Lógica de paginação no servidor).
- `/blog/[slug]`: `frontend/src/app/blog/[slug]/page.tsx` -> O artigo individual renderizado.
- `/categorias`: `frontend/src/app/categorias/page.tsx` -> Índice semântico de categorias.
- `/categorias/[slug]`: `frontend/src/app/categorias/[slug]/page.tsx` -> Artigos filtrados por categoria específica.

### 1.2. Componentes Reutilizáveis

### 1.2. Módulos e Componentes (Isolamento)

Os componentes devem ser criados na pasta `frontend/src/components/`.

- `Header.tsx`, `Footer.tsx`, `ArticleCard.tsx`, `ArticleHeader.tsx`.
  A pasta `frontend/src/components/` será a biblioteca de Lego da nossa UI:
- **Layout:** `Header.tsx`, `Footer.tsx`, `Navigation.tsx`
- **Cards:** `ArticleCard.tsx`, `ProductCard.tsx`
- **UI/UX:** `CyberButton.tsx`, `GlowEffect.tsx`

---

## 2. Modelagem do Banco de Dados (Prisma ORM)

## 2. A Camada de Dados (Prisma + SQLite)

**Arquivo a ser materializado:** `frontend/prisma/schema.prisma`

> **Atenção @implementor:** Nosso motor local e produtivo opera sobre SQLite, e não PostgreSQL. Siga este schema rigidamente.

**Arquivo Alvo:** `frontend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  provider = "sqlite"
  url      = env("DATABASE_URL") // aponta para "file:./dev.db" localmente
}

model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  content     String
  published   Boolean   @default(false)
  readTime    Int?      // Tempo de leitura em minutos
  tags        String[]  // Array de tags suportado nativamente pelo PostgreSQL
  readTime    Int?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relacionamentos em SQLite exigem tabelas explícitas, mas para MVP 1.0 (State of the Art) usaremos strings separadas por vírgula se precisarmos de tags simples.
  tags        String?   // Ex: "poker,mindset,teoria-dos-jogos"
}
```

---

## 3. Plano de Execução para o @implementor

1.  **Executar Comando:** `cd frontend && npm install prisma @prisma/client`
2.  **Executar Comando:** `cd frontend && npx prisma init`
3.  **Materializar Arquivos:** Criar o arquivo `frontend/prisma/schema.prisma` com o schema acima.
4.  **Materializar Arquivos:** Criar a estrutura de rotas vazias no NextJS.
