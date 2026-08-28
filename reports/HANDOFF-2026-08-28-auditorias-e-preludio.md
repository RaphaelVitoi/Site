---
id: handoff-2026-08-28-auditorias-e-preludio
tipo: handoff
escopo: multiprojeto
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T02:50-03:00
commit: dc231c69
classes: [interno, medido]
config_medida:
  raiz: C:/Users/rapha/.gemini
  branch: master
  suite_no_inicio: 415 passed
  suite_no_fim: 458 passed
  commits_da_sessao: 9
  data: 2026-08-27 a 2026-08-28
verificado:
  - suite completa executada apos cada bloco de alteracao
  - portao de ancora executado antes de cada commit; um deles REPROVOU e a
    causa foi corrigida em vez de contornada
  - 14 mutacoes aplicadas e revertidas ao longo da sessao, com baseline
    explicita nas ultimas 11
  - parse dos arquivos .ps1 alterados em pwsh 7 e em Windows PowerShell 5.1
  - launchers executados de dentro e de fora do projeto
nao_verificado:
  - nenhuma chamada real a provedor de LLM: as chaves deste ambiente estao
    revogadas e nao foram substituidas
  - o proxy de inferencia (127.0.0.1:17043) nunca foi levantado
  - nenhuma skill foi executada; nenhum servidor MCP foi iniciado
  - o Gemini CLI nao foi executado
  - `nexus ops maintenance` nao foi rodado ponta a ponta (o passo 3 e
    `sanitize --apply`, que deleta arquivos)
  - `nexus ops quality-gate` completo (10 fases) nao foi executado
  - os patches em patches/skills NAO foram reaplicados sobre copia limpa
supersede: handoff-2026-08-27-governanca-e-portoes
---

# HANDOFF — 2026-08-28

Sequência do [HANDOFF-2026-08-27](HANDOFF-2026-08-27-governanca-e-portoes.md),
que este documento **supersede** para efeito de retomada.

## 1. Estado

```
master dc231c69 · árvore limpa · suíte 415 → 458
```

Nove commits. Nada pela metade em lugar nenhum.

| Commit | O quê |
| :--- | :--- |
| `d9db429e` | Procedência de rota, portão de âncora, 10 sinais desconectados |
| `f3f7084e` | Dashboard executivo + saneamento de 6 achados do interlúdio |
| `e436e3e1` | Veredito derivado nos 4 resumos; fim do sucesso gracioso |
| `97c931d8` | Reprovar em toda direção de falha que devolvia zero |
| `dbaf4e82` | Prelúdio do plano 2-B: as duas portas de entrada |
| `4792e73b` | Mapa de referência das famílias de governança |
| `a6712d6a` | `AGENTS.md` vira ponteiro + auditoria das 8 skills |
| `dc231c69` | O motor é ChromaDB; o passo 5 do maintenance nunca existiu |
| *(este)* | Patches dos submódulos + handoff + plano |

## 2. O que se aprendeu — sete lições com custo pago

### 2.1 Procurar o **habilitador**, não catalogar instâncias

Várias falhas silenciosas na mesma camada costumam ter **um** ponto que
converte falha em sucesso para todas. No `cli/commands.py`, o `else` do
despacho legado imprimia e retornava — `EXIT=0`. Enquanto ele existisse,
`check=True` era decorativo em todo o `nexus.py`, e um atalho apontando para
nome inexistente era indistinguível de um que funciona.

### 2.2 Presença não é função

Corrigi o passo 5 do `maintenance` adicionando guarda de existência do
**arquivo**. O arquivo existia; o **subcomando** (`optimize`) nunca existiu. A
etapa continuou não fazendo nada, agora com uma guarda por cima. Verificar que
o alvo existe não verifica que a invocação é válida.

### 2.3 Natureza precede diferença

Concluí que `Site/skills/` era um fork com trabalho perdido. São **submódulos**.
Medi `cmp` e `mtime` — que respondem *"são diferentes?"* — e pulei
`git ls-files -s`, que responde *"o que isto é?"*.

### 2.4 Ler os dois lados da fronteira antes de nomear o defeito

Registrei "persona duplicada" no `run_inference` e disse que resolver exigiria
levantar o proxy. Errado nas duas pontas: ler o servidor bastou, e não havia
duplicação — o campo é canal lateral de temperatura, e a redundância é
*load-bearing*. **"Exige levantar o ambiente" costuma ser preguiça disfarçada
de rigor.**

### 2.5 O arnês de verificação também mente

Um script de mutação que media `returncode != 0` reportou `7/7 detectores
provados`. Uma era falsa: `pytest -k` não casou com o id parametrizado, o
pytest saiu **5** por *nenhum teste coletado*, e 5 ≠ 0. **Teste de mutação só
vale com baseline** — exigir `N passed` antes, `≥1 failed` depois, e conferir a
contagem de testes **coletados**.

### 2.6 Detector precisa separar *citar* de *afirmar* — cinco vezes

O portão de âncora reprovou os próprios comentários; o guard de roteamento pegou
`Convert-DeepJsonStringSOTA`; o guard do literal pegou minha prosa; o guard do
`AGENTS.md` idem; o guard do LanceDB reprovou o meio da própria docstring.

A resposta certa foi sempre **estreitar o escopo estruturalmente**, nunca
isentar o arquivo. E a última exigiu a distinção fina: **comentário é uma linha,
docstring é um bloco** — rastrear estado, não prefixo.

### 2.7 Nome de componente é afirmação, e envelhece calado

Dez pontos afirmavam "LanceDB"; o motor é ChromaDB e `lancedb` não está
instalado. A narração foi escrita para o estado **pretendido** e nunca
reconciliada com o **construído** — e chegou ao `system_prompt` do modelo. Nada
acusou, porque nome errado não levanta exceção.

## 3. Padrão que se acumulou — calibração bayesiana

**"Sinal verde desconectado" chegou a 13 instâncias catalogadas**, mais três
variantes novas nomeadas nesta sessão:

| Variante | Exemplo |
| :--- | :--- |
| **Nome errado para grandeza real** | `"KV Cache Alocado"` movia `num_predict`, não `num_ctx` |
| **Habilitador estrutural** | `print` sem exit no despacho legado |
| **Limpo por instrução** | `ignore = dirty` escondendo 62 fontes modificados |

**Priores atualizados:**

- Afirmação de sucesso na UI → **rastrear até o campo do protocolo**, não até a
  variável local.
- "Zero referências em código" → **não** significa órfão. Consumidor tem três
  tipos, e o `grep` só vê um (§1.5.1 do plano).
- Árvore de git limpa → conferir se é limpa **de fato** ou por configuração.
- Contagem em prosa de governança → suspeita por padrão. A §6 do `AGENTS.md`
  dizia `395/395` com a suíte em 447.

## 4. O que fica aberto

### 4.1 Decisão sua

| # | Item |
| :--- | :--- |
| 1 | Os 62 fontes modificados: **patches já extraídos e versionados** (risco contido). Falta escolher entre PR upstream, fork próprio, ou descartar |
| 2 | As 2 extensões no ledger do CLI e fora de `extensions/` |
| 3 | Portar os 3 conceitos do `supermemory` para o `memory_rag` local (§3.3 do plano) |
| 4 | Instalar LanceDB ao lado do Chroma — **com a partição declarada antes** (§3.2 do plano) |

### 4.2 Execução, sem decisão pendente

- Padronizar `.disabled` — 376 arquivos hoje `.bak`, nome que mente
- `extensions/` com **0 skills ativas e 56 desligadas** — a árvore que o CLI carrega
- Religar `gemini-cli-security` (o `osvScanner` que o `CLAUDE.md` §2 pede à mão)
- Renomear `Site/skills/`, que não contém skills do `Site`
- Propagar `<extensao>-GEMINI.md` nos 30 homônimos

### 4.3 Destrutivo — exige ordem explícita item a item

- `Site/.cerebro/ops-deploy/MODUS_OPERANDI.md` — único órfão verdadeiro medido
- `_calculate_dynamic_context()` — inalcançável no `gemma_server`
- Cópia raiz de `~/.gemini/tools/hybrid_router/`

### 4.4 Meta-governança

- **Candidato a POSTULADO:** a regra do portão de âncora distingue comentário
  mas não docstring — 5 ocorrências. Recusei mexer em detector de segurança
  para me desbloquear; a mudança exige medição dos dois estados.
- POSTULADO-001 itens C e D: as fases 1 e 2 do CWV não medem. São os 2 warnings
  que mantêm o portão amarelo por desenho.
- Herdados: `engine/llm_api.py` duplicando `llm/anthropic.py` e
  `llm/openrouter.py`; `Site/.gemini/` aninhado; dois paradigmas de roteamento.

## 5. Prompt de continuação

```
Retomando o NEXUS-CORE-SOTA (~/.gemini/Site), master dc231c69, suite 458.

LEIA PRIMEIRO, nesta ordem:
  1. reports/HANDOFF-2026-08-28-auditorias-e-preludio.md — secoes 2, 3 e 4
  2. reports/PLANO-2B-CURADORIA-ESTRUTURAL.md — preludio 0.5, mapa 1.5, frente 3
  3. reports/AUDITORIA-2026-08-28-skills.md — secoes 2, 4 e 5
  4. ~/.gemini/CLAUDE.md e Site/CLAUDE.md

PROXIMO PASSO RECOMENDADO
Frente 1 do plano 2-B: declarar o canonico de cada familia de governanca. A
base de evidencia esta medida na secao 1.5 do plano; 5 decisoes ja sao
mecanicas e 3 dependem do vertice.

Se o vertice preferir avancar por valor imediato: religar gemini-cli-security
e padronizar .disabled sao execucao pura, sem decisao pendente.

REGRAS QUE VALEM SEMPRE AQUI
- Escopo limita o que se ALTERA, jamais o que se LE (M.O. 1.2). E ler os DOIS
  lados de uma fronteira antes de nomear defeito.
- Natureza precede diferenca: perguntar "o que isto e?" antes de "sao
  diferentes?".
- Presenca nao e funcao: alvo existir nao prova invocacao valida.
- Procurar o HABILITADOR quando varias falhas silenciosas surgem na mesma
  camada.
- Teste de mutacao SO vale com baseline: N passed antes, >=1 failed depois, e
  conferir testes COLETADOS. "Reprovou" e "nao rodou" tem o mesmo returncode.
- Detector precisa separar citar de afirmar. Comentario e linha, docstring e
  bloco. Estreitar escopo estruturalmente, nunca isentar arquivo.
- Nome de componente e afirmacao: conferir contra o instalado.
- Nunca medir exit code depois de um pipe.
- Remocao e destrutiva: ordem explicita do vertice, item a item.
- Nao contornar hook que falha -- inclusive nao ampliando a excecao dele.

LINHA DE BASE
458 passed. Portao de ancora APROVADO. Pre-commit com EXIT real medido sem pipe.
```

## 6. Declaração (governança §5)

Rodaram: a suíte completa após cada bloco; o portão de âncora antes de cada
commit (um reprovou, e a causa foi corrigida, não contornada); 14 mutações com
reversão verificada; parse dos `.ps1` em duas versões do PowerShell; execução
dos launchers de dentro e de fora do projeto.

Não rodaram, e por quê: nenhuma chamada real a provedor de LLM (chaves
revogadas); o proxy de inferência nunca foi levantado; nenhuma skill executada
nem servidor MCP iniciado; o Gemini CLI não foi executado; `maintenance` ponta
a ponta (o passo 3 deleta) e `quality-gate` completo ficaram fora; os patches
não foram reaplicados sobre cópia limpa. Tudo declarado no frontmatter.
