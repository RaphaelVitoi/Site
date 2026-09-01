---
id: handoff-2026-09-01-prioridade-pmev-continuacao
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: Codex [Tier 1.B]
criado_em: 2026-09-01T04:38:00-03:00
atualizado_em: 2026-09-01T04:38:00-03:00
commit: d62ae6153e3d3789de1911a9f9da27f187339545
classes: [interno, continuidade, pmev]
caminhos:
  - reports/AUDITORIA-2026-09-01-retrospectiva-prioridade-sessao.md
  - docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - scripts/ops/Register-AgentCalibrationFeedback.ps1
  - tests/test_agent_calibration_feedback.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: d62ae6153e3d3789de1911a9f9da27f187339545
  foco: pmev-source-to-simulator
  feedback_score: 7.5
verificado:
  - o proximo objetivo de maior retorno e a estruturacao reproduzivel da fonte Aula 1.2 para o simulador PMev
  - o feedback humano exige reduzir latencia e impedir desvio para trilhas perifericas
  - dashboard passou a declarar indisponibilidade do relay em vez de consultar backend sem credencial
  - registro decimal de feedback foi testado e gravado sem arredondamento
nao_verificado:
  - nao houve nova execucao integral da suite no encerramento
  - TBT Lighthouse do fingerprint atual ainda nao foi certificado
  - Dependabot remoto e ticket GitHub #4716843 aguardam evidencia externa
supersede: null
---

# Handoff SOTA — foco PMev, evidência primária e execução disciplinada

## Estado de partida

- Repositório canônico: `C:\Users\rapha\.gemini\Site`.
- Base publicada: `master == origin/master == d62ae6153e3d3789de1911a9f9da27f187339545` antes dos registros deste handoff.
- Os arquivos deste handoff, da retrospectiva, do teste decimal, do script e do ledger foram salvos localmente e **não foram commitados nem enviados** nesta etapa.
- O feedback humano válido é `7,5/10`: latência e desalinho com o propósito central por gasto excessivo em itens periféricos.

## Invariantes para o sucessor

1. Começar por `docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md`.
2. Não transformar alegação teórica, screenshot ou heurística em validação empírica sem transcrição, fixture e teste reprodutível.
3. Não recalibrar coeficiente global do motor a partir de um cenário.
4. Não reabrir billing, GitHub Actions, LFS, Dependabot, CWV ou plugins sem vínculo causal com a próxima entrega PMev ou ordem explícita.
5. Não usar `--no-verify` ou `SKIP_CWV_GATE=1`.
6. Não cometer, enviar, reescrever histórico, alterar billing ou executar Actions sem autorização explícita nova.

## Próxima execução estrita

### Etapa A — três pares verificáveis

Extrair das três primeiras comparações aptas do `Aula 1.2.docx` uma fixture por
par. Cada fixture precisa conter:

- referência à figura e ao nó;
- formato, field, payout, stacks e posições;
- blinds, pot, street e board;
- cenário ChipEV e cenário ICMev separados;
- ação, sizing e frequência exibidos;
- versão/configuração declarada de cada solver;
- marcação explícita de campo ilegível ou ausência de OCR.

### Etapa B — contrato e testes

Criar o menor contrato de dados que preserve conservação de fichas, pot e
payout. Testar rejeição de valor não-finito, cardinais incompatíveis e
redistribuição silenciosa. Só então avaliar calibração local, com tolerância e
falsificador pré-declarados.

### Etapa C — interface didática

Levar o contrato já testado para inputs do aluno em FT Vanilla 8/9-max, com
defaults transparentes, tooltips e recusa elegante de cenários impossíveis.
PKO, Mystery, rebuy e satélite continuam fora do primeiro corte funcional.

## Prompt de continuidade

```text
Trabalhe exclusivamente em C:\Users\rapha\.gemini\Site.

Leia primeiro:
1. reports/HANDOFF-2026-09-01-prioridade-pmev-continuacao.md
2. reports/AUDITORIA-2026-09-01-retrospectiva-prioridade-sessao.md
3. docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md

Objetivo central: converter as primeiras tres comparacoes verificaveis de Aula
1.2 em fixtures e contratos reproduziveis para o simulador PMev; depois,
expor inputs didaticos de FT Vanilla sem inventar dado, suavizar inconsistencias
ou recalibrar o motor globalmente.

Prioridade: uma trilha central por vez. Todo desvio precisa declarar o vinculo
causal com a entrega. Se nao houver vinculo ou ordem expressa, registrar como
backlog e retornar ao PMev.

Estado Git de referencia: master e origin/master estavam em d62ae615 antes dos
registros locais deste handoff. Verifique estado atual antes de editar. Nao use
--no-verify, nao realize commit, push, rebase, billing, Actions, LFS ou contato
com GitHub sem autorizacao nova.

Limites: o score humano 7.5 foi preservado em ledger decimal. TBT do frontend
atual esta nao certificado; isso e uma pendencia delimitada, nao o objetivo da
proxima etapa. Ticket GitHub #4716843 e Dependabot aguardam evidencia externa.
```
