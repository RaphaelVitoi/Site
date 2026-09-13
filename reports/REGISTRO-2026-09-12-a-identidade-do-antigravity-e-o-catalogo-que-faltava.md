---
id: registro-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T00:52:14-03:00'
atualizado_em: '2026-09-13T00:52:14-03:00'
classes: [interno, medido, proveniencia, governanca]
caminhos:
  - data/agent_identities.json
  - .husky/commit-msg
  - tests/test_hook_commit_msg.py
pendencias_resolvidas:
  - pend-2026-09-12-identidade-do-antigravity
verificado:
  - o Tier 0 determinou em 2026-09-12 que o Antigravity CLI conduz o Gemini 3.8 Flash
  - Gemini 3.8 Flash <noreply@google.com> ja e a forma dominante -- 21 commits no historico
  - o historico acumula VINTE grafias de autor distintas para cerca de cinco agentes
  - entre elas Chico SOTA v8.0 GOLD, que e o grupo no campo do autor individual
  - entre elas tambem Claude e Claude Opus 5, Codex e Codex GPT-5 e Codex [Tier 1.B], Gemini 3.8 Flash e Gemini 3.8 Flash High
  - um commit usou literalmente antigravity@gemini-3.8-flash como NOME de autor
  - o portao avisa nas duas grafias que existem de verdade no historico -- exercido nas duas
  - o portao nao avisa em nenhum dos sete nomes canonicos -- exercido nos sete
  - tests/test_hook_commit_msg.py -- 41 aprovados, contra 29 antes
nao_verificado:
  - o comportamento sob o Antigravity CLI de verdade; o hook so foi exercido por sh com ambiente controlado
  - se o CLI passa a identidade sozinho ou se precisa de instrucao no veiculo
revisoes_de_ancora:
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: ['.husky/commit-msg']
    parecer: Aquele handoff ancora o commit-msg por causa da identidade de autoria, e este commit acrescenta o aviso de catalogo depois das regras que ele descreve. Nenhuma delas mudou.
  - registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
    caminhos: ['.husky/commit-msg', 'tests/test_hook_commit_msg.py']
    parecer: E o registro do portao de coerencia, e o que ele afirma segue exato -- bloqueia divergencia, avisa ausencia. O catalogo e uma terceira checagem, tambem em aviso, e os 29 guards dele continuam passando entre os 41.
config_medida:
  fonte_unica: data/agent_identities.json
  identidades_canonicas: 7
  grafias_no_historico: 20
  efeito_no_portao: aviso, nunca bloqueio
---

# A identidade do Antigravity, e o catálogo que faltava

## 1. A determinação

**O Antigravity CLI conduz o `Gemini 3.8 Flash`** — determinado pelo Tier 0 em
2026-09-12. Veículo `antigravity`, e-mail `noreply@google.com`, forma composta
`antigravity@gemini-3.8-flash` em prosa.

Isso fecha a pendência de prazo mais curto. Ela pedia *"tornar a §7 executável
**ou** dar identidade própria ao Antigravity CLI"*; as duas metades estão feitas —
o portão de coerência, publicado em `deb246c0`, e agora a identidade.

## 2. O que a medição encontrou por baixo

Ao procurar a forma canônica em vez de supô-la, apareceu um problema maior que o
da pendência. O histórico deste repositório tem **vinte grafias de autor** para
cerca de cinco agentes:

| Agente | Grafias medidas |
| :--- | :--- |
| Claude | `Claude Opus 5`, `Claude`, `Claude <raphavitoi@gmail.com>` |
| Codex | `Codex GPT-5`, `Codex`, `Codex [Tier 1.B]`, `Codex SOTA v8.0 GOLD`, `Chat GPT-6 Astra` |
| Gemini | `Gemini 3.8 Flash`, `Gemini 3.8 Flash High`, `antigravity@gemini-3.8-flash` |
| — | **`Chico SOTA v8.0 GOLD`**, e `Chico <chico@sota.nexus>` |

As duas últimas são o **grupo** no campo do autor individual, que a §7 proíbe em
texto — e que nada verificava.

**Por que isso importa além da estética:** variante nova divide o histórico de um
agente em dois nomes, e nenhuma medição por autor volta a fechar. Foi o que já
aconteceu hoje, quando contar commits por nome exigiu saber de antemão que
`Codex GPT-5` às vezes era o Gemini.

## 3. A forma, e por que é catálogo e não tabela em prosa

`data/agent_identities.json` é a **fonte única**: nome de autor, e-mail, veículo e
modelo, mais uma lista `nunca` com o que não pode ocupar o campo. O `CLAUDE.md`
aponta e não copia — a §7 documenta o caso do `AGENTS.md` em que dois dias de
coexistência produziram duas mentiras, e uma tabela de identidades copiada teria
o mesmo destino.

O `commit-msg` lê o catálogo e **avisa** quando o autor não está nele. Avisa e não
bloqueia: identidade nova é legítima, e o remédio é acrescentá-la no mesmo commit.

**A checagem de coerência não alcançava isto**, e vale dizer por quê: ela compara
autor com assinatura, e as duas erram **juntas** quando o condutor escreve a
mesma variante nas duas. Uma fonte externa à mensagem era necessária.

## 4. O defeito que o guard pegou na primeira execução

O `grep` do catálogo estava sem `-F`. Com isso `google-labs-jules[bot]` era lido
como **expressão**, e `[bot]` virava classe de caracteres — casa `b`, `o` ou `t`,
nunca o colchete literal. O bot canônico era avisado como se fosse variante.

É o **mesmo gênero** de defeito que o cabeçalho de `tests/test_hook_commit_msg.py`
documenta desde 2026-08-28, sobre colchetes em POSIX, no mesmo arquivo. Três
semanas depois, no arquivo que narra o caso.

O que mudou é que desta vez havia teste: o guard reprovou na primeira execução, e
o defeito nunca chegou a commit. É exatamente a diferença que aquele cabeçalho
reclamava — *portão cujo verde é o único estado observado não é portão
verificado*.

**Assinatura:** `Claude Opus 5 [Tier 1.B]` — sessão `claude-opus5-site-2026-09-12-preludio`
