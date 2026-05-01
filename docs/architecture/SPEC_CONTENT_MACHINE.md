# SPEC: Maquina de Conteudo (Aulas e Roteamento Curativo)

> **Autor:** @architect
> **Status:** Pronto para Execucao (@implementor e @curator)
> **Objetivo:** Materializar as rotas e a renderizacao de Markdown para fechar o loop do EV Loss no Panoptico.

---

## 1. Sincronizacao de Banco de Dados
O modelo `Lesson` foi injetado no `prisma/schema.prisma`.
**Comando de materializacao (Anti-EPERM):**
```powershell
.\do.ps1 -FixEPERM "cd frontend && npx prisma db push"
```

## 2. Motor de Renderizacao (Next.js)

### 2.1 Dependencias
Instalar o parser de Markdown para o frontend:
```powershell
.\do.ps1 -FixEPERM "cd frontend && npm install react-markdown remark-gfm"
```

### 2.2 Topologia de Roteamento (App Router)

*   **`frontend/src/app/aulas/[slug]/page.tsx`**
    *   **Responsabilidade:** Componente Server-Side. Consultar `Lesson` no Prisma via `params.slug`.
    *   **Tratamento de Excecao:** Retornar `notFound()` se o slug inexistir (previne renderizacao vazia).
    *   **Dados:** Passar `markdown_body` para o motor de renderizacao.

*   **`frontend/src/components/MarkdownRenderer.tsx`**
    *   **Responsabilidade:** Receber a string Markdown e aplicar a camada visual (Glassmorphism e Tipografia) definida pelo @curator. Componente cliente se necessitar de hidratacao, ou puro servidor por performance.

## 3. Integracao de Roteamento Curativo (Panoptico)
Os hiperlinks das barras de "Sangria" (EV Loss) no MasterSimulator e Panoptico devem mapear o padrao `/aulas/{tag_do_erro}`. 
O campo `slug` em `Lesson` deve ser populado exatamente com as chaves de taxonomia de erro estruturadas pelo motor matematico.