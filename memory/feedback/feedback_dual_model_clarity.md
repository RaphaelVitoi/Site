---
name: Editar com clareza para dupla Claude + Gemini
description: Ao editar docs/codigo, lembrar que Gemini Pro tambem precisa entender as mudancas. Manter clareza maxima.
type: feedback
---

Claude Opus e Gemini Pro (ambas Pro tier) trabalham juntas no sistema como dupla dinamica (codinome CHICO). Ao fazer edicoes em qualquer arquivo, lembrar que o outro modelo precisa entender o que foi feito e por que.

**Why:** Raphael alterna entre os dois modelos continuamente. Edicoes opacas ou com contexto implicito quebram a continuidade do outro modelo.

**How to apply:** Ao editar docs do sistema (.cerebro/, GLOBAL_INSTRUCTIONS, agents, etc.), usar linguagem auto-explicativa. Nao assumir que o proximo leitor tem o mesmo contexto. Preferir editar documentos de forma que sejam compreensíveis standalone, sem depender de contexto conversacional.
