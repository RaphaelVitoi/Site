---
id: plano-frentes-abertas-2026-09-08
tipo: plano
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-08T22:50:00-03:00
atualizado_em: 2026-09-08T22:50:00-03:00
classes: [interno, medido, plano, seguranca, processo]
caminhos:
  - .github/workflows/sota-ci.yml
  - scripts/ops/cwv_gate.ps1
  - frontend/src/lib/engine/generated/vitoi_equity_engine.js
  - requirements.txt
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    CI VERMELHO EM 8 DE 8 EXECUCOES, desde 2026-09-08T13:02 ate
    2026-09-09T00:21. Medido por gh run list --workflow=sota-ci.yml. Nenhum
    handoff mencionava isso, e a auditoria de amplitude desta mesma sessao nao
    pegou -- eu nao havia olhado o CI.
  - >-
    CAUSA 1 (job Python): o passo "Ruff Linter & Formatter Validation" falha em
    ruff format --check, nao em ruff check. Reproduzido local: "All checks
    passed" no check, e "10 files would be reformatted, 601 files already
    formatted" no format.
  - >-
    OS 10 ARQUIVOS: engine/icm_matrix.py, llm/adapters.py, llm/free_router.py,
    llm/model_registry.py, scripts/cli/nexus.py,
    scripts/llm_inference/run_inference.py, tests/test_computational_molds.py,
    tests/test_cwv_gate_truthfulness.py, tests/test_record_index.py,
    tests/test_run_inference_contrato.py.
  - >-
    CAUSA 2 (job frontend): o passo "Regenerate and verify WASM bindings" falha
    no git diff --exit-code apos npm run wasm:build. O log do CI mostra que o
    binding regenerado ganha a funcao expectedResponseType e troca
    "export default __wbg_init; export { initSync };" por
    "export { initSync, __wbg_init as default };".
  - >-
    REPRODUCAO LOCAL DA CAUSA 2: rodei npm run wasm:build nesta maquina Windows
    com wasm-pack 0.15.0, a mesma versao que o CI instala. O resultado bate com
    o do CI -- expectedResponseType aparece duas vezes e a linha 510 do
    vitoi_equity_engine.js passa a ser
    "export { initSync, __wbg_init as default };". O diff e de 3 arquivos:
    o .js (11 insercoes, 16 delecoes) e os dois .wasm (61767 -> 61735 bytes).
    Logo os bindings versionados estavam DEFASADOS, e nao ha divergencia
    Windows/Linux no .js.
  - >-
    O CI RODA typecheck ANTES de build (.github/workflows/sota-ci.yml:119-120),
    e .next/ esta no .gitignore (linhas 20 e 29). No runner limpo, portanto,
    nem .next/types nem .next/dev/types existem no instante do typecheck.
  - >-
    frontend/tsconfig.json inclui next-env.d.ts explicitamente no campo include,
    junto de .next/types/**/*.ts.
  - >-
    PORTA CDP: cwv_gate.ps1:15 declara CdpPorts 9223 e 9222 nessa ordem. Probe
    no mesmo instante e mesma URL: 9222 devolve lcpMs 356,81 e
    longTaskBlockingMs 1137; 9223 devolve null nos dois. O processo da 9223
    (pid 15148) tem MainWindowHandle 0 e ZERO targets de tipo page.
  - >-
    FASE 3 DO PORTAO: grep por pip-audit, pip_audit, requirements.txt e osv em
    cwv_gate.ps1 devolve zero ocorrencias. secRules declara apenas
    CRITICAL_CVE_COUNT, HIGH_CVE_COUNT e TOTAL_VULNERABILITY, todas de origem
    npm.
  - >-
    PADRAO DE ACEITE JA EXISTENTE NO REPOSITORIO:
    data/a11y_manual_review_baselines.json vincula cada aprovacao a regra,
    alvos e SHA-256 da origem, com reviewer_authority e evidence. E o molde a
    seguir para um aceite de CVE Python.
  - >-
    SUITE PYTHON antes deste plano: 1020 passed, 1 skipped, zero warnings.
  - >-
    CONSUMO DOS SEIS SUBMODULOS que a branch de 2026-08-22 removia: grep por
    skills/<nome> em todo o repositorio, excluindo .venv, node_modules, skills
    e .git, nao devolve NENHUMA referencia em arquivo versionado. As unicas
    ocorrencias estao em .claude/.cache/chroma_db/chroma.sqlite3,
    .codeatlas/state.db, .git/config e .claude/settings.local.json -- e
    git ls-files confirma que nenhum desses esta no indice.
  - >-
    O plugin superpowers efetivamente carregado nesta sessao veio de
    C:/Users/rapha/.claude/plugins/cache/claude-plugins-official/superpowers/6.3.0/,
    fora do repositorio. O submodulo skills/superpowers e uma segunda copia sem
    consumidor.
nao_verificado:
  - >-
    Nao verifiquei se o .wasm binario regenerado nesta maquina Windows e
    byte a byte igual ao que o runner Ubuntu produz. O .js bate; o binario e a
    incognita, e so o push confirma. A Tarefa 2 traz o criterio de decisao caso
    nao bata.
  - >-
    Nao rodei o typecheck em arvore limpa sem .next/. A previsao da Tarefa 5 --
    de que o typecheck pode falhar assim que o CI destravar -- e inferencia a
    partir do include do tsconfig e da ordem dos passos, nao medicao.
  - >-
    Nao inspecionei arquivos nao rastreados dentro das tres worktrees. A
    Tarefa 6 comeca por essa verificacao, exatamente por isso.
  - >-
    Nao testei se derrubar a 9223 deixa o portao VERDE. E o falsificador da
    Tarefa 3 e ele so roda sob autorizacao.
  - >-
    Nao consegui estado atual da sessao Jules 6388626450245619671: a API
    devolve 401.
referencias_nao_resolviveis:
  - data/python_cve_acceptances.json
  - tests/test_cwv_gate_porta_cdp.py
---

# Conclusao das frentes abertas -- plano de implementacao

> **Para executores agenticos:** este plano deve ser executado tarefa a tarefa.
> Os passos usam caixas (`- [ ]`) para acompanhamento. Cada tarefa termina num
> entregavel testavel de forma independente.

**Objetivo:** fechar as nove frentes abertas medidas na
`auditoria-2026-09-08-o-que-esta-em-aberto-na-malha`, comecando pelas duas que
mantem o CI vermelho ha seis dias.

**Arquitetura:** as tarefas estao ordenadas por impacto dividido pelo raio de
alteracao, como a secao 10.2 do CLAUDE.md exige -- e empate se resolve pelo
menor raio. As quatro primeiras sao aditivas e reversiveis. As tarefas
marcadas **GATE TIER 0** nao comecam sem autorizacao explicita, e o motivo de
cada uma esta dito no lugar.

**Spec:** `reports/AUDITORIA-2026-09-08-o-que-esta-em-aberto-na-malha.md`

**Duas referencias declaradas como nao resolviveis.**
`data/python_cve_acceptances.json` (Tarefa 4) e `tests/test_cwv_gate_porta_cdp.py`
(Tarefa 3) sao artefatos que este plano **cria** -- citar o que ainda nao
existe e a natureza de um plano, nao referencia morta. O `record_gate.py`
reprovou os dois na primeira tentativa, e ele estava certo: quem separa
"aponta para o vazio" de "vai passar a existir" e a declaracao do autor, nao a
forma da citacao.

## Restricoes globais

Valem para toda tarefa, sem excecao:

- **Nunca `--no-verify` nem `SKIP_CWV_GATE=1`** (CLAUDE.md secao 1).
- **Identidade nomeada em cada commit**: o `git config` do repositorio aponta
  para outra linhagem, entao todo commit sai com
  `git -c user.name="..." -c user.email="noreply@anthropic.com"`, e a autoria
  se confere com `git log --format` **antes** do push.
- **Corpo do commit declara `Assinatura:` e `Proposito:`** (CLAUDE.md secao 7).
- **Encoding**: todo `.ps1` criado ou modificado preserva UTF-8 **com** BOM,
  BOM unico (CLAUDE.md secao 6.4).
- **Antes de cada commit que toque o frontend**, aqueca a pagina e confira qual
  porta CDP o portao vai usar -- ver Tarefa 3; enquanto ela nao rodar, conte
  com uma vaga de warning ja gasta.
- **Suite verde e obrigatoria**: `1020 passed, 1 skipped` e a linha de base.
  Qualquer tarefa que a reduza esta errada.
- **A Tarefa 9 nao comeca antes da 1 e da 2.** Corrigir achado de produto com o
  CI vermelho impede saber se a correcao quebrou algo.

## Estrutura de arquivos

| Arquivo | Responsabilidade | Tarefa |
| :--- | :--- | ---: |
| 10 arquivos `.py` listados no frontmatter | formatacao Ruff | 1 |
| `frontend/src/lib/engine/generated/*` + `frontend/public/wasm/*.wasm` | bindings WASM regenerados | 2 |
| `scripts/ops/cwv_gate.ps1` | selecao de porta CDP por pagina visivel | 3 |
| `tests/test_cwv_gate_porta_cdp.py` | guarda da Tarefa 3 | 3 |
| `scripts/ops/cwv_gate.ps1` | fase 3 passa a auditar Python | 4 |
| `data/python_cve_acceptances.json` | aceites de CVE Python, com parecer | 4 |
| `tests/test_cwv_gate_cobertura_cve.py` | guarda da Tarefa 4 (arquivo ja existe) | 4 |
| `.gitignore` + `frontend/tsconfig.json` | fim da oscilacao do next-env | 5 |

---

## Tarefa 1: CI verde, metade Python -- `ruff format`

**Impacto ÷ raio:** o maior do plano. Destrava metade do CI; o raio e
formatacao automatica em 10 arquivos, sem uma linha de logica alterada.

**Arquivos:**
- Modificar: `engine/icm_matrix.py`, `llm/adapters.py`, `llm/free_router.py`,
  `llm/model_registry.py`, `scripts/cli/nexus.py`,
  `scripts/llm_inference/run_inference.py`,
  `tests/test_computational_molds.py`, `tests/test_cwv_gate_truthfulness.py`,
  `tests/test_record_index.py`, `tests/test_run_inference_contrato.py`

**Interfaces:**
- Consome: nada.
- Produz: arvore que satisfaz `ruff format --check .`. A Tarefa 2 depende disso
  para que o CI chegue ao job do frontend com o job Python verde.

- [ ] **Passo 1: reproduzir a falha exatamente como o CI a ve**

```bash
.venv/Scripts/python.exe -m ruff format --check .
```
Esperado: exit 1, e a ultima linha `10 files would be reformatted, 601 files already formatted`.

- [ ] **Passo 2: confirmar que o `ruff check` NAO e a causa**

```bash
.venv/Scripts/python.exe -m ruff check .
```
Esperado: `All checks passed!`, exit 0. Se este passo falhar, **pare**: a causa
mudou desde a medicao e o plano precisa ser refeito.

- [ ] **Passo 3: aplicar a formatacao**

```bash
.venv/Scripts/python.exe -m ruff format .
```
Esperado: `10 files reformatted, 601 files left unchanged`.

- [ ] **Passo 4: conferir que so houve mudanca de formatacao**

```bash
git diff --stat
git diff -- llm/model_registry.py
```
As mudancas sao de espaco em fatia (`prizes[len(active) :]`) e quebra de string.
**Se algum diff alterar valor, nome ou fluxo, reverta o arquivo** com
`git checkout -- <arquivo>` e trate-o a mao: `ruff format` nao deveria mudar
semantica, e se mudou, isso e o achado.

- [ ] **Passo 5: rodar a suite pelo PowerShell**

`llm/model_registry.py` e `llm/adapters.py` sao fonte unica (CLAUDE.md secao 3),
entao a suite e obrigatoria aqui, nao opcional.

```powershell
.venv\Scripts\python.exe -m pytest -q --no-header
```
Esperado: `1020 passed, 1 skipped`, zero warnings.

- [ ] **Passo 6: confirmar que o criterio do CI agora passa**

```bash
.venv/Scripts/python.exe -m ruff format --check . && .venv/Scripts/python.exe -m ruff check .
```
Esperado: exit 0 nos dois.

- [ ] **Passo 7: commit**

```bash
git add -A -- engine llm scripts tests
git -c user.name="<agente>" -c user.email="noreply@anthropic.com" commit -F - <<'MSG'
style(ruff): aplicar ruff format nos 10 arquivos que mantinham o CI vermelho

O job Python do CI falha desde 2026-09-08T13:02, em 8 de 8 execucoes. A causa
nao era ruff check, que passa: era ruff format --check, que reprovava 10
arquivos. Nenhuma linha de logica muda -- as diferencas sao espaco em fatia e
quebra de string.

Assinatura: <agente> [Tier 1.B]
Proposito: restabelecer o job Python do CI; escopo restrito a formatacao.
MSG
```

---

## Tarefa 2: CI verde, metade frontend -- bindings WASM defasados

**Impacto ÷ raio:** destrava a outra metade do CI. Raio: tres arquivos
**gerados**, nenhum escrito a mao.

**Arquivos:**
- Modificar: `frontend/src/lib/engine/generated/vitoi_equity_engine.js`,
  `frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm`,
  `frontend/public/wasm/vitoi_equity_engine_bg.wasm`

**Interfaces:**
- Consome: job Python verde da Tarefa 1 (o CI so avanca com ele).
- Produz: `git diff --exit-code` limpo apos `npm run wasm:build`, que e
  exatamente o que `.github/workflows/sota-ci.yml:114-115` verifica.

> **Estado ja alcancado nesta sessao:** o `npm run wasm:build` **ja foi
> executado** durante a auditoria, e o diff dos tres arquivos esta no working
> tree. Os passos 1 e 2 confirmam esse estado em vez de recria-lo. Se a arvore
> tiver sido limpa, rode o passo 1.

- [ ] **Passo 1: regenerar (ou confirmar o ja regenerado)**

```bash
npm run wasm:build
git diff --stat -- frontend/src/lib/engine/generated frontend/public/wasm/vitoi_equity_engine_bg.wasm
```
Esperado: 3 arquivos, `.js` com ~11 insercoes e ~16 delecoes, os dois `.wasm`
de 61767 para 61735 bytes.

- [ ] **Passo 2: provar que o resultado local bate com o que o CI produziu**

Este e o passo que impede commitar um binding diferente do que o runner espera.

```bash
grep -c "expectedResponseType" frontend/src/lib/engine/generated/vitoi_equity_engine.js
grep -n "export { initSync, __wbg_init as default };" frontend/src/lib/engine/generated/vitoi_equity_engine.js
```
Esperado: `2`, e a linha `510`. As duas marcas vieram do log do CI. Se
divergirem, **pare**: a versao do `wasm-bindgen` mudou dos dois lados e o plano
precisa ser refeito.

- [ ] **Passo 3: rodar a suite de frontend**

O `.js` e consumido em runtime; formatacao nao basta.

```bash
npm run test
```
Esperado: suite de frontend verde. Se algum teste referenciar
`export default __wbg_init` diretamente, ajuste o **teste**, nao o gerado.

- [ ] **Passo 4: commit**

```bash
git add frontend/src/lib/engine/generated frontend/public/wasm/vitoi_equity_engine_bg.wasm
git -c user.name="<agente>" -c user.email="noreply@anthropic.com" commit -F - <<'MSG'
build(wasm): regenerar os bindings defasados que reprovavam o CI

O passo "Regenerate and verify WASM bindings" falha desde 2026-09-08 porque o
git diff --exit-code acusa que o binding versionado difere do regenerado. A
regeneracao local com wasm-pack 0.15.0 -- a mesma versao que o CI instala --
reproduz exatamente o que o runner produziu: expectedResponseType aparece, e o
export default vira "export { initSync, __wbg_init as default }".

Nao ha divergencia Windows/Linux no .js: os bindings estavam simplesmente
defasados em relacao ao wasm-bindgen que o Cargo.lock resolve hoje.

Assinatura: <agente> [Tier 1.B]
Proposito: restabelecer o job de frontend do CI; escopo restrito a artefatos
gerados.
MSG
```

- [ ] **Passo 5: push e observacao do CI -- este e o unico teste real**

```bash
git push origin master
gh run list --workflow=sota-ci.yml --limit 1
```

**Criterio de decisao se o job ainda falhar no passo WASM:** entao o `.wasm`
binario **nao** e reprodutivel entre Windows e Ubuntu, e a correcao muda de
natureza. Nesse caso, **nao** repita o ciclo de regenerar e commitar -- ele nao
converge. As duas saidas, em ordem:
1. restringir a verificacao do CI aos artefatos textuais
   (`frontend/src/lib/engine/generated/*.js` e `*.d.ts`), deixando o `.wasm`
   fora do `git diff --exit-code`, e declarar isso no workflow com o motivo;
2. gerar o `.wasm` em container Linux tambem localmente, tornando a
   reprodutibilidade um requisito explicito.
A escolha entre as duas e do Tier 0, porque a primeira reduz cobertura.

---

## Tarefa 3: o portao mede pela porta que enxerga -- GATE TIER 0

**GATE:** altera `scripts/ops/cwv_gate.ps1`, que a secao 10.3 do CLAUDE.md
protege -- *um agente nao altera o instrumento que o mede*. Nao comece sem
autorizacao explicita.

**Impacto ÷ raio:** recupera uma das duas vagas de warning em **todo** commit.
Raio: uma funcao no portao e um teste.

**Arquivos:**
- Modificar: `scripts/ops/cwv_gate.ps1:61-80` (bloco de handshake CDP)
- Criar: `tests/test_cwv_gate_porta_cdp.py`

**Interfaces:**
- Consome: nada.
- Produz: `$cdpPort` passa a ser a primeira porta que responde **e** tem ao
  menos um target `type=page`. As demais fases seguem lendo `$cdpPort` como
  hoje; nenhuma assinatura muda.

- [ ] **Passo 1: escrever o teste que falha**

O teste le o script, como `test_cwv_gate_cobertura_cve.py` ja faz -- rodar o
portao exigiria Chrome e rede.

```python
"""Guarda da selecao de porta CDP na fase 1.

Medido em 2026-09-08: as portas 9223 e 9222 respondiam /json/version, e o
portao parava na primeira. So que o Chrome da 9223 tinha MainWindowHandle 0 e
ZERO targets de tipo page. Probe no mesmo instante e mesma URL: 9222 devolveu
lcpMs 356,81 e longTaskBlockingMs 1137; 9223 devolveu null nos dois. CLS, TTFB
e heap mediram nas duas, porque nao dependem de visibilidade.

LargestContentfulPaint nao e emitido para pagina que inicia oculta. Responder
ao handshake, portanto, nao prova que a porta mede.
"""

from __future__ import annotations

from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
GATE = RAIZ / "scripts" / "ops" / "cwv_gate.ps1"


@pytest.fixture(scope="module")
def gate_texto() -> str:
    assert GATE.is_file(), f"portao nao encontrado em {GATE}"
    return GATE.read_text(encoding="utf-8-sig")


def test_handshake_exige_pagina_visivel(gate_texto: str):
    assert "/json/list" in gate_texto, (
        "o handshake CDP voltou a aceitar uma porta so por ela responder "
        "/json/version. Uma porta sem target `type=page` responde ao handshake "
        "e nao mede LCP."
    )


def test_selecao_conta_targets_de_tipo_page(gate_texto: str):
    assert "'page'" in gate_texto or '"page"' in gate_texto, (
        "a contagem de targets de tipo page sumiu da selecao de porta CDP."
    )


def test_porta_sem_pagina_e_declarada_e_nao_silenciada(gate_texto: str):
    assert "sem pagina visivel" in gate_texto, (
        "a porta descartada por nao ter pagina precisa ser DECLARADA na saida. "
        "Descartar em silencio devolve o defeito que esta guarda existe para "
        "impedir: o portao mediria por outra porta sem dizer por que."
    )
```

- [ ] **Passo 2: rodar o teste e ver falhar**

```powershell
.venv\Scripts\python.exe -m pytest tests/test_cwv_gate_porta_cdp.py -v
```
Esperado: os tres FALHAM (`/json/list` ainda nao existe no portao).

- [ ] **Passo 3: implementar a selecao no portao**

Substituir o bloco de handshake (`cwv_gate.ps1`, a partir da linha 61) por:

```powershell
# CDP Handshake. MEDIDO EM 2026-09-08: responder ao handshake NAO prova que a
# porta mede. As duas portas respondiam /json/version, e o Chrome da 9223 tinha
# MainWindowHandle 0 e zero targets `type=page`. Probe no mesmo instante:
# 9222 devolveu lcpMs 356,81 e longTaskBlockingMs 1137; 9223, null nos dois.
# LargestContentfulPaint nao e emitido para pagina que inicia oculta, e long
# task nao ocorre em aba sem renderizacao -- por isso falham exatamente as duas
# metricas que dependem de visibilidade, e CLS/TTFB/heap medem nas duas.
$cdpActive = $false
$cdpPort = $null
$cdpDescartadas = @()
foreach ($port in $CdpPorts) {
    try {
        $cdpVer = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/version" -TimeoutSec 2
        if (-not ($cdpVer -and $cdpVer.Browser)) { continue }
        $alvos = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list" -TimeoutSec 2
        $paginas = @($alvos | Where-Object { $_.type -eq 'page' }).Count
        if ($paginas -lt 1) {
            $cdpDescartadas += "${port} (sem pagina visivel)"
            continue
        }
        $cdpActive = $true
        $cdpPort = $port
        Write-Host "[CDP] Active runtime connection on ${port}: $($cdpVer.Browser) -- $paginas pagina(s)" -ForegroundColor Green
        break
    } catch {
        continue
    }
}

if ($cdpDescartadas.Count -gt 0) {
    Write-Host "[CDP] Descartadas por nao medirem LCP: $($cdpDescartadas -join ', ')" -ForegroundColor DarkYellow
}
```

- [ ] **Passo 4: rodar o teste e ver passar**

```powershell
.venv\Scripts\python.exe -m pytest tests/test_cwv_gate_porta_cdp.py -v
```
Esperado: 3 passed.

- [ ] **Passo 5: provar o comportamento de ponta a ponta -- o falsificador**

Com a 9223 de pe e sem pagina, rodar o portao deve agora **cair para a 9222 e
ficar VERDE**, imprimindo a linha de descarte.

```powershell
pwsh -NoProfile -File scripts\ops\cwv_gate.ps1
```
Esperado: `[CDP] Descartadas por nao medirem LCP: 9223 (sem pagina visivel)`,
`LCP_MS` com valor, e `Total de Warnings: 0`.

**Se o warning `cwv.cobertura` persistir**, a atribuicao da auditoria estava
errada e a causa e outra -- pare e meça de novo em vez de ajustar o portao.

- [ ] **Passo 6: rodar a suite inteira**

```powershell
.venv\Scripts\python.exe -m pytest -q --no-header
```
Esperado: `1023 passed, 1 skipped` (os 3 novos).

- [ ] **Passo 7: commit**

```bash
git add scripts/ops/cwv_gate.ps1 tests/test_cwv_gate_porta_cdp.py
git -c user.name="<agente>" -c user.email="noreply@anthropic.com" commit -F - <<'MSG'
fix(portao): escolher a porta CDP que enxerga, nao a primeira que responde

Medido em 2026-09-08: 9223 e 9222 respondiam ao handshake e o portao parava na
primeira. O Chrome da 9223 tem MainWindowHandle 0 e zero targets `type=page`.
Probe no mesmo instante e mesma URL: 9222 devolve lcpMs 356,81 e
longTaskBlockingMs 1137; 9223 devolve null nos dois. CLS, TTFB e heap medem nas
duas -- nao dependem de visibilidade.

O warning cwv.cobertura era por isso ESTRUTURAL: reaparecia em todo commit e
gastava uma das duas vagas, sem nada de errado com o codigo medido.

A porta descartada e declarada na saida, nunca silenciada.

Assinatura: <agente> [Tier 1.B]
Proposito: fazer a fase 1 medir pela porta capaz de medir; escopo restrito ao
handshake CDP e sua guarda.
MSG
```

---

## Tarefa 4: a fase 3 passa a ver Python -- GATE TIER 0

**GATE:** mesmo motivo da Tarefa 3, e ainda cria uma regra que pode **barrar
commits**. Nao comece sem autorizacao.

**Impacto ÷ raio:** o portao deixa de dizer "CVE zero" quando quer dizer "zero
CVEs npm". Raio: um bloco novo na fase 3, um arquivo de aceites, testes.

**Arquivos:**
- Modificar: `scripts/ops/cwv_gate.ps1` (tabela `secRules:523-527` e a fase 3)
- Criar: `data/python_cve_acceptances.json`
- Modificar: `tests/test_cwv_gate_cobertura_cve.py`

**Interfaces:**
- Consome: nada.
- Produz: `PY_CVE_ABERTAS` em `$secRules`, com `Limit = 0`; e o contrato do
  arquivo de aceites, cujo formato espelha
  `data/a11y_manual_review_baselines.json`.

> **Por que aceite, e nao supressao.** As quatro CVEs do `chromadb` nao tem
> versao de correcao -- `1.5.9` e a ultima no PyPI. Sem um mecanismo de aceite
> com parecer, a unica forma de commitar seria desligar a verificacao, e ai ela
> nao teria servido para nada. O repositorio ja resolveu esse problema uma vez,
> em `data/a11y_manual_review_baselines.json`; esta tarefa copia aquele molde.

- [ ] **Passo 1: escrever o aceite do chromadb**

Criar `data/python_cve_acceptances.json`:

```json
{
  "schema_version": "1.0",
  "proposito": "Aceites de CVE Python sem versao de correcao disponivel. Um aceite e estritamente vinculado ao ID, ao pacote e a versao; qualquer divergencia expira o aceite e devolve o item para revisao. Aceite NAO e supressao: o portao continua contando a CVE e exigindo que ela esteja aqui, com parecer.",
  "acceptances": [
    {
      "id": "chromadb-servidor-nao-alcancavel-20260908",
      "status": "accepted",
      "accepted_at": "2026-09-08",
      "reviewer_authority": "Tier 0 -- Raphael Vitoi",
      "package": "chromadb",
      "version": "1.5.9",
      "vulnerability_ids": [
        "PYSEC-2026-311",
        "CVE-2026-45830",
        "CVE-2026-45831",
        "CVE-2026-45833"
      ],
      "evidence": {
        "vetor": "As quatro sao do servidor HTTP do Chroma: endpoints de tenants e databases, autorizacao entre tenants, e SimpleRBACAuthorizationProvider. A mais grave, PYSEC-2026-311, e pre-autenticacao, CVSS 4.0 AV:N/AC:L/PR:N/UI:N/VC:H/VI:H/VA:H.",
        "alcance_medido": "Grep em todo o repositorio por HttpClient, chroma run, o cliente HTTP do chromadb e trust_remote_code, em .py/.ps1/.json/.yml, excluindo .venv e node_modules, devolveu UMA ocorrencia: do.ps1:776, que e System.Net.Http.HttpClient do .NET e nada tem com Chroma.",
        "consumo_real": "Cliente persistente embarcado, em memory_rag.py:208 e scripts/utils/ingest_rag.py:27. requirements.txt:26 ja declarava exatamente isso.",
        "ausencia_de_correcao": "A API do PyPI devolve 1.5.9 como ultima versao publicada. Nao existe versao para a qual atualizar.",
        "registro": "reports/AUDITORIA-2026-09-08-o-que-esta-em-aberto-na-malha.md"
      },
      "expira_se": "Qualquer uso do servidor HTTP do Chroma for introduzido, ou uma versao corrigida for publicada no PyPI.",
      "revisar_em": "2026-12-08"
    }
  ]
}
```

- [ ] **Passo 2: escrever o teste que falha**

Acrescentar a `tests/test_cwv_gate_cobertura_cve.py`:

```python
def test_fase_cve_audita_a_declaracao_python(gate_texto: str):
    """Medido em 2026-09-08: a fase 3 rodava npm audit e mais nada.

    Grep por pip-audit, pip_audit, requirements.txt e osv no portao devolvia
    zero ocorrencias, enquanto 4 CVEs abertas em chromadb 1.5.9 passavam em
    todo commit. "CVE zero" queria dizer "zero CVEs npm".
    """
    assert "pip_audit" in gate_texto or "pip-audit" in gate_texto, (
        "a fase 3 voltou a auditar so o npm. A secao 2 do CLAUDE.md exige "
        "pip_audit -r requirements.txt, e sem executor a regra nao mede nada."
    )


def test_aceite_python_e_exigido_e_nao_suprime(gate_texto: str):
    assert "python_cve_acceptances" in gate_texto, (
        "o arquivo de aceites sumiu da fase 3. Sem ele, a unica forma de "
        "commitar com uma CVE sem correcao seria desligar a verificacao."
    )
    assert "PY_CVE_ABERTAS" in gate_texto, (
        "a metrica de CVEs Python nao aceitas sumiu de secRules."
    )
```

- [ ] **Passo 3: rodar e ver falhar**

```powershell
.venv\Scripts\python.exe -m pytest tests/test_cwv_gate_cobertura_cve.py -v
```
Esperado: os dois novos FALHAM.

- [ ] **Passo 4: acrescentar a metrica a tabela**

Em `cwv_gate.ps1:523-527`, dentro de `$secRules`:

```powershell
    "PY_CVE_ABERTAS"     = @{ Val = 0; Limit = 0; Unit = "cves"; Desc = "Python CVEs in requirements.txt without a recorded acceptance" }
```

- [ ] **Passo 5: implementar a auditoria Python na fase 3**

Inserir **antes** do laco `foreach ($k in $secRules.Keys)`:

```powershell
# AUDITORIA PYTHON (2026-09-08). Ate aqui a fase rodava npm audit e mais nada,
# e "CVE zero" queria dizer "zero CVEs npm". Quatro CVEs abertas em chromadb
# 1.5.9 passaram em todo commit sem que nada acusasse.
#
# FALHA FECHADA, como o npm: se o pip-audit nao rodar, isso e ERRO, nao zero.
$pyAceites = @()
$pyAceitesPath = Join-Path $RepoRoot 'data\python_cve_acceptances.json'
if (Test-Path -LiteralPath $pyAceitesPath -PathType Leaf) {
    try {
        $pyAceitesDoc = Get-Content -LiteralPath $pyAceitesPath -Raw -Encoding utf8 | ConvertFrom-Json
        foreach ($a in @($pyAceitesDoc.acceptances)) {
            if ($a.status -ne 'accepted') { continue }
            foreach ($vid in @($a.vulnerability_ids)) {
                $pyAceites += "$($a.package)|$($a.version)|$vid"
            }
        }
    } catch {
        $pyCveErro = "arquivo de aceites ilegivel: $($_.Exception.Message)"
    }
}

$pyRequirements = Join-Path $RepoRoot 'requirements.txt'
$pyCveMedido = $false
$pyNaoAceitas = @()
if (-not $pyCveErro) {
    if (-not (Test-Path -LiteralPath $pyRequirements -PathType Leaf)) {
        $pyCveErro = 'requirements.txt ausente'
    } else {
        try {
            $pyVenv = Join-Path $RepoRoot '.venv\Scripts\python.exe'
            $pyExe = if (Test-Path -LiteralPath $pyVenv) { $pyVenv } else { 'python' }
            $pyRaw = (& $pyExe -m pip_audit -r $pyRequirements --format json 2>&1 | Out-String).Trim()
            $pyFirst = $pyRaw.IndexOf('{')
            $pyLast = $pyRaw.LastIndexOf('}')
            if ($pyFirst -lt 0 -or $pyLast -le $pyFirst) {
                $trecho = $pyRaw.Substring(0, [Math]::Min(120, $pyRaw.Length))
                $pyCveErro = "pip_audit nao devolveu JSON: $trecho"
            } else {
                $pyDoc = $pyRaw.Substring($pyFirst, $pyLast - $pyFirst + 1) | ConvertFrom-Json
                foreach ($dep in @($pyDoc.dependencies)) {
                    foreach ($v in @($dep.vulns)) {
                        $chave = "$($dep.name)|$($dep.version)|$($v.id)"
                        if ($pyAceites -notcontains $chave) { $pyNaoAceitas += $chave }
                    }
                }
                $secRules["PY_CVE_ABERTAS"].Val = $pyNaoAceitas.Count
                $pyCveMedido = $true
            }
        } catch {
            $pyCveErro = "excecao ao rodar pip_audit: $($_.Exception.Message)"
        }
    }
}

$pyStatus = if ($pyCveMedido) { "[PASS]" } else { "[FAIL]" }
$pyColor  = if ($pyCveMedido) { "Green" } else { "Red" }
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'PY_CVE_AUDIT_EXECUTADO', $(if ($pyCveMedido) { 'sim' } else { 'NAO' }), 'sim', $pyStatus) -ForegroundColor $pyColor
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'PY_CVE_ACEITAS', "$($pyAceites.Count) aceites", '-', 'INFO') -ForegroundColor DarkGray
if (-not $pyCveMedido) {
    Write-Host "   motivo: $pyCveErro" -ForegroundColor Red
    Add-QualityFinding -Severity 'ERROR' -Component 'security.python.execucao' -Detail 'O audit de CVE Python nao executou.' -Reason "$pyCveErro. Zero por ausencia de medicao nao e resultado de seguranca." -Action 'Corrigir a disponibilidade do pip_audit ou a falha de JSON indicada, executar pip_audit -r requirements.txt com sucesso e somente entao avaliar a contagem.'
} elseif ($pyNaoAceitas.Count -gt 0) {
    Add-QualityFinding -Severity 'ERROR' -Component 'security.python.aberta' -Detail "CVE Python sem aceite: $($pyNaoAceitas -join ', ')" -Reason 'A CVE consta em requirements.txt e nao ha aceite registrado com parecer.' -Action 'Atualizar a dependencia, ou registrar o aceite em data/python_cve_acceptances.json com vetor, alcance medido, consumo real e autoridade -- nunca suprimir a verificacao.'
}
```

- [ ] **Passo 6: rodar o teste e ver passar**

```powershell
.venv\Scripts\python.exe -m pytest tests/test_cwv_gate_cobertura_cve.py -v
```
Esperado: todos passam.

- [ ] **Passo 7: provar os dois lados do contrato**

O aceite tem que **permitir** o chromadb e **barrar** o que nao esta aceito.

```powershell
pwsh -NoProfile -File scripts\ops\cwv_gate.ps1
```
Esperado: `PY_CVE_ABERTAS | 0 cves | <= 0 | [PASS]`, `PY_CVE_AUDIT_EXECUTADO | sim`, `PY_CVE_ACEITAS | 4 aceites`.

Depois, prova negativa -- remova temporariamente um dos quatro IDs do arquivo
de aceites e rode de novo. Esperado: **ERROR** nomeando aquele ID. Restaure o
arquivo em seguida. **Sem essa prova negativa o aceite pode estar aceitando
tudo, e nao se saberia.**

- [ ] **Passo 8: rodar a suite e commitar**

```powershell
.venv\Scripts\python.exe -m pytest -q --no-header
```

```bash
git add scripts/ops/cwv_gate.ps1 data/python_cve_acceptances.json tests/test_cwv_gate_cobertura_cve.py
git -c user.name="<agente>" -c user.email="noreply@anthropic.com" commit -F - <<'MSG'
feat(portao): a fase 3 passa a auditar a declaracao Python, com aceite e parecer

Medido em 2026-09-08: grep por pip-audit, pip_audit, requirements.txt e osv em
cwv_gate.ps1 devolvia ZERO ocorrencias. A fase rodava npm audit e mais nada,
entao "CVE zero" queria dizer "zero CVEs npm" -- e quatro CVEs abertas em
chromadb 1.5.9 passavam em todo commit. O proprio portao ja tinha a frase certa
escrita a respeito do npm: zero por ausencia de medicao nao e resultado de
seguranca.

Falha fechada, como o npm: pip_audit que nao roda e ERRO, nao zero.

O aceite NAO e supressao. As quatro CVEs do chromadb nao tem correcao -- 1.5.9
e a ultima no PyPI -- e o vetor das quatro e o servidor HTTP do Chroma, que
este projeto nao sobe (medido por grep em todo o repositorio). Sem mecanismo de
aceite, a unica saida seria desligar a verificacao. O formato espelha
data/a11y_manual_review_baselines.json, que ja resolvia esse problema aqui.

Assinatura: <agente> [Tier 1.B]
Proposito: fechar a lacuna de cobertura Python da fase 3 sem suprimir achado.
MSG
```

---

## Tarefa 5: `next-env.d.ts` para de gravar estado

**Ordem:** so depois das Tarefas 1 e 2. Elas destravam o CI, e o typecheck
voltara a rodar pela primeira vez em dias -- possivelmente descobrindo este
defeito sozinho.

**Previsao falsificavel:** com o CI destravado, `npm run typecheck`
(`sota-ci.yml:119`) roda **antes** de `npm run build`, e `.next/` esta no
`.gitignore`. Nem `.next/types` nem `.next/dev/types` existem naquele instante,
e `frontend/tsconfig.json` inclui `next-env.d.ts` explicitamente. **Se o
typecheck falhar com TS2307 apontando um desses caminhos, esta previsao se
confirmou.** Se passar, o TypeScript tolera o import ausente e este item volta
a ser apenas ruido de commit.

**Arquivos:**
- Modificar: `.gitignore`
- Verificar: `frontend/tsconfig.json:include`

- [ ] **Passo 1: observar o resultado do typecheck no CI destravado**

```bash
RID=$(gh run list --workflow=sota-ci.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run view "$RID" --log 2>&1 | grep -A5 "TypeScript Strict Type Check"
```

- [ ] **Passo 2: reproduzir em arvore limpa, seja qual for o resultado acima**

```bash
mv frontend/.next /tmp/next-backup && npm run typecheck; echo "exit=$?"; mv /tmp/next-backup frontend/.next
```
Esperado se a previsao se confirmar: erro apontando `.next/dev/types/routes.d.ts`
ou `.next/types/routes.d.ts`.

- [ ] **Passo 3: ignorar o arquivo**

```bash
printf '\n# Gerado por next dev/build; o conteudo alterna entre .next/types e\n# .next/dev/types conforme o ultimo comando, e versiona-lo produziu seis\n# commits consecutivos de reversao mutua (2026-09-08).\nfrontend/next-env.d.ts\n' >> .gitignore
git rm --cached frontend/next-env.d.ts
```

- [ ] **Passo 4: garantir que o CI gera o arquivo antes do typecheck**

Sem isto o passo 3 quebra o CI. Em `.github/workflows/sota-ci.yml`, o passo
"TypeScript Strict Type Check and production build" passa a ser:

```yaml
      - name: 🔍 TypeScript Strict Type Check and production build
        run: |
          npm run build
          npm run typecheck
```

A inversao e a correcao real: `next build` gera `next-env.d.ts` e
`.next/types/`, que o typecheck consome. Rodar typecheck antes do build sempre
foi ordem errada -- o arquivo versionado apenas mascarava isso.

- [ ] **Passo 5: provar em arvore limpa**

```bash
rm -f frontend/next-env.d.ts && rm -rf frontend/.next && npm run build && npm run typecheck; echo "exit=$?"
```
Esperado: exit 0, e `frontend/next-env.d.ts` recriado pelo build.

- [ ] **Passo 6: commit**

```bash
git add .gitignore .github/workflows/sota-ci.yml
git -c user.name="<agente>" -c user.email="noreply@anthropic.com" commit -F - <<'MSG'
build(ci): parar de versionar next-env.d.ts e rodar build antes do typecheck

O arquivo e gerado e grava qual comando rodou por ultimo: importa
.next/types quando veio de next build, .next/dev/types quando veio de next dev.
Medido em seis commits consecutivos, a alternancia e perfeita, seis de seis --
cada sessao gravava a forma que calhou e a seguinte revertia. Nenhum daqueles
commits foi uma decisao.

Versiona-lo mascarava uma ordem errada no CI: typecheck rodava antes de build,
e .next/ e ignorado, entao no runner limpo o alvo do import nao existia em
nenhuma das duas formas. Invertida a ordem, o build gera o arquivo e o
typecheck o consome.

Assinatura: <agente> [Tier 1.B]
Proposito: eliminar ruido de commit e corrigir a ordem dos passos do CI.
MSG
```

---

## Tarefa 6: as tres worktrees -- GATE TIER 0

**GATE:** remove diretorios. Destrutivo.

- [ ] **Passo 1: verificar se ha trabalho nao commitado -- antes de qualquer coisa**

```bash
for w in dependency-boundary-plan-20260901 integrate-agent-handoff-20260901 integrate-pmev-contracts-20260901; do
  echo "=== $w"; git -C "/c/Users/rapha/.gemini/Site-worktrees/$w" status --porcelain
done
```
**Se qualquer uma tiver saida, pare** e trate aquela worktree isoladamente. A
auditoria mediu apenas que nao ha commits fora de master; arquivo nao
rastreado nao foi verificado.

- [ ] **Passo 2: reconfirmar que nada falta em master**

```bash
for b in integrate/agent-handoff-facts-20260901 integrate/dependency-boundary-plan-20260901 integrate/pmev-contracts-20260901; do
  echo "$b -> $(git rev-list --count master..$b) commit(s) fora de master"
done
```
Esperado: `0` nas tres.

- [ ] **Passo 3: remover, so entao**

```bash
git worktree remove /c/Users/rapha/.gemini/Site-worktrees/dependency-boundary-plan-20260901
git worktree remove /c/Users/rapha/.gemini/Site-worktrees/integrate-agent-handoff-20260901
git worktree remove /c/Users/rapha/.gemini/Site-worktrees/integrate-pmev-contracts-20260901
git worktree prune
git worktree list
```
Esperado: so a principal. Recupera 5,5 GB.

- [ ] **Passo 4: decidir sobre as branches**

As branches remotas `integrate/*` permanecem. Se o trabalho esta em master,
apaga-las e coerente -- mas isso e decisao do Tier 0, e nao ha custo em
mante-las.

---

## Tarefa 7: a branch de 2026-08-22 -- GATE TIER 0, decisao

**Nao ha passo tecnico primeiro: ha uma decisao.** `git rev-list` ja disse o
que precisava. A branch esta `behind 294`, e os tres arquivos que ela toca sao
fonte unica que divergiu 933, 376 e 339 linhas.

**Recomendacao ordenada, com o criterio explicito:**

1. **Reextrair como trabalho novo (recomendado).** A intencao -- remover seis
   submodulos de `skills/` -- continua valida ou nao, independentemente
   daquela branch. Feita hoje sobre o master atual, e um commit pequeno; feita
   por merge, e reescrever tres fontes unicas a partir de dezessete dias atras.
2. **Abandonar formalmente.** `git branch -D` local e apagar a remota,
   registrando o motivo. So se a intencao nao valer mais.
3. **Manter parada, declarando-o.** Pior das tres: e o estado atual, e o estado
   atual e justamente o problema -- ela existe sem que nada diga o que e.

- [ ] **Passo 1: a medicao ja esta feita -- confirme antes de agir**

Medido em 2026-09-08 para os seis submodulos que a branch removia:

```bash
for s in gemini-cli-jules gemini-cli-security gemini-deep-research gemini-supermemory superpowers token-efficiency; do
  echo "=== $s"; grep -rl --exclude-dir=.venv --exclude-dir=node_modules --exclude-dir=skills --exclude-dir=.git "skills/$s" . 2>/dev/null | head -3
done
```

**Resultado: nenhuma referencia em codigo versionado.** As unicas ocorrencias
sao artefatos nao rastreados -- `.claude/.cache/chroma_db/chroma.sqlite3`,
`.codeatlas/state.db`, `.git/config` e `.claude/settings.local.json`. Confirmado
que nenhum deles esta no indice: `git ls-files` nao devolve nada para
`.codeatlas/`, e o `chroma.sqlite3` nao esta versionado.

O caso do `superpowers` e o mais claro: o plugin efetivamente carregado nesta
sessao veio de
`C:/Users/rapha/.claude/plugins/cache/claude-plugins-official/superpowers/6.3.0/`,
**fora do repositorio**. O submodulo `skills/superpowers` e uma segunda copia
que ninguem consome.

Isso e o que a secao 6.5 do CLAUDE.md chama de entropia, e **valida a intencao
da branch**: a remocao fazia sentido em 2026-08-22 e continua fazendo. O que
nao vale e o caminho -- merge de uma branch `behind 294` que toca tres fontes
unicas. Por isso a opcao 1 e a recomendada.

Se qualquer submodulo aparecer com consumidor em codigo versionado, **ele nao
se remove** -- e ai a branch estava errada, nao apenas velha.

- [ ] **Passo 2: executar a opcao escolhida pelo Tier 0**

---

## Tarefa 8: Jules cego -- GATE TIER 0, credencial

**GATE:** envolve credencial. A secao 3 da raiz proibe credencial em texto
claro e proibe aceitar credencial colada no chat.

- [ ] **Passo 1: localizar o mecanismo de auth do bridge**

```bash
grep -rn "JULES_API_KEY\|jules.googleapis\|oauth" --include=*.py --include=*.json --exclude-dir=.venv --exclude-dir=node_modules . | head -20
```

- [ ] **Passo 2: confirmar que a chave nao serve, e nao e um problema de ambiente**

A API respondeu `401 CREDENTIALS_MISSING` com *"API keys are not supported by
this API. Expected OAuth2 access token"*. Isso e recusa de **tipo de
credencial**, nao chave invalida -- nenhuma chave de API vai funcionar.

- [ ] **Passo 3: escolha do Tier 0, entre duas**

1. **Prover OAuth2** (`gcloud auth application-default login` com o escopo do
   Jules, ou conta de servico), e refazer a consulta.
2. **Declarar a capacidade inativa**, na secao 8.1.1 do `Site\CLAUDE.md`, que
   ja tem a forma exata para isso: *referencia declarada nao e registro ativo*.
   O `logs/jules_cloud_sessions.log` para em 2026-08-29 e nao volta a crescer
   sozinho.

**A que nao serve e a atual**, em que a frente aparece como disponivel e nao
responde.

---

## Tarefa 9: os sete achados do Astra

**Nao comeca antes das Tarefas 1 e 2.** Com o CI vermelho nao se sabe se a
correcao quebrou algo.

Ordem por gravidade, e `B05` primeiro por um motivo especifico: **meia correcao
e pior que nenhuma**, porque parece feita.

- [ ] **B05 (P1) -- `valuation_stack=-1` aceito na arvore.** `fold_equity=2` ja
  e rejeitado; a validacao ficou pela metade. Escrever o teste que passa
  `valuation_stack=-1` e espera rejeicao, ver falhar, corrigir a validacao no
  mesmo ponto onde `fold_equity` e validado, ver passar.
- [ ] **B08 (P2) -- persistencia e schema Prisma divergem.** `model Tournament`
  tem 0 ocorrencias no `schema.prisma` e o DAO consulta a tabela. Decidir se a
  tabela e legado (remover o DAO) ou se o schema esta incompleto (declarar o
  model). Medir qual antes de escolher.
- [ ] **B07 (P2) -- autenticacao e autoridade se misturam.** `user_role` tem 0
  ocorrencias em `handlers.py`.
- [ ] **B09 (P2) -- instalacao e documentacao divergem.** `AGNOSTIC_SYSTEM.md`
  ausente, `system_config.json` ausente e copiado no Dockerfile, `EXPOSE 8000`
  contra 17042, `.cerebro` no README. Quatro divergencias pequenas e
  independentes; um commit cada.
- [ ] **F06 (P2) -- relays com politicas diferentes.** `/api/proxy` ausente; o
  relay usa `BACKEND_API_URL` com fallback literal.
- [ ] **F03 -- nao conclusivo.** Rastrear a origem do `humanNoiseFactor` ate a
  fonte antes de qualquer conclusao.
- [ ] **F05 -- nao conclusivo.** Exige reinspecao visual em 390 px com
  Playwright; as 8 classes responsivas sugerem correcao e nao a provam.

---

## Tarefa 10: fechamento

- [ ] **Passo 1: push do acumulado**

```bash
git log --format='%h %an <%ae> %s' origin/master..master
```
Confirmar que **toda** linha traz o agente e `noreply@anthropic.com`. So entao:

```bash
git push origin master
```

- [ ] **Passo 2: confirmar o CI verde -- o unico veredito que conta**

```bash
gh run list --workflow=sota-ci.yml --limit 3
```
Esperado: `success`. Esta e a prova das Tarefas 1, 2 e 5.

- [ ] **Passo 3: corrigir o cache do pip-audit**

```powershell
icacls "$env:LOCALAPPDATA\pip-audit\Cache" /grant "$($env:USERNAME):(OI)(CI)F" /T
```
Depois rodar `pip_audit -r requirements.txt` e confirmar que o WARNING de
`Permission denied` sumiu. Nao invalida resultado -- degrada desempenho -- mas
reaparece a cada execucao e agora o portao vai roda-lo em todo commit.

- [ ] **Passo 4: registro e handoff**

Escrever `reports/REGISTRO-2026-09-08-<slug>.md` declarando o que rodou e o que
nao rodou, com frontmatter de 13 campos. E a secao 5 do CLAUDE.md, e vale
tambem para este plano.

---

## Auto-revisao

**Cobertura da spec.** As sete frentes da auditoria estao cobertas: fase 3 sem
Python (T4), `next-env.d.ts` (T5), worktrees (T6), branch de 22/08 (T7), Jules
(T8), Astra (T9), higiene (T10). A emenda da auditoria -- porta CDP -- e a T3.
**Duas frentes nao constavam da spec e entraram aqui: T1 e T2**, o CI vermelho,
descoberto ao medir para escrever este plano. Elas encabecam o plano por serem
as de maior impacto sobre raio.

**Placeholders.** Nenhum passo diz "tratar erros adequadamente" ou "escrever
testes para o acima". Onde ha decisao do Tier 0, ela esta nomeada como decisao
com as opcoes ordenadas e o criterio -- nao como TODO.

**Consistencia de tipos.** `PY_CVE_ABERTAS` e o mesmo nome na tabela
`$secRules` (T4 passo 4), no bloco de auditoria (passo 5) e no teste (passo 2).
O arquivo `data/python_cve_acceptances.json` tem o mesmo caminho no aceite
(passo 1), no codigo (passo 5) e no teste (passo 2). `$cdpDescartadas` e
declarado e consumido no mesmo bloco da T3.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** ordenar por impacto sobre raio a conclusao das nove frentes
abertas, com passos executaveis e criterio de decisao onde a escolha e do
Tier 0; nenhuma das frentes foi alterada ao escrever o plano, exceto a
regeneracao dos bindings WASM, que foi a medicao que estabeleceu a causa da
Tarefa 2 e cujo resultado fica no working tree.
