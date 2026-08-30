# Auditoria — malha agentica, subagentica e componentes relacionados

**Data:** 2026-08-30
**Escopo:** `data/agents_manifest.json`, `.claude/agents/`, `llm/routing_policy.py`,
`core/config.py`, `core/subagents_mesh.py`, `agents/`, `scripts/routines/sync_agents_reality.ps1`,
`tests/conftest.py`, `.mcp.json`, `.claude/plugin-profiles.json`, `.claude/settings.json`,
camada de skills e camada de memoria agentica.
**Metodo:** medicao no repositorio, nao leitura de documentacao. Toda afirmacao
abaixo foi executada; o que nao rodou esta declarado em §5.
**Estado das correcoes:** A1, A2, A3 e A7 foram corrigidos nesta mesma branch
apos aprovacao do vertice — ver §6. A4, A5, A6, A8 e A9 permanecem abertos.

---

## 1. Veredito

A malha esta **estruturalmente sa no eixo que a governanca mediu, e cega no eixo
que ela nao mediu.**

O roteamento de modelo — o eixo que a §3 do `CLAUDE.md` disciplinou e que
`test_frente4_autoridade_de_roteamento.py` guarda — esta integro: fonte unica,
19/19 documentos em sincronia byte-a-byte com o manifesto, 84 testes de
governanca/roteamento verdes.

O eixo de **capacidade** — quais skills cada agente de fato tem — nao tem fonte
unica, nao tem consumidor e nao tem guarda. Das 31 skills declaradas nos 19
agentes, **zero resolvem no repositorio** e **21 nao resolvem em lugar nenhum**.
E a mesma falha que a §3 e a §7 foram escritas para impedir, reaparecendo num
campo que a governanca nunca cobriu.

---

## 2. O que foi verificado e esta correto

Registrado porque verificacao nao executada nao e verificacao aprovada — e o
inverso tambem vale: o que passou precisa constar.

| # | Invariante | Medicao |
| :-- | :--- | :--- |
| S1 | Documentos de agente sao gerados, nao editados | **19/19 byte-identicos** ao template reproduzido a partir do manifesto. Zero drift. |
| S2 | Autoridade de roteamento e unica | `AGENT_MODEL_MAP` resolve 19/19; precedencia `override → mapa → manifesto (com aviso)` intacta em `core/config.py:195-212`. |
| S3 | Suite de governanca | **85 passed, 0 failed** sob Python 3.13 em `test_governanca_agents`, `test_desambiguacao`, `test_routing_policy`, `test_subagents_mesh`, `test_frente4_autoridade_de_roteamento`. |
| S4 | Mesh de subagentes sem modelo fantasma | 15/15 entradas de `SUBAGENT_MODEL_MAP` resolvem em `data/ollama_models.json`. |
| S5 | `specialized_scripts` apontam para arquivos reais | 0 caminhos quebrados nos 19 agentes. |
| S6 | Memoria agentica consolidada | `.claude/AGENTS-MEMORY` marcada `SUPERSEDED.md`, excluida do RAG (`memory_rag.py:523`), procedencia preservada por arquivo, guardada por `test_ingestao_superseded.py`. Consolidacao correta. |
| S7 | `npm audit --audit-level=low` | **0 vulnerabilidades.** |
| S8 | Aceitacao de risco do `chromadb` e verdadeira no codigo | Unico modo em uso e `PersistentClient` (`memory_rag.py:207`, `scripts/utils/ingest_rag.py:27`). Nenhum `HttpClient`, nenhum `chroma run`. A mitigacao declarada em `pyproject.toml:29-36` confere. |

---

## 3. Achados

### A1 — ALTO · A camada de skills nao resolve, nao e consumida e nao e guardada

Medicao das 31 skills distintas declaradas nos 19 agentes:

| Situacao | Qtd |
| :--- | ---: |
| Resolvem em `skills/`, `.agents/skills/` ou `.claude/skills/` | **0** |
| Resolvem como skill global do usuario (fora do repo, fora do versionamento) | 10 |
| **Nao resolvem em lugar nenhum** | **21** |

E os conjuntos sao **disjuntos**: as skills que de fato existem no repositorio
**nao sao declaradas por nenhum agente.**

> **Correcao a esta propria auditoria, feita ao aplicar a correcao de A1.**
> A primeira redacao contou "11 skills orfas" varrendo `skills/` e
> `.agents/skills/` como se fossem a mesma coisa. Nao sao. Os 8 diretorios sob
> `skills/` sao **submodulos git** de extensoes do Gemini CLI e servidores MCP
> (`Stitch`, `exa-mcp-server`, `superpowers`, `token-efficiency`,
> `gemini-*`) — outra classe de artefato, nao skill de agente, e nem sequer
> presentes no container (submodulo nao inicializado). Declara-los em `skills`
> de um agente seria erro de categoria.
> **O numero correto de skills de agente orfas era 3**, todas em
> `.agents/skills/`: `pmev-game-theory-engine`, `sota-quality-gate` e
> `sota-triad-mesh`. O achado central — 0 de 31 resolvendo, conjuntos disjuntos —
> nao muda; a contagem do lado orfao, sim.

A evidencia de que isto e drift, e nao design, esta nos quase-acertos:
`@maverick` e `@validador` declaram `pmev-game-theory-poker`; o que existe em
disco e `pmev-game-theory-engine`. `@chico`, `@auditor`, `@verifier` e
`@organizador` declaram `sota-ecosystem-auditor`; o que existe e
`sota-quality-gate`. Nomes renomeados de um lado, nao do outro.

**Por que passou despercebido:** o campo `skills` nao tem consumidor de runtime.
Os unicos leitores sao o gerador de documentos
(`sync_agents_reality.ps1:65`), que renderiza a lista nos 19 `.md` como
declaracao de capacidade, e `test_architectural_stress_and_failover.py:165`, que
so verifica que o campo **e uma lista** — nunca que os nomes existem.

O resultado e que 19 documentos de identidade publicam 31 afirmacoes de
capacidade que nada valida e nada carrega.

**Mesmo padrao, mesmo campo-vizinho:** `routing_pattern` tambem nao tem
consumidor de producao. Os unicos leitores sao o mesmo gerador
(`sync_agents_reality.ps1:64`) e uma fixture de teste
(`test_task_routing.py:23-35`) que ainda carrega modelos `gemini-2.5-*`, duas
geracoes atras do manifesto. O despacho real e por JSON validado contra
`VALID_AGENTS` em `agents/dispatcher.py:34-41`, sem regex. Consequencia
secundaria: **11 tokens de `routing_pattern` colidem entre agentes**
(`visao` → maverick+architect; `validar` → verifier+validador;
`design` → architect+curator; `risco` → maverick+securitychief; e mais 7) sem
precedencia declarada — inofensivo hoje justamente porque ninguem le.

Dos tres campos declarativos do manifesto, `specialized_scripts` e o unico cujos
valores resolvem (S5). `skills` e `routing_pattern` sao documentacao repetindo
valor que ninguem versiona contra a realidade.

---

### A2 — ALTO · O teste de integridade da malha so passa na maquina do operador

`tests/test_architectural_stress_and_failover.py:145`:

```python
manifest_path = Path(r"C:\Users\rapha\.gemini\Site\data\agents_manifest.json")
assert manifest_path.exists(), "agents_manifest.json deve existir"
```

Caminho absoluto de perfil embutido. O teste que valida modelo primario,
fallback e afinidade de memoria dos 19 agentes **falha em qualquer clone**, e
falhou nesta auditoria. O manifesto existe; o caminho e que nao.

**O portao nao pode pegar isto por construcao.** A fase 5 do `cwv_gate.ps1`
compara *prefixos de diretorio* de arquivos staged (`cwv_gate.ps1:313`) — ela
barra um arquivo **sob** `.gemini/`, nao um literal `C:\Users\rapha\...`
**dentro** do conteudo. A regra que o `CLAUDE.md` §1 descreve como "caminho de
perfil de ferramenta versionado" cobre localizacao, nao conteudo.

O literal aparece em 3 arquivos `.py` versionados
(`tests/test_architectural_stress_and_failover.py`, `memory_rag.py`,
`scripts/ops/sota_entropy_sanitizer.py`) e em `.claude/settings.json`, cuja
permissao `Read(C:/Users/rapha/.gemini/Site/**)` e no-op fora daquela maquina.

---

### A3 — MEDIO · O guard da suite declara VERDE em execucao que nao rodou

`tests/conftest.py` engancha `pytest_runtest_logreport` (fase de execucao) e
`pytest_warning_recorded`. **Erro de coleta nao passa por nenhum dos dois** —
ele sai por `pytest_collectreport`, que nao esta enganchado.

Medido com um erro de coleta deliberado, com zero testes executados:

```
 Total de Erros:    0 (Teto Maximo Permitido: 0 | Peso: CRITICO)
 Status da Bateria: [SUCESSO (VERDE)] Zero Erros e Zero Warnings. Homeostase Total Aprovada.
 Homeostase Total:  Nenhum erro ou warning detectado em toda a suite.
!!!!!!!! Interrupted: 1 error during collection !!!!!!!!
```

**Delimitacao honesta do impacto:** o exit code continua **2**, entao o CI nao
passa em silencio e o `pre-commit` nao e furado. O defeito esta confinado ao
**veredito impresso** — que e exatamente o que a §5 do `CLAUDE.md` manda o
agente declarar. A ultima linha ("Nenhum erro ou warning detectado em toda a
suite") e falsa nesse cenario, e um agente que obedece a §5 a repassaria.

---

### A4 — MEDIO · A ponte MCP esta presa ao Windows e cai fora dele

`.mcp.json` aponta os dois servidores locais para `.venv/Scripts/python.exe`:

- `google-jules` → `engine/jules_mcp_server.py` (Tier 2, superagente de nuvem)
- `nexus-bridge` → `mcp-bridge/server.py`

`Scripts/` e layout de venv de Windows; em POSIX e `bin/`. Ambos falharam nesta
sessao com `ENOENT`. Os dois scripts-alvo existem e estao integros — o que nao
resolve e o interpretador. Efeito: **Tier 2 e a ponte nexus ficam indisponiveis
em qualquer sessao Linux ou remota**, sem degradacao anunciada. O servidor
`supabase`, que e `serverUrl`, sobe normalmente.

---

### A5 — MEDIO · A documentacao do roteamento subdeclara a malha que descreve

Duas afirmacoes em `llm/routing_policy.py` nao batem com o modulo:

1. O docstring diz cobrir "os **6 niveis de subagente** de
   `core.subagents_mesh.SubagentTier`". `SubagentTier` tem **15 membros**
   (`core/subagents_mesh.py:95-112`). Nove niveis — entre eles `FLUTTER_A11Y`,
   `SELF` e `GENERALIST`, que o `CLAUDE.md` Tier 4 lista nominalmente — estao
   fora da contagem escrita.
2. `CONFLITOS_MANIFESTO` (`routing_policy.py:307`) registra **2** conflitos
   entre tabela e manifesto (`implementor`, `historian`). O conflito medido e de
   **17 em 19**: so `architect` e `gemma4` resolvem para o proprio
   `primary_model`.

O item 2 nao e bug de roteamento — a politica e a autoridade por design, e
`core/config.py:176-181` registra que a divergencia era 19/19 e foi
deliberadamente resolvida em favor da politica. E um bug de **declaracao**: o
dicionario que existe para tornar a divergencia visivel mostra 2 de 17.

---

### A6 — MEDIO · O manifesto se le local-first; o que roda e cloud-first

| | Modelos locais |
| :--- | ---: |
| `primary_model` declarado no manifesto | **11 / 19** |
| Resolvido de fato por `AGENT_MODEL_MAP` | **1 / 19** (`gemma4:12b`) |

Agentes como `@organizador` e `@sequenciador` declaram `qwen2.5-coder:0.5b` e
rodam em `gemini-3.7-flash`; `@validador` declara `qwen-pmev-math` e roda em
`gemini-3.7-flash`; `@chico` declara `gemini-3.7-flash` e roda em
`claude-opus-5`.

Isto e consequencia correta da precedencia da §3 — mas significa que a leitura
natural do manifesto (frota majoritariamente de borda) descreve uma postura que
nao esta em execucao.

**Delimitacao:** a meta de 60–70% de trafego local do `CLAUDE.md` §6.3 pertence
ao `ComplexityAnalyzer` de `tools/hybrid_router/app.py:128`, que e outra
superficie. Este achado **nao** afirma que aquela meta esta violada — nao foi
medida aqui (§5).

---

### A7 — BAIXO · `$Model` nao existe mais, mas o template ainda o interpola

`scripts/routines/sync_agents_reality.ps1:77` escreve no template de memoria:

```powershell
"> **Status:** Ativo e Otimizado (``$Model``) | ..."
```

`$Model` foi removido na de-duplicacao de 2026-08-21 — o proprio comentario da
linha 46 documenta a remocao e o motivo. A variavel nao e mais atribuida em
lugar nenhum do script.

Latente, nao ativo: o bloco so roda quando `MEMORY.md` **nao existe**, e os 19
existem. Sem `Set-StrictMode`, o PowerShell interpola string vazia em silencio;
com `Set-StrictMode -Version Latest`, lancaria. Dispara na proxima vez que um
agente novo entrar no manifesto — precisamente quando ninguem estiver olhando.

---

### A8 — BAIXO · Dois `fallback_model` nao resolvem em nenhum registro

| Agente | `fallback_model` | Situacao |
| :--- | :--- | :--- |
| `architect` | `claude-3-7-sonnet` | ausente de `ollama_models.json` e do `MODEL_REGISTRY` |
| `pesquisador` | `exa` | ausente dos dois; `exa` e provedor de busca, nao modelo |

Os `primary_model` dos 19 resolvem. So a linha de fallback e que tem os dois
furos — a linha que so e exercida quando algo ja deu errado.

---

### A9 — INFO · `chromadb`: 4 advisories, nota cobre 1; portao cobre so npm

`pip-audit -r requirements.txt` retorna 4 vulnerabilidades conhecidas em
`chromadb 1.5.9`, **nenhuma com versao de correcao publicada**:
`PYSEC-2026-311`, `CVE-2026-45830`, `CVE-2026-45831`, `CVE-2026-45833`.

A aceitacao de risco em `pyproject.toml:29-36` esta **tecnicamente correta e
verificada** (S8): as quatro sao vulnerabilidades de modo servidor, e o projeto
so usa `PersistentClient` embarcado. Duas observacoes, nenhuma delas urgente:

1. A nota nomeia apenas `PYSEC-2026-311`; as outras tres apareceram depois e
   nao foram incorporadas ao texto que sustenta a decisao.
2. A fase 3 do `cwv_gate.ps1` roda **somente `npm audit`**
   (`cwv_gate.ps1:201`). O lado Python permanece manual, conforme a §2 — o que
   e coerente com a governanca escrita, mas significa que estes 4 advisories
   nao sao barrados por portao nenhum.

---

## 4. Prioridade sugerida

1. **A2** — corrigir o caminho absoluto restaura um teste de integridade da
   malha hoje inerte. Uma linha.
2. **A1** — decidir o que `skills` e: contrato (e entao ganha guarda de
   existencia, como `specialized_scripts` ja tem de fato) ou prosa (e entao sai
   dos documentos gerados). Manter como esta e manter 31 afirmacoes nao
   verificaveis nos 19 documentos de identidade.
3. **A3** — enganchar `pytest_collectreport` alinha o veredito impresso ao exit
   code que ja esta correto.
4. **A4** — resolver o interpretador do `.mcp.json` por plataforma devolve
   Tier 2 as sessoes nao-Windows.
5. **A5, A6** — reconciliacao de texto: contagem de `SubagentTier`,
   `CONFLITOS_MANIFESTO` e a leitura local-first do manifesto.
6. **A7, A8, A9** — higiene.

A auditoria foi entregue sem correcoes. **A1, A2, A3 e A7 foram corrigidos em
seguida, sob aprovacao explicita do vertice** — registrados na §6. A4, A5, A6,
A8 e A9 continuam abertos.

---

## 5. Obrigacao de declaracao (§5)

**Executado nesta sessao:**

- Suite completa `pytest tests/` sob Python 3.13 — 353 passed, 14 failed,
  1 skipped, 72 errors **antes** das correcoes da §6; **363 passed, 13 failed**
  depois. O delta e inteiramente explicado: +1 por A2 e +9 pela guarda nova de
  A1. Nenhum outro teste mudou de estado; os 72 errors sao os mesmos.
- Mutacao deliberada das 5 guardas de A1, para provar que sabem falhar.
- Subconjunto de governanca/roteamento (5 modulos) — **85 passed, 0 failed**.
- `npm audit --audit-level=low` — 0 vulnerabilidades.
- `pip-audit -r requirements.txt` — 4 advisories (A9).
- Reproducao do template do gerador e diff contra os 19 `.md`.
- Resolucao em runtime de `AGENT_MODEL_MAP` contra `primary_model`.
- Verificacao de existencia de 31 skills distintas e 19 `specialized_scripts`
  distintos (36 referencias somando repeticoes entre agentes).
- Sonda deliberada de erro de coleta para medir o comportamento do guard (A3).

**NAO executado — e portanto nao aprovado:**

- **`scripts/ops/cwv_gate.ps1` (as 5 fases) nao rodou.** Ambiente Linux sem
  PowerShell; o portao e Windows/`pwsh`. Alem disso, os hooks do `husky` nao
  estao instalados neste clone (`.git/hooks/pre-commit` ausente,
  `core.hooksPath` vazio), entao o portao **nao disparou no commit desta
  auditoria** — nao por contorno, mas por ausencia de instalacao. Nenhuma
  afirmacao deste relatorio substitui o veredito dele. Ao commitar em maquina de
  trabalho, o portao roda e o veredito dele e que vale.
- **Skill `security-review` nao executada** (§4) — nao disponivel nesta sessao.
- **`sync_agents_reality.ps1` nao foi executado.** Os 19 documentos da §6/A1
  foram regenerados por reproducao em Python do template, provada byte-a-byte
  contra o estado anterior. Isso valida o TEXTO gerado, nao o script: a sintaxe
  do `.ps1` corrigido em A7 continua sem passar por parser. Rodar o gerador em
  maquina de trabalho fecha as duas lacunas de uma vez, e o resultado esperado e
  "nenhuma mudanca".
- **Skills marcadas `nao-verificada` no registro nao foram confirmadas.** Sao 19,
  e o registro diz isso explicitamente. Confirma-las exige a maquina do
  operador, nao este container.
- `pip-audit` das dependencias **instaladas** e auditoria OSV do `uv.lock` — nao
  rodadas; so a declaracao (`requirements.txt`) foi auditada, que e a distincao
  que a §2 do `CLAUDE.md` exige explicitar.
- `ComplexityAnalyzer` / meta de 60–70% de trafego local — nao medida (A6).
- Servidores MCP `google-jules` e `nexus-bridge` — nao puderam ser exercitados;
  falharam ao conectar (A4).

**Ressalva de ambiente, registrada porque quase virou achado falso:** a primeira
execucao da suite foi feita sob Python 3.11 e acusou
`engine/vitoi_perspective_engine.py` como nao-parseavel, derrubando
`test_leitores_de_agent_model_map_batem_com_a_declaracao`. O arquivo usa `type X = ...`
(PEP 695, Python 3.12+); `.python-version` pede 3.14 e o `pyproject.toml`
declara `requires-python = ">=3.12"`. **O arquivo esta correto e o teste
tambem** — o interpretador e que estava errado. Sob Python 3.13 o teste passa.
A maioria dos 72 errors da suite completa e da mesma natureza: modulos ausentes
neste container (`torch`, `psutil`, `lancedb` e outros), nao defeito do
repositorio.

---

## 6. Correcoes aplicadas (A2, A3, A7)

Aplicadas apos aprovacao do vertice, na mesma branch da auditoria. Escopo
deliberadamente minimo: cada uma corrige o defeito medido e nada alem dele.

### A1 — `skills` vira contrato com guarda

Decisao do vertice: contrato, nao remocao. O campo passa a ter **modelo de
resolucao explicito, fonte unica e guarda que reprova**.

**Modelo de resolucao.** Um nome declarado resolve de duas maneiras, e so duas:

1. **Local** — diretorio com `SKILL.md` sob uma `raiz_local` de
   `data/skills_registry.json` (hoje `.agents/skills`). E **descoberto por
   varredura, nunca listado no registro**: repetir em JSON o que ja esta em
   disco criaria a segunda copia que a §7 proibe, e ela divergiria como o
   `AGENTS.md` divergiu.
2. **Externa** — entrada em `externas` do registro, para o que vive fora do
   repositorio (plugin, escopo de usuario, marketplace).

Nome em nenhum dos dois **reprova a suite**. O buraco fecha para frente: skill
nova entra com resolucao declarada ou nao entra.

**Reconciliacao dos 31 nomes.** Duas correcoes de rename, ambas com evidencia
no proprio `SKILL.md`, nao por semelhanca de string:

| De | Para | Evidencia | Declarantes |
| :--- | :--- | :--- | ---: |
| `pmev-game-theory-poker` | `pmev-game-theory-engine` | frontmatter descreve exatamente PMev, ICMev, Teoremas de Vitoi e aceleracao Rust/WASM | 3 |
| `sota-ecosystem-auditor` | `sota-quality-gate` | frontmatter descreve as 5 fases do portao, CVE e sanitizacao de warnings — o escopo de `@auditor` (tier "Quality Gate & CVE Audit") e de `@chico` (dono de `cwv_gate.ps1`) | 5 |

E `sota-triad-mesh`, que existia sem nenhum declarante, foi atribuida a
`@pesquisador` e `@chico`: a skill orquestra Exa + Stitch + Google Jules, o Exa
e o dominio declarado do pesquisador (cujo `fallback_model` e literalmente
`exa`) e o chico e o orquestrador. **Este e o unico ponto de julgamento da
correcao, e esta marcado como tal.**

**Os 29 nomes restantes foram para o registro, nenhum removido.** Dez estao como
`verificada` (observadas carregadas nesta sessao); dezenove como
`nao-verificada` — declaradas pelo operador e nao observaveis a partir do
repositorio. A distincao e o ponto: **ausencia de observacao nao e prova de
ausencia** (§8.2), e apagar a declaracao de uma skill porque um container Linux
nao a enxerga seria exatamente o erro que aquela secao proibe. O que muda e que
os 19 nomes duvidosos agora estao **enumerados num lugar so, com status
escrito**, em vez de implicitos em 19 documentos gerados.

**A guarda** — `tests/test_governanca_skills.py`, 9 testes:

| Invariante | O que impede |
| :--- | :--- |
| Toda skill declarada resolve | o achado A1 original |
| Toda skill local e declarada por alguem | capacidade em disco que nenhum agente alcanca |
| Registro nao acumula entrada morta | o registro envelhecer como o campo que ele guarda |
| Local e externa nao disputam nome | ambiguidade de resolucao (§3) |
| `status` de vocabulario fechado | a distincao observado/declarado virar prosa livre |
| Toda externa declara `origem` | "externa" virar sinonimo de "nao encontrei" |
| Nome de diretorio bate com `name:` do frontmatter | resolucao por diretorio ser coincidencia |
| Documentos publicam exatamente as skills do manifesto | o que o humano LE envelhecer mesmo com o manifesto correto |

**Verificacao — cada guarda foi quebrada de proposito antes de ser aceita.**
Teste que passa nao prova nada ate se mostrar que ele sabe falhar:

| Sonda | Resultado |
| :--- | :--- |
| Reintroduzir `pmev-game-theory-poker` | reprova, nomeando skill e agente |
| Remover `sota-triad-mesh` de todos | reprova, nomeando a skill ociosa |
| Entrada fantasma no registro | reprova, nomeando a entrada morta |
| Editar um `.md` gerado a mao | reprova, e manda rodar o gerador |
| `status: "talvez"` | reprova, mostrando o vocabulario valido |

Suite: 354 → **363 passed** (os 9 novos), 13 failed e 72 errors inalterados.

**Propagacao aos documentos.** Alterar o manifesto obriga a regenerar os 19
`.md`. Sem `pwsh` neste ambiente, foram regenerados por uma reproducao fiel do
template do `sync_agents_reality.ps1` — **provada fiel antes do uso**: aplicada
ao manifesto antigo, reproduziu os 19 arquivos byte a byte, incluindo ausencia
de BOM, LF e ausencia de newline final. Nove arquivos mudaram, todos no bloco de
skills.

### A2 — `tests/test_architectural_stress_and_failover.py`

Caminho absoluto de perfil trocado por ancora no proprio arquivo de teste
(`RAIZ = Path(__file__).resolve().parent.parent`), que e a convencao dominante
da suite. O comentario que acompanha registra por que o portao nao podia pegar
isto: a fase 5 compara prefixos de diretorio, nao conteudo.

**Verificacao:** o teste passa e volta a exercer o que prometia — os 19 agentes,
`primary_model`, `fallback_model`, `tier`, `memory_affinity` e a forma de
`skills`. Era o unico teste da suite que a correcao mudou de estado:
14 failed → 13 failed, 353 passed → 354 passed.

### A3 — `tests/conftest.py`

Adicionado `pytest_collectreport`, que registra erro de coleta em
`SotaGuardState.errors` com categoria `CollectionError` e fase `"collect"`.
Faltava o gancho, nao o criterio: `pytest_runtest_logreport` so ve a fase de
execucao, e um modulo que morre na coleta nunca chega la.

**Verificacao, com a mesma sonda que produziu o achado:**

| | Antes | Depois |
| :--- | :--- | :--- |
| Veredito impresso | `[SUCESSO (VERDE)] ... Homeostase Total Aprovada` | `[FALHOU (VERMELHO)] ... (1 Erros, 0 Warnings)` |
| Causa nomeada | nenhuma | `ModuleNotFoundError: No module named ...` |
| Exit code | 2 | 1 |

O exit code permanece nao-zero nos dois casos — o CI nunca esteve furado, e a
correcao nao muda isso. O que muda e o veredito que a §5 manda declarar deixar
de contradizer o que aconteceu. Execucao limpa continua verde (85 passed,
exit 0): a mudanca nao introduz falso positivo.

### A7 — `scripts/routines/sync_agents_reality.ps1`

Removida a interpolacao de `$Model`, variavel que deixou de existir na
de-duplicacao de 2026-08-21. O status do template de memoria passa a nao repetir
valor versionado, pelo mesmo motivo que o **Motor Base** ja nao repetia.

**Verificacao:** `$Model` agora so aparece em comentario; BOM UTF-8 unico
preservado (§6.4 do `CLAUDE.md`), decodifica como `utf-8-sig`, 91 CRLF
preservados; os 19 documentos gerados continuam byte-identicos ao manifesto.

**Limite desta verificacao, declarado:** nao ha `pwsh` nem `powershell` neste
container, entao **a sintaxe do `.ps1` nao foi validada por parser** e o script
nao foi executado. A mudanca e a remocao de uma interpolacao dentro de uma
string de aspas duplas — sem alteracao de estrutura, controle de fluxo ou
encoding — mas isso e argumento, nao medicao. Rodar o gerador em maquina de
trabalho fecha esta lacuna.

---

**Assinatura:** Auditoria de malha agentica [Tier 1.B]
**Proposito:** Medir a integridade da malha agentica/subagentica e seus
componentes; separar invariante sustentada de invariante presumida; declarar o
que nao foi verificado.
