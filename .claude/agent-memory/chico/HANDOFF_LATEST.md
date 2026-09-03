# HANDOFF LATEST — a camada Anthropic ligada, e o push travado em credencial

**Data:** 2026-09-03 · **Protocolo:** Chico SOTA v8.0 GOLD · **Estado:** commitado, **não empurrado**.
**Sessão:** `claude-opus5-site-2026-09-02-guarda` · **Assinatura individual:** Claude Opus 5 [Tier 1.B]

---

## ⚠ A primeira coisa: o push está bloqueado, e não é seu código

`git push` devolve **403 — "Permission to RaphaelVitoi/Site.git denied"** a
partir de sessão de agente. `rulesets` volta `[]`, o que descarta branch
protection.

**Bloqueia o agente, não o Tier 0.** O repositório é **público**
(`private: false`), então `git ls-remote` responde **sem credencial nenhuma** —
leitura funcionando não prova credencial válida. As duas vias de escrita falham
aqui: o PAT fine-grained do `gh` não escreve, e o SSH não tem chave
(`Permission denied (publickey)`). O Git Credential Manager tem credencial
expirada e **só renova abrindo prompt**, o que uma sessão não-interativa não
permite.

**Num terminal interativo do Tier 0 o `git push` passa**, porque o GCM abre o
navegador. Alternativa permanente, se agentes forem empurrar: conceder
**`Contents: Read and write`** ao fine-grained PAT, ou cadastrar chave SSH.

Não aceitar credencial colada no chat, em nenhuma hipótese.

O remoto está em `a73ba184`. **Três commits locais não publicados:**

```text
f8523a3e  fix(llm): o import que faltava em dfbbcb9e, e a correcao da nota no ledger
692df105  chore(calibracao): registrar feedback 9.5 no ledger encadeado
dfbbcb9e  chore(mcp): quarentena reversivel, roteamento lazy de addons
```

---

## O que esta sessão entregou

**Guarda executável do canônico e do ponteiro** —
`tests/test_governanca_canonico_e_ponteiro.py`, 7 testes. Alcança
`~\.gemini\CLAUDE.md` e `~\.claude\CLAUDE.md` por derivação (`RAIZ.parent`,
`Path.home()`), nunca por literal absoluto — §1 regra 3. Cada detector foi
provado por mutação: cópia byte a byte reprova 5; piso crescendo para 5 reprova;
piso **encolhendo para 3 passa**, que é o que a cláusula permite.

**`llm/adapters.py` ligado ao caminho real.** Ele conhecia o drift da geração 5 e
era importado por **um único arquivo de teste** — módulo que ninguém importa não
é integração (raiz §4). Os dois `call_anthropic` em uso tinham dois defeitos:
`temperature` indo a modelos que a rejeitam com 400, e `content[0]["text"]`, que
é `KeyError` quando o bloco 0 é `thinking` — e em Opus 5 o thinking está ligado
por padrão. 19 testes herméticos, nenhuma chamada a provedor.

**A escolha passou a ser do registro, não de heurística de nome.** O ping de
chave em `cli/commands.py` usa `claude-3-haiku-20240307`, geração 3, que
**aceita** amostragem. Remover `temperature` incondicionalmente teria quebrado a
validação de chave — preservar capacidade antes de corrigir, §8.2.

**Um commit alheio, quebrado, consertado.** `dfbbcb9e` (sessão
`gemini-flash-site-2026-09-02-mcp-curation`) levou junto trabalho desta sessão
ainda em andamento e saiu sem o import: `engine/llm_api.py` referenciava
`AnthropicAdapter` em 5 pontos → `NameError`. `f8523a3e` corrige de forma
aditiva, sem reescrever história.

> **Achado do portão, que vale mais que o incidente:** ele aprovou `dfbbcb9e`
> porque **mede o working tree, não o índice**. O import existia em disco e não
> no que foi commitado. Qualquer commit parcial pode repetir isto.

---

## Calibração

Ledger `valid`, 8 registros, **5 sessões distintas**, 0 faltantes, 0 com início
inconsistente. Min 7,5 · máx 9,5 · média **8,6**.

| Sessão | Nota |
| :--- | ---: |
| `codex-site-2026-09-01-prioridade` | 7.5 |
| `claude-opus5-site-2026-09-02-integridade` | 8 (corrigida de `0.8`) |
| `claude-opus5-site-2026-09-02-pmev` | 9 |
| `gemini-flash-site-2026-09-02-mcp-curation` | 9.0 (corrigida de `9.5`) |
| `claude-opus5-site-2026-09-02-guarda` | **9.5** |

A correção `110a52e7` é do Tier 0 e **foi consumida**: `correcoes_aplicadas` = 2.
O registro errado não se reescreve.

### O que o feedback de 9.5 diz, e é a coisa mais acionável daqui

> *"Os erros são os mesmos, mas você não só os percebe mais rápido e corrige
> mais rápido, como também eles diminuíram. Isso em apenas 2 sessões de
> calibragem."*

A leitura correta **não** é "melhorou, siga assim". É que o custo residual
continua sendo auto-correção — o Tier 0 já dissera, na nota 9, que ela gasta
tempo e token que não deveriam ser gastos. A meta não é corrigir mais rápido; é
não precisar corrigir. Ver `conferir-o-instrumento-antes-da-medicao`.

**Portão estrutural aberto — e isso NÃO é autorização.** Faltam duas
confirmações independentes do mesmo padrão operacional, obrigação do auditor.
Registro literal exigido: **dados insuficientes — nenhuma calibração planejada.**

---

## Uma armadilha que custou caro aqui, duas vezes

**Conferir o instrumento antes de acreditar na medição.**

1. Greppei o log da suíte por `cwv` e obtive zero — mas eu mesmo o truncara com
   `Select-Object -Last 18`.
2. Usei `Select-String -SimpleMatch` com um pattern `a|b|c`: `-SimpleMatch`
   desliga a regex, ele buscou a string literal com os pipes, achou zero, e
   concluí **perda de trabalho** que nunca houve — cheguei a atribuí-la a outra
   sessão.

O mesmo reflexo funcionou **a favor** no portão: as 3 violações axe
(`landmark-one-main`, `meta-viewport`, `region`) não eram do frontend — o dev
server em `:3000` tinha caído, e o axe auditava um DOM de página de erro. Subir o
Next.js zerou as violações.

**O dev server está rodando em `:3000`, iniciado nesta sessão.** O portão precisa
dele.

---

## Pendências

| Item | Estado |
| :--- | :--- |
| **Push** | **bloqueado em credencial** — só Tier 0 |
| Recaptura do HRC | **prioridade 1** — fecha 3 campos do ledger + arbitragem do nodelock |
| Arbitragem do nodelock | só Tier 0 |
| Duplicação `engine/llm_api.py` × `llm/anthropic.py` | aberta desde `HANDOFF-2026-08-27` item 3; **não paga** — hoje só passaram a compartilhar a fonte do conhecimento da API |
| `anthropic>=0.42.0` declarado e **não importado** | instalado 0.103.1; PyPI já em 1.3.0 (major); pin aberto para cima. Mexer exige autorização |
| Portão mede working tree, não índice | achado novo, sem guarda |
| `AXE_INCOMPLETE`: 2 inconclusivas | `aria-hidden-focus`, `color-contrast`; baseline exige 1 — exige inspeção humana |
| TBT sem artefato Lighthouse | `LIGHTHOUSE_FINGERPRINT_MISMATCH`, precede a sessão |
| `ruff format` divergente | `engine/llm_api.py`, `llm/adapters.py`, `llm/anthropic.py` já estavam fora do formato; CI roda `--check .` |
| 8 alertas Dependabot | não conciliados com `npm audit` = 0 |

---

## Regras que esta sessão fixou

- **Conferir o instrumento antes da medição.** Log truncado e `-SimpleMatch` com
  alternância produziram duas conclusões falsas na mesma sessão.
- **Âncora é o campo `caminhos:`, não menção em prosa.** Duas revisões foram
  rejeitadas por citar caminho que o registro alvo não declara.
- **O portão mede o working tree, não o índice.** Commit parcial passa quebrado.
- **A pergunta certa não era "manda `temperature`?", e sim "manda para quem a
  rejeita?".** Ler o sistema antes de agir sobre o artefato evitou quebrar o
  ping de chave.
