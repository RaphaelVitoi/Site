# Guia de Deploy SOTA (Next.js 16 / React 19)

**Objetivo:** Publicar a versao de producao do ecossistema e laboratorios ICM.
**Stack:** Next.js (App Router) + Tailwind CSS + TypeScript.

---

## Opcao A: Vercel (Recomendado - SOTA Absoluto)

*Ideal para otimizacao nativa do Next.js (Server Components, Edge API Routes).*

1. **Inicialize o Git (se ainda nao fez):**

    ```powershell
    git init
    git add .
    git commit -m "feat: initial SOTA release"
    ```

2. **Crie o Repositorio no GitHub:**
    * Va em github.new e crie o repositorio (ex: `omnimaster-platform`).

3. **Conecte e Suba:**

    ```powershell
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/omnimaster-platform.git
    git push -u origin main
    ```

4. **Ative no Vercel:**
    * Acesse vercel.com e importe o repositorio do GitHub.
    * O Vercel detectara o Next.js automaticamente e fara o build.
    * Configure as variaveis de ambiente, se houver (ex: chaves do Prisma/DB se usar SSR).

---

## Opcao B: Netlify / Local Build (Alternativa SOTA)

*Caso precise hospedar em outras plataformas.*

1. Acesse netlify.com e importe o repositorio.
2. Build command: `npm run build` ou `pnpm build`.
3. Publish directory: `.next` (ou equivalente no plugin Next.js).

---

## Checklist Pos-Deploy

* [ ] Verificar carregamento do Tailwind CSS.
* [ ] Testar rotas Edge/API (se aplicavel).
* [ ] Validar meta-tags e Open Graph (SEO dinamico Next.js).
* [ ] Monitorar logs de runtime no dashboard do Vercel.
