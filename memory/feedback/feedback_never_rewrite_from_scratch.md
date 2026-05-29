---
name: Nunca reescrever componentes do zero
description: Componentes SOTA nao devem ser reescritos do zero para adicionar features. Sempre integrar no existente.
type: feedback
---

Nunca reescrever componentes existentes do zero para adicionar uma feature. Sempre integrar no codigo existente.

**Why:** Na sessao 20260320, alguem (provavelmente Gemini ou agente automatizado) reescreveu MasterSimulator.tsx de 302 linhas (10 componentes, hooks, cenarios, tabs, lazy loading) para 53 linhas (4 componentes novos que nem compilavam) tentando adicionar PKO Value. O resultado: simulador completo destruido, 4 componentes fantasma com bug de pkoValue undefined, regressao total. Tambem degradaram: layout.tsx (50->18, perdeu Header/Footer/FontAwesome/SEO), page.tsx home (278->30, perdeu landing page), tools/simulador (42->9), biblioteca (156->86).

**How to apply:** Qualquer feature nova deve ser adicionada como diff incremental ao componente existente. Se o diff for grande demais, criar um branch. Nunca substituir arquivo inteiro por versao simplificada.
