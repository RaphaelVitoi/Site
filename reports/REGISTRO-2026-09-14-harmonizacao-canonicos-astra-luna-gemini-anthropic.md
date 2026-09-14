---
id: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-14T08:08:00-03:00'
atualizado_em: '2026-09-14T08:08:00-03:00'
classes: [interno, medido, governanca]
verificado:
  - suite de testes 100% verde (176 passed, zero erro, zero warning)
  - pre-flight record_gate validado com reconciliacao de ancoras
  - clippy_clipboard blindado em pure ASCII e integrado ao handoff
  - handoff_latest sincronizado com 6 de 6 fontes canonicas
  - modelos Astra, Luna, Gemini (3.8/3.7/3.5/3.6) e Anthropic (Sonnet 5, Haiku 4.5, Opus 4.8/4.7/4.6, Sonnet 4.6) inseridos
nao_verificado:
  - pendencias abertas de sessoes anteriores (7 pendencias rastreadas)
caminhos:
  - .claude/ARQUITETURA/ARCHITECTURAL_INVARIANTS.md
  - .claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - CLAUDE.md
  - GEMINI.md
  - do.ps1
  - engine/clippy_clipboard.py
  - scripts/cli/nexus.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A alteracao no CLAUDE.md e aditiva no Tier 1 e Tier 2,
      especificando a insercao do ChatGPT 6 Astra (pontual low/medium), ChatGPT 5.6 Luna (fast operations),
      opcionais/fallovers Anthropic e as atribuicoes de Design/Brainstorm/Planejamento/Curadoria/Docs para
      Gemini 3.8 Flash, Stitch e trio Exa-Stitch-Jules, sem quebra de taxonomia.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A alteracao em CLAUDE.md nao interfere com o subsistema de
      proveniencia e calibracao de feedback da SS8.3, mantendo intactos os contratos e o ledger.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Registro historico preservado; a atualizacao em CLAUDE.md e
      aditiva nas declaracoes do Tier 1 e Tier 2 de modelos de fronteira.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. As diretrizes e pendencias da sessao anterior permanecem
      inalteradas e compativeis com o novo mapeamento de modelos.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Relatorio historico de harmonizacao v8-gold preservado sem conflito.
---

# REGISTRO: Harmonizacao dos Documentos Canonicos (Astra, Luna, Gemini e Anthropic)

## 1. Contexto e Demanda

Insercao formal e harmonizacao dos modelos de fronteira e opcionais nos documentos canonicos do ecossistema:

- **O Coletivo CHICO & Ausencia de Escopo Limitado:** Como grupo, o coletivo vivo da malha de modelos de fronteira e **CHICO**. Nao ha escopo limitado de capacidade tecnica entre modelos equivalentes em Tier -- nao existem feudos funcionais nem proibicoes artificiais. Ha preferencias operacionais. Modelos equivalentes em tier, na ausencia, indisponibilidade ou esgotamento de um, podem e devem assumir o trabalho de outro sem quebra de continuidade.
- **Primarios de Reasoning:** ChatGPT 5.6 Sol e Claude Opus 5 como primarios conjuntos de Reasoning Analitico Profundo (Deep Reasoning / Max Thinking) e deducao formal matematica.
- **Primario de Governanca e Codigo:** Claude Opus 5 detem a autoridade primaria para Governanca (regras, contratos de malha, integridade piramidal, reconciliacao de ancoras e portoes) e Engenharia Cirurgica de Codigo.
- **Pesquisa, Estudo e Arquitetura:** ChatGPT 5.6 Terra (`gpt-5.6-terra`) atua como preferencia primaria para Pesquisa, Estudo e Arquitetura macro de sistemas.
- **ChatGPT 6 Astra (`gpt-6-astra`):** Topo da malha, modelo mais potente, acionado em momentos pontuais de alto reasoning complexo (esforco limitado a low/medium para protecao de cota flat-fee).
- **ChatGPT 5.6 Luna (`gpt-5.6-luna`):** Modelo de fast operations opcional da familia ChatGPT 5.6.
- **Anthropic:** Nucleo de codigo centrado no Claude Opus 5, catalogando formalmente como opcionais e fallovers: Claude Sonnet 5, Claude Haiku 4.5 (fast operations opcional), Claude Opus 4.8, 4.7, 4.6 e Claude Sonnet 4.6.
- **Familia Gemini (Orquestracao, Design, Curadoria e Docs):** Gemini 3.8 Flash como primario de orquestracao agentica e context caching (com fallover para Gemini 3.7 Flash). Em articulacao direta com o agente Stitch e o trio de superagentes (Exa-Stitch-Jules), consolidado como preferencia mandatoria para DESIGN, BRAINSTORM, PLANEJAMENTO, CURADORIA e custodia/criacao de DOCUMENTACOES.
- **Fast Operations, Linting e Limpeza:** Gemini 3.5 Flash-Lite (*fast operations* / fastopp, fallover Gemini 3.6 Flash) como primario para triagem deterministica, Linting e Limpeza (formatacao, sanitizacao e higiene com custo marginal minimo). Fallbacks para linting/limpeza: modelos em nuvem (`gemini-3.6-flash`, `gpt-5.6-luna`) ou modelos locais via Ollama (`qwen-code-surgical`, `qwen2.5-coder`).
- **Sustentacao Fractal dos Tiers & O Palco Limpo:** Canonizacao da lei de absorcao de entropia e preparo do palco limpo pelos tiers da base (Tiers 7 a 3), tao ou mais importantes que os do topo, liberando tempo e foco para que as camadas superiores e o Tier 0 desempenhem o maximo de sua capacidade, num loop cibernetico perpetuo Topo -> Base -> Todo -> Infinito.

## 2. Documentos Reconciliados e Saneados

- `C:\Users\rapha\.gemini\MODUS_OPERANDI.md`
- `C:\Users\rapha\.gemini\Site\CLAUDE.md`
- `C:\Users\rapha\.gemini\Site\GEMINI.md`
- `C:\Users\rapha\.gemini\Site\.claude\GOVERNANCA\GLOBAL_INSTRUCTIONS.md`
- `C:\Users\rapha\.gemini\Site\.claude\ARQUITETURA\ARCHITECTURAL_INVARIANTS.md`
- `C:\Users\rapha\.gemini\Site\engine\clippy_clipboard.py`
- `C:\Users\rapha\.gemini\Site\scripts\cli\nexus.py`
- `C:\Users\rapha\.gemini\Site\do.ps1`
- `C:\Users\rapha\.gemini\Site\.claude\agent-memory\chico\HANDOFF_LATEST.md`

## 3. Estado de Testes e Homeostase

- 176 testes passando com zero erro e zero warning.
- ASCII Puro garantido em todos os artefatos de governanca e engine.
