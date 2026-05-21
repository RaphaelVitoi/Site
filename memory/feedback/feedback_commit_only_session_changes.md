---
name: Commitar apenas mudancas da sessao atual
description: Separar mudancas proprias de pre-existentes. Nunca git add -A cegamente.
type: feedback
---

Quando o working tree tem centenas de mudancas de sessoes anteriores, NUNCA fazer git add -A cegamente no primeiro commit. Stage apenas os arquivos modificados na sessao atual.

**Why:** Sessao P2 tinha 334 mudancas pendentes. O primeiro commit (P2 Higiene) incluiu apenas 14 arquivos da sessao. O segundo (sincronizacao) so foi feito apos verificar que todas as 320 restantes eram legitimas.

**How to apply:** Primeiro commit = apenas o que voce tocou. Segundo commit = o resto, apos verificacao rapida (categorizar por tipo: delecoes, modificacoes, untracked, checar duplicatas vazias).
