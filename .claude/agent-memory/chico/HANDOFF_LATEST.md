# HANDOFF LATEST — a sessão outlier de infraestrutura

**Data:** 2026-09-03 · **Protocolo:** Chico SOTA v8.0 GOLD
**Estado:** publicado em `b36a9ea4`, `master == origin/master`
**Condutor:** Claude Opus 5 [Tier 1.B] · **Regime:** assistida

---

## A regra que abre: esta sessão não tem nota, e isso não é zero

Decisão explícita do Tier 0. A instabilidade dos servidores da Anthropic
influenciou erros e processo; o desgaste não é atribuível ao modelo.

**Ausência de nota não é zero**, não entra em média, e não sofre multiplicação
nem divisão. Registrada como outlier `2d55d92a`, sequência 3, em ledger próprio
sem campo de nota. **O portão de suficiência continua em 6 sessões distintas.**

---

## Três commits publicados

| Commit | Autor | O quê |
| :--- | :--- | :--- |
| `b36a9ea4` | `antigravity@gemini-3.8-flash` | Tríade em 3.8, `conductor_model`, `supervision_mode` — **auditado por Opus 5** |
| `7a747145` | Claude Opus 5 | nota 10 e outlier de aceleração no ledger |
| `fed9c19f` | Claude Opus 5 | roteador: nome exato vence heurística |

---

## O incidente das extensões, encerrado

Não foi um evento às 03:33 — foram **sete instalações em 39 minutos**, das quais
três de Ollama. O padrão: cada start de componente do IDE disparava rajada de
24–36 `/api/pull`, uma por modelo instalado.

Removidas as três e limpo o `extensions.json`, o ciclo completo de reinício deu
**zero pulls**. Previsão falsificada, causa confirmada.

**Não determinado:** o mecanismo. Nenhuma delas declara `pull` no código.

---

## Estado do ambiente

| Item | Valor |
| :--- | :--- |
| `C:` livre | 260,7 GB (era 8,2) |
| Plugins Claude Code | 9 (era 58) |
| MCP Antigravity | 3 (era 15), paridade §6 preservada |
| Credenciais literais em `.gemini` | **0** (eram 40) |
| Ollama | 0.33.3, 27 modelos, 91,6 GB |
| Suíte | 852 passed · 1 skipped · 2 failed |

**Portas que o portão exige:** CDP **9222 e 9224** e dev server **:3000**.
Faltando qualquer uma, a fase 2 dá 3 violações axe **falsas** — não mexer no
frontend antes de medir a porta.

---

## Pendências, em ordem de risco

1. **Dependabot acusa 8 vulnerabilidades** (2 críticas, 4 altas) no default
   branch, enquanto `npm audit` local dá 0. **A divergência não foi investigada**
   e é o item mais sério em aberto.
2. **Chave do Figma em 33 arquivos de log**, mesmo revogada — transcripts do
   brain do Antigravity, `config/config.json`, `language_server.log`.
3. **Placeholder errado:** escrevi `${FIGMA_API_KEY}`; a variável real em
   `HKCU:\Environment` é `FIGMA_ACCESS_TOKEN`. `GITHUB_TOKEN` não existe lá.
4. **Fingerprint do Lighthouse expirado** desde 01/09 — é a origem do único
   warning do portão e das 2 falhas de `test_cwv_gate_truthfulness`.
5. **`gemma4:26b` saiu**; `HANDOFF` anteriores que o citam estão defasados.

---

## Prioridade que atravessou o dia sem ser tocada

**Recaptura do HRC.** Destino tipado pronto — `SolverProvenance` nas duas
camadas. Preferir `ChipEV(HRC) × ICMev(HRC)` no mesmo build: motor comum é
controle experimental, não confundidor.
