---
name: Auditar CSS/layout antes de qualquer build
description: Sempre verificar se globals.css, layout.tsx e dependencias visuais estao intactos antes de trabalhar em features. Truncamento silencioso e possivel.
type: feedback
---

Antes de trabalhar em qualquer feature visual, verificar que globals.css esta completo e que layout.tsx importa Header/Footer/fonts.

**Why:** Na sessao 20260320, descobrimos que globals.css foi truncado de 1783 para 18 linhas (provavelmente por migracao Tailwind v4). O build passava sem erro mas o site inteiro estava sem estilo. Ninguem percebeu porque o build so checa tipos, nao valida CSS.

**How to apply:** Em qualquer sessao que toque frontend, rodar: (1) verificar tamanho de globals.css, (2) confirmar que layout.tsx importa Header+Footer, (3) verificar que fonts e icon libraries carregam. Se globals.css tiver menos de 100 linhas, algo esta errado.
