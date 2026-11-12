---
id: registro-2026-11-12-congelamento-config-medida-e-pendencias
tipo: registro
escopo: >-
  "Site -- auditoria dos avisos do portao de registro (41 nao vigentes),
  congelamento de config_medida nos 10 registros cujo unico motivo de SUSPEITO
  era divergencia de patch do interpretador, e re-medicao do estado das pools de
  chaves citadas nas pendencias abertas"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T10:20:00-03:00"
atualizado_em: "2026-11-12T10:20:00-03:00"
classes:
  - interno
  - medido
  - governanca
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
caminhos:
  - reports/HANDOFF-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor.md
  - reports/HANDOFF-2026-10-28-encerramento-e-polimento-sota-triade-montecarlo.md
  - reports/REGISTRO-2026-10-05-layout-espacial-formatacao-bb-e-icmev-rp.md
  - reports/REGISTRO-2026-10-27-correcao-sintaxe-actionlint-e-sincronizacao-submodulos.md
  - reports/REGISTRO-2026-10-27-estabilizacao-completa-esteira-ci-github-actions.md
  - reports/REGISTRO-2026-10-31-indexacao-ssot-gemini-protocolo-chico.md
  - reports/REGISTRO-2026-10-31-remediacao-matematica-cfr-e-otimizacao-recursos.md
  - reports/REGISTRO-2026-11-01-resiliencia-proactor-winerror-10054.md
  - reports/REGISTRO-2026-11-01-saneamento-ascii-e-higiene-testes-timesfm.md
  - reports/audits/AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_2026_08.md
  - reports/REGISTRO-2026-11-12-congelamento-config-medida-e-pendencias.md
pendencias_resolvidas: []
revisoes_de_ancora:
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - reports/HANDOFF-2026-10-28-encerramento-e-polimento-sota-triade-montecarlo.md
    parecer: >-
      "Edicao cirurgica de frontmatter: adicionada congelada_em ao config_medida
      do HANDOFF (medicao de 2026-10-28 congelada; python 3.14.7 vs ambiente
      3.14.9). Nenhum conteudo, caminho ou regra do HANDOFF alterado; o registro
      que o ancora segue valido."
verificado:
  - "record_index.avaliar_registro re-executado: os 10 registros com
    congelada_em passaram de SUSPEITO para VIGENTE (zero motivos restantes)"
  - "decision_pool_manager: has_credentials=True, 3 chaves dedicadas, 4
    candidatas; gemini_pool_manager: 5/5 disponiveis; openrouter tiers {1:4,
    2:7, 3:5, 4:5} -- medido em 2026-11-12 via HKCU+ambiente"
  - 'HKCU\Environment inventariado por nome (sem valores): DECISION_API_1..3,
    GEMINI_API_KEY(+_1..5, FLASH_KEY_1..5, especializadas),
    OPENROUTER_TIER1..4_KEY_*, OPENROUTER_API_KEY e especializadas,
    SOTA_OPENAI_* presentes; nenhuma ANTHROPIC_*; HKLM\Environment inexistente'
  - "congelada_em e convencao vigente: 133 registros ja a declaram; mecanismo
    documentado em record_index.conferir_config_medida"
nao_verificado:
  - "validade individual de cada chave contra as APIs -- coberta pelo registro
    pools-chaves-reposicao-e-doc-consolidada (db7518f2), nao re-medida aqui"
  - "se as pools Anthropic/OpenAI devem existir -- decisao de produto/custo do
    Tier 0; OPENAI_API_KEY tem fallback OPENROUTER_API_KEY no codigo e
    ANTHROPIC_API_KEY nao e lida por nenhum modulo Python do projeto"
  - "os ~80 demais registros SUSPEITO por config_medida divergente TAMBEM tem
    outros motivos (commit ausente/inexistente, TTL, raiz/branch) -- permanecem
    SUSPEITO por razao legitima; nao foram tocados"
---

# Congelamento de config_medida e estado das pendencias (2026-11-12)

## Auditoria dos avisos do portao

Os 41 avisos agregados sao registros historicos **nao vigentes** cujas ancoras
passadas foram atingidas — comportamento previsto desde a decisao do Tier 0 de
2026-09-13 (so registro VIGENTE bloqueia). Destes, a unica classe corrigivel era
`config_medida divergente`: 10 registros tinham a divergencia de patch do
interpretador (python 3.14.6/3.14.7 medidos; ambiente atual 3.14.9) como
**unico** motivo de SUSPEITO. Para eles foi declarada `congelada_em` com a data
da propria medicao — mecanismo previsto em `conferir_config_medida` ("remeca OU
marque"), convencao ja adotada por 133 registros. Os 10 voltaram a VIGENTE e
seus `caminhos:` (todos estreitos, 0-8 arquivos) passam a ter a protecao de
ancora projetada.

Nao tocados, por motivo legitimo remanescente: os ~80 registros SUSPEITO que
tambem divergem em config_medida mas tem outros motivos (commit ausente ou
inexistente, TTL externo vencido, raiz/branch de outra maquina), os 7 OBSOLETO
superseded e os 2 OBSOLETO com `commit declarado (pending` — cosmeticos, nao
bloqueantes.

## Pendencias

- `pend-2026-11-10-key-pools-api`: o registro `pools-chaves-reposicao`
  (db7518f2, 2026-11-12) ja repovoou e validou Gemini (5/5), Decision (3/3) e
  OpenRouter (21/21 + 3 dedicadas). Re-medicao independente confirmou os
  managers carregando as pools. Resta apenas Anthropic/OpenAI — nenhuma chave
  `ANTHROPIC_*` existe no HKCU e o codigo nao le `ANTHROPIC_API_KEY`;
  `OPENAI_API_KEY` tem fallback para `OPENROUTER_API_KEY`. Pendencia mantida
  aberta para decisao do Tier 0 (provisionar ou declarar obsoleta).
- `pend-2026-11-11-reauth-oauth-scopes`: exige fluxo OAuth interativo — Tier 0.
