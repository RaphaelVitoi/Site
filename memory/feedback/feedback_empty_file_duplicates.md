---
name: Checar arquivos vazios antes de commitar untracked
description: Agentes/Gemini criam arquivos 0-byte como side effect. Sempre verificar com md5sum.
type: feedback
---

Antes de adicionar arquivos untracked ao git, verificar se sao arquivos vazios (0 bytes). Sessoes anteriores com Gemini criaram 8 duplicatas vazias (routing_map.json, system_config.json, queue_manager.py em multiplos locais).

**Why:** Hash d41d8cd98f00b204e9800998ecf8427e = arquivo vazio. Esses fantasmas poluem o repo e confundem.

**How to apply:** Antes de git add em untracked, rodar md5sum nos suspeitos (especialmente se o mesmo nome aparece em 3+ locais). Se hash = d41d8cd98f00b204e9800998ecf8427e, deletar.
