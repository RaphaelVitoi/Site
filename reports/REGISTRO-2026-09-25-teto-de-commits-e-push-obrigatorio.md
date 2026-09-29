---

id: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
tipo: registro
escopo: Site -- formalizacao do teto de commits locais sem push e obrigacao de push no 2o commit
ecossistema: nexus-sota
autor: gemini-3.8-flash
criado_em: '2026-09-25T09:15:00-03:00'
atualizado_em: '2026-09-25T09:15:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, git, workflow]
caminhos:
  - .claude/agents/auditor.md
  - .claude/agents/chico.md
  - CLAUDE.md
  - data/agents_manifest.json
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/HANDOFF-2026-09-25-governanca-pools-openrouter-e-impacto.md
  - reports/REGISTRO-2026-09-25-teto-de-commits-e-push-obrigatorio.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 8356731b-61df-479a-a930-2d731f86444e
  session_started_at: '2026-09-25T07:15:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-25
verificado:
  - "teto-de-commits-locais: Promulgada a Regra do 2o Commit pelo Tier 0: sempre que se acumular 2 commits locais sem publicacao no remoto (ahead >= 2), e terminantemente obrigatorio que o proximo commit venha acompanhado de push imediato para origin"
  - "governanca-sincronizada: Regra registrada formalmente na Secao 1.3 do Site/CLAUDE.md, na Secao 3 do ~/.gemini/CLAUDE.md e na Secao 13.F do MODUS_OPERANDI.md"
  - "calibracao-ledger-registrada: Feedback 9.9/10 registrado no ledger reports/agent-calibration/feedback-ledger.jsonl com a justificativa qualitativa do push mandatorio"
  - "ollama-key-provisionada: OLLAMA_API_KEY provisionada com 100% de paridade em HKCU e HKLM com broadcast WM_SETTINGCHANGE"
  - "harmonizacao-skills-e-agentes: session-impact-evaluator adicionado em chico e auditor no agents_manifest.json e documentos sincronizados via sync_agents_reality.ps1"
  - "resolucao-corpus-sem-irmao: declarada referencia_nao_resolvivel para nucleo/nucleo_compartilhado.json no handoff e ajustada regex de contagem de testes no CLAUDE.md"
nao_verificado:
  - "intercepcao automatica de hook client-side antes da verificacao de politica (governanca manual e procedimental vinculante)"
revisoes_de_ancora:
  - registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A governanca v8.0 Gold e respeitada integralmente, incorporando a salvaguarda de publicacao remota frequente. Revisado em 2026-09-29; diff desta revisada: +290/-259.

---

# Registro: Teto de Acumulo de Commits Locais e Obrigacao de Push (Regra do 2o Commit)

Data: 2026-09-25
Autor: Gemini 3.8 Flash [Tier 1]
Sessao: 8356731b-61df-479a-a930-2d731f86444e

## 1. Contexto e Promulgacao Soberana

Na avaliacao de calibracao da presente sessao, o Tier 0 (Raphael Vitoi) concedeu a nota **9.9/10**, acompanhada da seguinte diretriz corretiva de processo:
> *"Motivo qualitativo do -0.1 = Sempre que acumular 2 commits, e obrigatorio que o proximo commit venha com push. Registre nas regras mestras e MO. Se tudo ok, commit e push"*

## 2. A Regra do 2o Commit

Sempre que a arvore local acumular 2 commits sem publicacao para o remoto (`ahead >= 2`), o proximo commit deve ser obrigatoriamente acompanhado de `git push` para a branch de publicacao correspondente (`origin/master` ou `origin/main`).

- **Teto maximo de commits locais nao sincronizados:** 2 commits.
- **Proibicao estrita:** E proibido acumular 3 ou mais commits a frente do remoto sem sincronizacao.
- **Objetivo operacional:** Reduzir riscos de divergencia de arvore, evitar desvios cumulativos de contexto entre agentes e garantir visibilidade continua do trabalho no repositorio central.

## 3. Disseminacao Canonica da Regra

A diretriz foi integrada em tres niveis normativos:
1. **MODUS OPERANDI (Raiz .gemini):** Secao 13.F (Portao de Pre-Commit e Commit), item 7.
2. **CLAUDE.md do Projeto Site:** Secao 1.3 (Teto de acumulo de commits locais e obrigacao de push).
3. **CLAUDE.md Multiprojeto (Raiz .gemini):** Secao 3 (Regras de base que valem em todo projeto).

## 4. Evidencia de Execucao

- **Feedback no Ledger:** Registrado com sucesso via `Register-AgentCalibrationFeedback.ps1` (87 registros consolidados, integridade de hash verificada via `Test-AgentCalibrationLedger.ps1`).
- **OLLAMA_API_KEY:** Configurada no Registro do Windows (HKCU e HKLM) com notificacao de ambiente para o sistema.
- **Pre-flight de Portao:** Validado via `scripts/ops/record_gate.py` e `scripts/ops/record_anchor_gate.ps1`.
