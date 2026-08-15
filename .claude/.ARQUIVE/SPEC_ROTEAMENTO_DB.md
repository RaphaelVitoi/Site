# SPEC: Arquitetura de Roteamento e Banco de Dados - Blog NextJS

> **Autor:** @planner (via IDE Assistant)
> **Status:** Pronto para Execucao via `nexus-bridge`
> **Objetivo:** Definir a estrutura de pastas, rotas e o schema do banco de dados para a aplicacao do blog.

---

## 1. Arquitetura de Roteamento (Next.js App Router)

A estrutura de pastas dentro de `frontend/src/app/` seguira o padrao do App Router para criar as rotas de forma intuitiva.

### 1.1. Rotas Publicas

*   **`/(home)`:**
    *   **Arquivo:** `frontend/src/app/page.tsx`
*   **`/blog`:**
    *   **Arquivo:** `frontend/src/app/blog/page.tsx`
*   **`/blog/[slug]`:**
    *   **Arquivo:** `frontend/src/app/blog/[slug]/page.tsx`
*   **`/categorias`:**
    *   **Arquivo:** `frontend/src/app/categorias/page.tsx`
*   **`/categorias/[slug]`:**
    *   **Arquivo:** `frontend/src/app/categorias/[slug]/page.tsx`

### 1.2. Componentes Reutilizaveis

Os componentes devem ser criados na pasta `frontend/src/components/`.
*   `Header.tsx`, `Footer.tsx`, `ArticleCard.tsx`, `ArticleHeader.tsx`.

---

## 2. Modelagem do Banco de Dados (Prisma ORM)

**Arquivo a ser materializado:** `frontend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  content     String
  published   Boolean   @default(false)
  readTime    Int?      // Tempo de leitura em minutos
  tags        String[]  // Array de tags suportado nativamente pelo PostgreSQL
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## 3. Plano de Execucao para o @implementor

1.  **Executar Comando:** `cd frontend && npm install prisma @prisma/client`
2.  **Executar Comando:** `cd frontend && npx prisma init`
3.  **Materializar Arquivos:** Criar o arquivo `frontend/prisma/schema.prisma` com o schema acima.
4.  **Materializar Arquivos:** Criar a estrutura de rotas vazias no NextJS.
