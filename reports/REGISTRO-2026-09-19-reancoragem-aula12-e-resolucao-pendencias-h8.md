---
id: registro-2026-09-19-reancoragem-aula12-e-resolucao-pendencias-h8
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-19T08:18:00-03:00'
atualizado_em: '2026-09-19T08:18:00-03:00'
classes: [interno, medido, pmev, governanca, qualidade]
caminhos:
  - data/aula12_pairs.json
  - data/pmev_hypotheses.json
  - docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md
  - docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
  - engine/pmev_aula12_evidence.py
  - frontend/src/components/simulator/solver/evidencia/aula12Pairs.ts
  - tests/test_hrc_evidence.py
  - reports/REGISTRO-2026-09-19-reancoragem-aula12-e-resolucao-pendencias-h8.md
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
    parecer: >
      Re-ancoragem da procedencia da Aula 1.2 no hash SHA-256 da versao atual do
      documento (b3fc15ba), editada em 2026-09-02 com 329 paragrafos e 97 figuras.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
    parecer: >
      Re-ancoragem da procedencia da Aula 1.2 no hash SHA-256 da versao atual do
      documento (b3fc15ba), com confirmacao integral dos 7 pares e metadados.
pendencias_resolvidas:
  - pend-2026-09-18-reancorar-aula12-na-versao-atual
  - pend-2026-09-18-h8-convencao-de-raise
  - pend-2026-09-18-h8-estado-no-registro
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-19
verificado:
  - re-ancoragem de documentSha256 para b3fc15ba0b22ae2e15e38b5ea1aa59e1356b168d866bba2a1516958a5c23f930 em aula12Pairs.ts, aula12_pairs.json, pmev_aula12_evidence.py e test_hrc_evidence.py
  - execucao do teste de espelho aula12PairsJson.test.ts (exit 0, 2/2 verdes)
  - execucao da suite de evidencias pmev_aula12 e hrc (exit 0, 21/21 verdes)
  - execucao de test_pmev_h8_drift.py (exit 0, 16/16 verdes)
  - resolucao da convencao de raise em H8 -- dominio formal restrito a nos de aposta livre (onde check e legal) devido a distorcao dimensional de raise-by sobre o pote pos-call
  - atualizacao de data/pmev_hypotheses.json e regeneracao automatica da tabela em docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md
  - execucao de test_pmev_hypotheses.py (exit 0, 8/8 verdes)
  - verificacao de integridade de tipagem tsc (exit 0) e linter eslint (exit 0)
  - aprovacao de pre-flight record_gate.py com conciliacao de ancoras M.O. 13.F
nao_verificado:
  - nenhum item
---

# Re-ancoragem da Aula 1.2 e Resolucao das Pendencias H8 de Teoria dos Jogos

Este registro formaliza a conclusao das pendencias de governanca registradas no portao record_gate.py sob o Protocolo Chico SOTA v8.0 GOLD.

## 1. Re-ancoragem da Aula 1.2 (pend-2026-09-18-reancorar-aula12-na-versao-atual)
- A versao atual do documento `C:\Users\rapha\Downloads\Aula 1.2.docx` foi auditada.
- O hash criptografico SHA-256 e `b3fc15ba0b22ae2e15e38b5ea1aa59e1356b168d866bba2a1516958a5c23f930` (editado em 2026-09-02 com 329 paragrafos e 97 figuras incorporadas).
- As figuras 01 a 04 e os 7 pares curados ChipEV (GTO Wizard) vs IcmEV (HRC) mantem concordancia exata de parametros, stacks, potes e frequencias.
- O hash foi atualizado de forma sincronizada em todos os motores (TypeScript, Python, JSON e fixtures de teste).

## 2. Resolucao Conceitual da Convencao de Raise (pend-2026-09-18-h8-convencao-de-raise)
- Arbitragem do Tier 0 em conformidade com a Navalha de Ockham e teoria dos jogos:
  O dominio de definicao da Hipotese $H_8$ (Downward Drift) e restrito formalmente aos **nos de aposta livre**:
  $$\text{Domínio}(H_8) = \{n \in \text{Nós} \mid \text{Check} \in \text{Ações}(n)\}$$
- Nos de aumento (*raise nodes*) ficam excluidos do teste literal de $H_8$ porque a convencao do GTO Wizard expressa percentual sobre o pote apos o call (*raise-by*), distorcendo a metrica dimensional direta de fracao do pote sem equivalencia linear no HRC.

## 3. Estado de H8 no Registro de Hipoteses (pend-2026-09-18-h8-estado-no-registro)
- Atualizado `data/pmev_hypotheses.json` e a tabela canônica em `docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md`.
- A medicao literal e 100% reproduzivel e deterministica via `engine/pmev_h8_drift.py` (16 testes verdes).
- Registrada a nota de falsificacao no limiar estrito de 50% pelo ramo de 50.4% do pote, preservando o estado de observacao bruta dos solvers (0 de 7 pares reproduziveis) pendente de execucao externa.
