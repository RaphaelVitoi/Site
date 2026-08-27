---
id: interludio-2026-08-27-autoria-de-outra-sessao
tipo: auditoria
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-27T19:10-03:00
commit: d9db429e
classes: [interno, medido]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  baseline_suite: 415 passed
  powershell: pwsh 7 e Windows PowerShell 5.1
  data_das_medicoes: 2026-08-27
verificado:
  - leitura integral de run_inference.py (243 linhas) e de nexus.py (2316 linhas)
  - rastreamento de max_tokens ate num_predict/num_ctx em engine/gemma_server.py
  - contagem de ocorrencias de SOTA_STATIC_CONTEXT em todo o repositorio
  - contagem de consumidores das 9 constantes novas e das 2 funcoes duplicadas
  - execucao de isdigit/isdecimal sobre 6 entradas, incluindo U+00B2
  - execucao de StartsWith e da expressao substituta sobre Int32, null, hashtable, double
  - parse de 4 arquivos .ps1 em pwsh 7 e em PS 5.1
  - bytes iniciais de dashboard.ps1, nexus.ps1 e dashboard.cmd (BOM)
  - execucao dos launchers a partir de C:/Users/rapha, antes e depois da correcao
  - propagacao de LASTEXITCODE atraves do Push-Location/Pop-Location
  - suite completa antes e depois das correcoes
nao_verificado:
  - nenhuma chamada real a provedor de LLM foi feita; as chaves deste ambiente
    estao revogadas. O proxy local 127.0.0.1:17043 nao foi levantado, entao o
    caminho de rede de query_gemma_proxy nao foi exercitado ponta a ponta.
  - o modo interativo do dashboard (loop com Live e captura de tecla) nao foi
    exercitado; so o caminho --once.
  - optimize-ram --watch nao foi executado; o daemon nao foi observado sob carga.
  - nao foi medido o efeito do teto de saida maior (2048 -> 4096) sobre latencia
    ou VRAM, por depender do proxy no ar.
supersede: null
---

# INTERLÚDIO — avaliação da autoria de outra sessão

> Executado em 2026-08-27, conforme §10 do
> [HANDOFF-2026-08-27](HANDOFF-2026-08-27-governanca-e-portoes.md).
> Autorizado por Raphael Vitoi. Escopo: as 9 alterações que ficaram fora do
> commit `d9db429e` por §13.D (autoria misturada num único registro).

## 1. A pergunta que motivou a prioridade

`run_inference.py` era a única alteração substancial com zero leitura, e a
suspeita era que tocasse provedor de LLM num ambiente de chaves revogadas.

**Não toca.** O alvo é o proxy **local** `127.0.0.1:17043`. `API_SECRET_TOKEN`
vem de variável de ambiente ou de `env_loader`, nunca literal. Nenhum teste
novo pressupõe chamada real. A regra das chaves revogadas está preservada.

## 2. Achados

| # | Arquivo | Achado | Estado |
| :--- | :--- | :--- | :--- |
| 1 | `run_inference.py` | Rótulo `"Context Window / KV Cache Alocado"` afirma efeito inexistente | **corrigido** |
| 2 | `run_inference.py` | `isdigit()` não protege `int()` — lança em U+00B2 | **corrigido** |
| 3 | `nexus.py` | 9 constantes novas sem consumidor | **removidas** |
| 4 | `nexus.py` | `MSG_WARNINGS_SOTA` congela `"Warnings: 0"` como literal | **removida** |
| 5 | `*.ps1` (×2) | `$args[0].StartsWith('-')` lança com argumento não-string | **corrigido nos dois** |
| 6 | launchers | `uv run` resolve pelo CWD: alias só funcionava dentro do `Site` | **corrigido** |

### 2.1 Achado 1 — instância 11 de "sinal verde desconectado"

Rastreando o valor digitado pelo usuário:

- `max_tokens` chega ao proxy e vira **`num_predict`** — teto de **saída**.
- `num_ctx`, a janela real que a frase anunciava, vem de
  `params["num_ctx"]` sempre que `SOTA_STATIC_CONTEXT != "0"`.
- **Ocorrências de `SOTA_STATIC_CONTEXT` no repositório inteiro: 1** — a
  leitura do próprio default `"1"`. Ninguém define a variável, logo
  `_calculate_dynamic_context()` nunca executa.

Para o `12b`: o usuário digita 4096, a UI afirmava 4096, a janela alocada é
32768 — 8×. Para o `4b`, 131072 — 32×.

**Variante nova do padrão.** Não é literal fixo nem variável sem atribuição: é
**nome errado para uma grandeza real**. O botão existe e funciona; ele só não
faz o que o rótulo diz. Detector correspondente: quando a UI nomear um recurso
(cache, janela, cota), rastrear até o campo do protocolo e conferir se o nome
bate com o campo.

### 2.2 Achado 4 — o literal que não chegou a disparar

`MSG_WARNINGS_SOTA` congelava `" Total de Warnings: 0 (Teto Maximo Permitido: 2
| Tolerancia: 0 para SUCESSO)"`. Fui conferir a origem: `tests/conftest.py`
**deriva** essa linha (`f"...{total_warnings}..."`, alimentado pelo hook
`pytest_warning_recorded`, que de fato acumula). **O relatório real é honesto.**
A constante era a cópia congelada dele — inerte, porque sem consumidor, mas
pronta para transformar uma contagem medida em texto fixo assim que alguém a
plugasse. Removida, com nota no lugar explicando por que não voltar.

### 2.3 Achado 6 — ambiguidade de raiz vestida de launcher

Medido a partir de `C:\Users\rapha`, antes da correção:

```
uv run nexus --help  ->  EXIT=2  error: Failed to spawn: `nexus`
```

`Invoke-Dashboard` resolvia o **script** por caminho absoluto e então descartava
essa informação: o `uv run` lá dentro usava o CWD. O alias novo `dashboard` — a
feature-título desta autoria — só funcionava de dentro do `Site`. Um alias
existe justamente para ser digitado de qualquer lugar. É a ambiguidade de raiz
do `CLAUDE.md` §1 em roupa nova.

Corrigido com `Push-Location $PSScriptRoot` / `Pop-Location` em `dashboard.ps1`
e `nexus.ps1`, e `pushd "%~dp0"` / `popd` em `dashboard.cmd`. Verificado que o
CWD do chamador volta ao lugar e que `LASTEXITCODE` continua propagando (2 para
comando inválido, 0 para `--once`).

## 3. O que foi verificado e passou, sem correção

- `_restore_lightningcss` de `async` para `def`: exatamente 1 chamador, zero
  `await` no corpo. Conversão correta.
- `time` e `psutil` importados no topo de `nexus.py`.
- `DIR_CEREBRO_NAME`: de-duplicação legítima, 3 ocorrências.
- `hub` → `nexus-status`: a função existe (linha 220). Alias não quebrado.
- BOM de `dashboard.ps1` e `nexus.ps1`: **único**, `ef bb bf`. A instância 5
  (BOM duplo) não se repetiu. `dashboard.cmd` corretamente sem BOM.
- Parse dos 4 arquivos `.ps1` em pwsh 7 **e** em PS 5.1.
- `--once` tem teste real (`test_nexus_dashboard_once`).
- Suíte: **415 passed** antes e depois das correções.

## 4. Pendências que permanecem abertas

| # | Pendência | Por que não foi tocada |
| :--- | :--- | :--- |
| A | A função de roteamento continua **duplicada** entre `Microsoft.PowerShell_profile.ps1` e `Invoke-Dashboard`/`nexus` de `Setup-NexusProfile.ps1`. Era 1 função duplicada, virou 2. | Declarar a fonte única é o item 1.3 do plano 2-B. Corrigi o defeito **nos dois** e anotei a gemelidade; unificar é decisão de arquitetura, não de interlúdio. |
| B | `_calculate_dynamic_context()` em `gemma_server.py` é **inalcançável** na configuração real. | Código morto de terceira autoria. Frente 6 do plano 2-B ("morto vs não-integrado"). |
| C | `nexus` sem argumentos passou a ir para `nexus.ps1` (help do Typer) em vez de `do.ps1`. | Mudança não declarada da porta de entrada do ecossistema. Pode ser intencional; precisa do vértice. |
| D | `_get_key()` engole exceção do `msvcrt`: o teclado morre em silêncio em vez de falhar. | Defensável como escolha; não é defeito conclusivo. |
| E | Em modo 2, o payload leva `system_prompt` **e** `messages[0]` com o mesmo conteúdo. | Pré-existente, anterior a esta autoria. |
| F | `main()` de `run_inference.py` sai com 0 mesmo com o proxy offline. | Pré-existente. É a mesma família de sinal desconectado, mas fora do delta avaliado. |

## 5. Declaração (governança §5)

Rodaram: leitura integral dos dois arquivos maiores, rastreamento do valor até
o protocolo, contagem de consumidores, execução das guardas antigas e novas em
ambos os sentidos, parse em duas versões do PowerShell, execução real dos
launchers de dentro e de fora do projeto, e a suíte completa duas vezes.

Não rodaram, e por quê: qualquer chamada real a provedor de LLM (chaves
revogadas neste ambiente); o proxy local não foi levantado; o loop interativo
do dashboard e o `optimize-ram --watch` não foram exercitados. Estão declarados
no frontmatter e não contam como verificação aprovada.
