---
name: code-scan-sota
description: "Varreduras de codigo — mapeia os 11 tipos de Code Scan do Devin (/scan: performance, queries, cobertura, dead code, qualidade, cleanup, telemetria, a11y, compliance, migracao, custom) para os runners locais equivalentes e define quando o scan Devin Cloud vale a pena. Use para auditorias de repo, dead code, cobertura, ou quando pedirem 'scan'/'audite o codigo'."
argument-hint: "[tipo de scan ou alvo da auditoria]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["scan", "audit", "dead-code", "coverage", "devin", "quality"]
    category: quality
    related_skills: ["devin-managed-ops", "sota-quality-gate", "egm-review", "egm-drift-report"]
---

# Code Scan SOTA — os 11 tipos do Devin mapeados para a malha local

Referencia: docs.devin.ai/work-with-devin/code-scans. Um scan Devin e uma
sessao (ou fan-out) que le repos, reporta findings e pode abrir PRs de
fix. O equivalente local usa as ferramentas que ja existem — **medir
antes de instalar** (§3 raiz).

## 0. Decisor: scan local vs. scan Devin

| Cenario | Rota |
| :--- | :--- |
| Repo local, uma passada, findings acionaveis | **local** — gratis, imediato, sem ACU |
| Scan recorrente/agendado em repo GitHub | Devin Automation/scan (roda unattended) ou cron local chamando o mesmo runner |
| Multi-repo, isolamento por VM, PRs automaticos em massa | Devin scan — e o caso de uso real dele |
| "Scan new commits" incremental | local: `git diff <sha-ultimo-scan>..HEAD` + runner focado |

## 1. Tabela de equivalencia (tipo Devin → runner local)

| Scan type Devin | Equivalente local medido |
| :--- | :--- |
| Performance | `ruff` + revisao de queries (N+1 via leitura); benchmark antes/depois |
| Database queries | `mcp-toolbox-database` + leitura de call-sites; padroes parametrizados (§3) |
| Test coverage | `pytest tests/ -q --cov` (medir se pytest-cov esta no `.venv` antes) |
| Dead code | `vulture`/`ruff` (verificar disponibilidade) + `egm-drift-report` p/ codigo orfao de spec |
| Code quality | `ruff check` + portao `sota-quality-gate` |
| Cleanup | `egm-resolve`/`egm-review` — a escada §8.6 (corrigir>melhorar>fundir>arquivar>excluir) e o cleanup canonico |
| Telemetry | auditoria manual de `record_gate`/ledger — onde NAO ha instrumentacao |
| Accessibility | leitura de JSX/HTML por skill de frontend + Lighthouse se houver app rodando |
| Compliance | `PADROES_DE_CREDENCIAL.json` + varredura de segredos — scan de compliance local ja existe como padrao |
| Migration docs | `egm-bootstrap` — gera doc bottom-up do codebase |
| Custom | o que o usuario descrever — vira grep/script focado |

## 2. Fluxo de findings (espelha o Devin)

O Devin agrupa findings em Unassigned → Assigned → PR open. Local:

1. **Rodar o runner** → findings em `reports/scan-<data>-<tipo>.md`
   (ou JSONL se alimentar tool).
2. **Triagem humana obrigatoria** — falso positivo de scan e comum;
   descartar com motivo registrado, nunca silenciosamente.
3. **Fix** — cada finding aceito vira task no `record_gate`/fila ou PR;
   findings que violam governanca (segredo exposto) sobem para Tier 0
   na hora, nao entram em fila.
4. **Incremental** — guardar o SHA/base do ultimo scan; proximo scan
   cobre so o delta (`git diff --name-only`).

## 3. Disciplina herdada do Devin

- Findings sem fix proposto sao ruido — toda triagem termina em
  "corrigir / descartar-com-motivo / escalar", nunca "anotar e seguir".
- Scan de seguranca (vulnerabilidades) NAO e este skill — e
  Security 2.0 do Devin ou auditoria manual dedicada.
- Scan que roda unattended localmente precisa de teto de escopo:
  paths, tempo, custo — mesmo principio do ACU limit do fan-out.

## 4. Quando usar o scan Devin de verdade

- Repo que nao esta nesta maquina (GitHub privado acessivel pela org).
- Varredura massiva que produziria dezenas de PRs — fan-out com ACU
  limit por filho (§1 de `devin-managed-ops`).
- Precisao de findings auditavel pela API v3 (`code-scans` endpoints) —
  integravel ao painel de impacto.
