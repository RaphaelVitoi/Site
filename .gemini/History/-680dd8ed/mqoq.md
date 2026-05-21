# 🚀 GUIA DE DEPLOY SOTA (Next.js 16 + Prisma + SQLite)

> **Mantenedor:** CHICO | **Data:** 2026-03-16
> **Status:** Elevado ao Estado da Arte
> **Ecossistema Core:** Next.js 16 (App Router), React 19, Prisma.

---

## ⚠️ 1. A AVALIAÇÃO DA ENTROPIA (O Paradoxo do SQLite)

O modelo de "arrastar arquivos" tornou-se obsoleto no instante em que adotamos SSR (Server-Side Rendering) e Banco de Dados (Prisma). Ambientes serverless tradicionais (Vercel/Netlify) **destroem o sistema de arquivos a cada execução**, apagando seu arquivo `.sqlite` local no processo.

A implantação agora exige maturidade arquitetural. Abaixo estão os três únicos caminhos viáveis para o nosso ecossistema vivo.

---

## 2. AS TRÊS TRILHAS DO ESTADO DA ARTE

### Trilha Alpha: O Padrão Ouro Serverless (Vercel + Turso)

_A rota de menor fricção operacional. O Next.js vai para a Vercel, o banco vai para a Borda._

- **A Engenharia:** Mantemos o Prisma, mas abandonamos o arquivo local em produção. Usaremos o **Turso** (SQLite serverless na edge).
- **Passos:**
  1. Crie o banco gratuitamente no Turso CLI: `turso db create poker-db`.
  2. Mude a variável no `.env` da produção: `DATABASE_URL="libsql://poker-db-...turso.io"` (com `TURSO_AUTH_TOKEN`).
  3. Importe o repositório do GitHub na Vercel.
  4. Todo `git push main` gera um deploy contínuo (CI/CD) sem fricção.

### Trilha Omega: Soberania Absoluta (VPS + Coolify)

_A infraestrutura "God Mode". Custo fixo, zero censura de limites de Vercel e persistência em disco físico._

- **A Engenharia:** Contratar um servidor Linux bruto (Hetzner, DigitalOcean) e instalar o **Coolify** (a Vercel open-source).
- **Vantagem SOTA:** Como a máquina é sua, o Next.js roda como um servidor Node longo (`npm start`), e **o arquivo local SQLite não será deletado**, operando nativamente com latência de zero milissegundos localmente.

### Trilha Delta: O Degrau Puramente Estático (GitHub Pages / Cloudflare)

_Se (e somente se) decidirmos remover temporariamente o Banco de Dados e as rotas de API da aplicação._

- **A Engenharia:** No `next.config.js`, defina `output: 'export'`.
- O Next.js vai gerar arquivos HTML nativos. Perde-se a interatividade profunda de servidor e o banco de dados dinâmico, mas hospeda-se de graça em qualquer lugar sem dor de cabeça de provisionamento.

---

## 3. CHECKLIST SOTA DE INTEGRIDADE PRÉ-DEPLOY (@auditor)

- [ ] **Cache de Cálculo Pesado:** As rotas que processam Teoria dos Jogos e a API da calculadora estão envolvidas no `unstable_cache` ou em SSR estático? (Reduz a conta computacional).
- [ ] **Environment Isolado:** `.env.local` está corretamente isolado no `.gitignore`?
- [ ] **Bundle Size Analisado:** `npm run build` passa sem alertas de pacotes gigantes (como bibliotecas gráficas pesadas mal importadas)?
- [ ] **SSR de SEO:** As meta-tags geradas pelo `@seo` estão preenchidas no `layout.tsx` pai para o Google devorar?

> _Aplicações do Estado da Arte não dependem de mãos humanas para chegar ao mundo. O deploy final deve ser um reflexo magnético do `git push`._
