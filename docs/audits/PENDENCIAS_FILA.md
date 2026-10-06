# PENDENCIAS — Fila de bloqueio do Site

Escopo: itens que **nao** bloqueiam o portao de commit, mas nao estao fechados.
Ordem: conforme agreed com o usuario. `HandRanks` e explicitamente a ULTIMA.

---

## 1. Harness ICM/ChipEV — ✅ FECHADO (2026-09-17)

### Entregue

- `engine/pmev_harness_icm.py` — 52 verificacoes em 4 estruturas
- `tests/test_pmev_harness_icm.py` — 13 testes, incluindo **sensibilidade**:
  o harness tem de ficar VERMELHO quando o motor ou o artefato muda, senao o
  verde e decorativo

```
52/52 verificacoes VERDE
48 estados recomputados (12 x 4 estruturas), 208 assentos
icm_ev bate com o kernel em <1e-6 em TODOS os assentos
Spin: ICM reproduz ChipEV vetor a vetor (12/12 x 2 estruturas)
```

**O buraco que ele fecha:** o artefato foi gerado a partir de hand histories
que **nao sao versionadas**, entao nada no repo respondia "o motor ainda bate
com o que foi publicado?". O harness reexecuta o kernel sobre a amostra
publicada e compara assento a assento.

**Divergencia real encontrada no caminho:** `ic95` bracket de `diferenca`
(modelo - referencia), NAO do valor do modelo. Ler `modelo` contra `ic95` da
falso negativo em toda linha, porque o Brier do modelo (0.72) nunca cai no IC
da diferenca (negativo). O harness agora confere `modelo - referencia ==
diferenca` e que o IC contem a diferenca.

**O que ele NAO faz, por desenho:** nao revalida as 15.459 estados (o artefato
so publica agregados e 12 amostras por estrutura) e nao reamostra o bootstrap
por torneio (os nomes dos torneios nao saem da maquina). Ambas as limitacoes
estao na docstring do modulo e na saida do `--report`, para ninguem ler um
verde como "o benchmark inteiro foi revalidado".

**Corrigida a unidade errada de raciocinio:** a pendencia registrava que
faltava um runner. Havia ja um corpus de paridade (`data/engine_parity_scenarios.json`,
`family_tolerances`) coberto por `tests/test_engine_parity_scenarios.py`, verde.
O que faltava era reexecutar contra o **artefato publico**, nao contra o
corpus.

### Estado que motivou a pendencia (historico)

| Camada | Estado | Onde |
|---|---|---|
| Modelo matematico | ✅ PRONTO | `engine/icm_matrix.py` — Malmuth-Harville, BF, RP |
| Dataset de benchmark | ✅ PRONTO | `data/pmev_benchmark_icm_chipev.v1.json` — 15.459 estados |
| Consumidor frontend | ✅ PRONTO | `frontend/src/lib/pmevBenchmark.ts` |
| Drift H8 | ✅ PRONTO | `engine/pmev_h8_drift.py` |
| Produtor do dataset | ✅ PRONTO | `scripts/validation/exportar_benchmark_icm_publico.py` |
| Testes | ✅ 16 arquivos | `tests/test_icm_matrix.py`, `test_pmev_*.py`, `test_pmev_harness_icm.py` |
| **HARNESS** | ✅ **FEITO** | `engine/pmev_harness_icm.py` |

**Diagnostico original:** as 6 camadas acima existiam e estavam testadas;
faltava a camada de harness.

**Unidade confirmada durante a execucao:** o kernel devolve percentual e o
artefato tambem. `icm_ev` do artefato bate com `calculate_malmuth_harville_icm`
em menos de 1e-6 nos 208 assentos, o que prova que a escala esta correta —
sem necessidade de normalizacao. A preocupacao registrada na versao anterior
desta pendencia (`/ 100.0` num ponto, `max(0.40, ...)` noutro) **nao se
manifestou** no caminho do harness.

**Como rodar:**

```
.venv/Scripts/python.exe -m engine.pmev_harness_icm --report
.venv/Scripts/python.exe -m engine.pmev_harness_icm --json
```

Sai com codigo 1 quando qualquer verificacao falha, servindo de portao.

---

## 2. Ling via Ollama — ✅ FECHADO POR DECISAO (2026-09-17)

**Decisao:** NAO instalar. Ver `docs/audits/DECISAO_ling_3_0_tiny.md` para a
medicao completa. Resumo do que foi apurado:

```
GPU   Radeon RX 570, 4 GB VRAM   RAM 34,2 GB (4,9 GB livres no momento)
torch 2.13.0+cpu   cuda: False   hip: None        sglang/vllm: ausentes
ollama 0.35.1      25 modelos, zero Ling
```

Os quatro caminhos de execucao local morrem:

| Caminho | Motivo |
|---|---|
| SGLang | exige ROCm; `torch` aqui e CPU-only |
| vLLM | mesma dependencia; cairia para CPU |
| llama.cpp | atencao hibrida KDA+MLA e MoE de 128 experts: sem kernel |
| Ollama | 0.35.1 sem Ling no catalogo; `--experimental` no comando upstream |

E o ganho nao justifica: Ling-3.0-tiny marca 25 no Artificial Analysis
Intelligence Index, contra `gemma4:latest` (9,6 GB) e `qwen-pmev-math` (5,4 GB)
ja instalados e `required=true` no manifesto.

**Se a decisao mudar:** a prova de viabilidade de 4 passos esta no documento.
Nao tocar em `data/ollama_models.json` antes dela.

### Estado que motivou a pendencia (historico)

```
Ollama local: 25 modelos instalados, NENHUM Ling.
gemma4:latest  9.61 GB   <- ja funciona via Ollama (padrao atual)
qwen-pmev-math 5.44 GB   <- ja existe, matematica PMEV
```

**A pendencia original ("sem tag Ollama oficial") estava OBSOLETA desde o
inicio:** o proprio card do HF publica o caminho via Modelfile.

```bash
printf 'FROM /abs/path/to/bf16_weights\n' > /tmp/Modelfile.ling
./ollama create ling-tiny-bf16 --experimental -f /tmp/Modelfile.ling
```

O ponto tecnico que eu apontei — atencao hibrida KDA+MLA com 128 experts, sem
kernel no llama.cpp — se confirmou e matou o caminho 3. Os caminhos 1, 2 e 4
morreram por motivos diferentes (hardware e versao do runtime), medidos acima.

---

## 3. Auditoria de layout do `HandRanks.dat` — ⏳ ULTIMA POR DECISAO DO USUARIO

Ver documento proprio: `docs/audits/PENDENCIA_handranks_layout_audit.md`

**Resumo:** o blob tem 129.951.336 bytes / 32.487.834 slots uint32, nenhum
produtor no repo, nenhum consumidor. O `perfect_hash_key` de
`engine/hand_evaluator.py` **nao** endereca esse layout (documentado no
docstring da funcao). Verificar `sha256` contra o upstream do Kenny.

---

## 4. Como o gate usa esta fila

Nenhum destes bloqueia `sota:audit`.

```
engine/hand_evaluator.py    31 testes  ✅
engine/pmev_harness_icm.py  13 testes  ✅  (+ 52 verificacoes no --report)
Total suite nova            44 passed, 0 erros
```

Estado da fila:

| # | Item | Estado |
|---|---|---|
| 1 | Harness ICM/ChipEV | ✅ FECHADO |
| 2 | Ling via Ollama | ✅ FECHADO POR DECISAO |
| 3 | Auditoria de layout do `HandRanks.dat` | ⏳ ULTIMA (por decisao do usuario) |

Resta uma. Duas fechadas com o mesmo padrao: **medir antes de decidir**, e
registrar a decisao com o numero que a motivou, para que da proxima vez nao se
reabra discussao ja encerrada.