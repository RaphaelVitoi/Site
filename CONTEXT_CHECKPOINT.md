# 🚩 CHECKPOINT DE CONTEXTO (SOTA v3.2)
**DATA:** 31 de março de 2026
**STATUS:** Restaurado / Em Consolidação

## 1. 🔬 Diagnóstico de Ontologia (O que foi salvo)
- **Motor de Perspectiva (ICM):** O `frontend/src/lib/perspectiva.ts` estava com falha lógica na movimentação de stacks (subtração dupla do pote). A base matemática foi **corrigida e validada** contra o motor legado (`OLD_nexus_perspectiva.ts`). O pipeline de 4 camadas está operando em paridade na Layer 2 (Esperança).
- **Backup de Salvaguarda:** Criado snapshot em `.backups\Snapshot_2026-03-31_135725.zip` incluindo o estado atual de frontend e dependências.

## 2. ⚠️ Pendências Críticas (A "Sujeira" do Upgrade)
- **Ativos Faltantes:** O vídeo `public/0309.mp4` mencionado no `page.tsx` sumiu.
- **Rotas Duplicadas:** 
  - `/psicologia-hs/` (Órfã, sem `page.tsx`)
  - `/artigos/psicologia-hs/` (Contém o conteúdo real, mas quebra o `ROUTES.md`).
- **Dívida Técnica Visual:** 
  - Uso massivo de estilos inline em `icm-masterclass/page.tsx` e `page.tsx`.
  - Variável CSS `--color-primary` sendo usada em `.module.css` mas não existe em `globals.css` (deve ser trocada por `--accent-primary`).
- **Componentes "Esvaziados":** `Button.tsx` foi degradado para uma versão sem tipos e simplista (Any type).

## 3. 🛡️ Protocolo de Segurança (Modus Operandi)
- **Monitoramento de Contexto:** Se a janela de contexto começar a exaurir (confusão de paths ou esquecimento de mandatos), pare e gere um novo checkpoint.
- **Não Confiar em Auditorias Cegas:** O arquivo `SOTA_REFACTOR_AUDIT_20260330.md` contém falsos positivos sobre a "limpeza" do sistema. Sempre valide empiricamente.

---

## 🤖 PROMPT DE CONTINUIDADE (Copie e use na próxima sessão)

> "Atue como o Arquiteto SOTA v3.2. Leia o `CONTEXT_CHECKPOINT.md`. 
> 
> **Objetivo Imediato:** Consolidar as rotas conforme o `ROUTES.md`, movendo o conteúdo de `/artigos/psicologia-hs/` para `/psicologia-hs/` e removendo a pasta duplicada. 
> 
> **Objetivo Secundário:** Iniciar a limpeza dos estilos inline nas páginas principais, migrando-os para CSS Modules e corrigindo as referências de `--color-primary` para `--accent-primary`. 
> 
> **Restrição:** Não altere a lógica matemática de `frontend/src/lib/perspectiva.ts` pois ela já foi validada e está em paridade com o motor legado. 
> 
> **Verificação:** Antes de qualquer alteração de layout, verifique se o arquivo `public/0309.mp4` foi restaurado ou se precisamos de um placeholder."
