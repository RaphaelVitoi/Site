---
id: registro-2026-09-13-rearquitetura-computacional-pmev
tipo: registro
escopo: Site
autor: 'Raphael Vitoi, com Gemini 3.8 Flash'
criado_em: '2026-09-13T12:55:00-03:00'
classes: [interno, medido, registro, pmev, engines]
caminhos:
  - engine/pmev_spec.py
  - engine/pmev_operators.py
  - engine/pmev_pipeline.py
  - engine/pmev_falsification.py
  - engine/pmev_postflop_matrix.py
  - shared/types/pmev.ts
  - tests/test_pmev_compositional.py
  - docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md
revisoes_de_ancora:
  - registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
    caminhos:
      - engine/pmev_pipeline.py
    parecer: >
      Extensao composicional aditiva de PMevCompositionalPipeline sem remocao ou
      quebra de assinaturas existentes. O baseline deterministico e o parsing de
      ranges permanecem operacionais com 34 testes aprovados.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - engine/pmev_pipeline.py
    parecer: >
      Tipagem estrita preservada e expandida com schemas tipados Measured[T] e
      operadores composicionais. Pyright aprovou com zero erros e zero warnings.
  - registro: research-pmev-spec-v0-1
    caminhos:
      - engine/pmev_spec.py
    parecer: >
      Extensao de contratos em engine/pmev_spec.py adicionando Measured, Unit,
      Bounds, Provenance, AbsorptionState e InsufficientDataCalibrationError.
      A invariante de recuperacao de baseline Malmuth-Harville permanece intacta
      com 34 testes aprovados.
  - registro: plan-pmev-contract-port-2026-09-01
    caminhos:
      - engine/pmev_spec.py
    parecer: >
      Contratos de estado e tier preservados e expandidos para atender a
      interoperabilidade isomorfica com o frontend e os operadores composicionais.
      Zero regressoes nos testes de especificacao.
  - registro: registro-2026-09-13-curadoria-drive-poker-e-pmev
    caminhos:
      - engine/pmev_spec.py
      - engine/pmev_pipeline.py
    parecer: >
      Concretizacao da rearquitetura computacional refutavel da PMev em codigo
      executavel (Measured, Unit, Bounds, Provenance, AbsorptionState e pipeline
      composicional de 6 estagios). O formalismo do diptico autoral de Raphael
      Vitoi e preservado integralmente com 34 testes verdes.
  - registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
    caminhos:
      - frontend/src/content/artigos/genealogia-dos-solvers-claudico-a-pluribus.md
    parecer: >
      Ajuste cosmetico de espacamento e alinhamento de markdown preservando 100%
      do conteudo genealogico, equacoes e referencias historicas aos solvers.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - data/agents_manifest.json
    parecer: >
      Atribuicao da skill local poker-pmev-knowledge-engine ao agente bibliotecario,
      preservando a topologia de 19 agentes sem alteracao de modelos ou routing.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - data/agents_manifest.json
    parecer: >
      Atribuicao da skill local poker-pmev-knowledge-engine ao agente bibliotecario,
      assegurando resolucao de skills locais conforme tests/test_governanca_skills.py.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - data/agents_manifest.json
    parecer: >
      Atribuicao da skill local poker-pmev-knowledge-engine ao agente bibliotecario,
      mantendo a integridade do manifesto de agentes.
  - registro: handoff-2026-08-30-status-malha-agentica-e-routing
    caminhos:
      - data/agents_manifest.json
    parecer: >
      Atribuicao da skill local poker-pmev-knowledge-engine ao agente bibliotecario,
      com contagem exata de 19 agentes primarios preservada.
  - registro: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
    caminhos:
      - data/agents_manifest.json
    parecer: >
      Atribuicao da skill local poker-pmev-knowledge-engine ao agente bibliotecario,
      preservando integridade do manifesto.
baseline:
  branch: master
  python_venv: 3.14.6
  python_version_file: '3.14'
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python_venv: 3.14.6
verificado:
  - Suite de 34 testes PMev aprovada com 100% verde (pytest).
  - Linter Ruff sem erros em toda a suite engine e tests.
  - Pyright aprovado com zero erros e zero warnings.
  - Contratos TypeScript compilados em shared/types/pmev.ts.
  - Reconciliacao formal de ancoras em reports preexistentes.
nao_verificado:
  - Calibracao parametrica integral do modelo PMev.
---

# Registro Mestre — Rearquitetura Computacional do Arcabouco PMev

## 1. Declaracao de Escopo e Concretizacao

Este registro homologa formalmente a entrega em codigo dos cinco pilares matematicos
da Perspectiva Matematica (PMev) de Raphael Vitoi, convertendo o modelo em arcabouco
computacional refutavel:

1. **`engine/pmev_spec.py`:** Especificacao formal de unidades economicas (`Unit`),
   envelope com erro padrao e intervalo de confianca (`Bounds`), proveniencia
   deterministica (`Provenance`), grandeza mensuravel (`Measured[T]`), estado
   terminal particionado (`AbsorptionState`) e excecao de trava de calibracao
   (`InsufficientDataCalibrationError`).
2. **`engine/pmev_operators.py`:** Implementacao desacoplada dos operadores $f_1$ a
   $f_5$, integrando o calculo analitico do Jacobiano global e **Regularizacao de
   Tikhonov** para conter o raio espectral $\rho(J_{\text{global}}) \le 1.0$.
3. **`engine/pmev_pipeline.py`:** Orquestrador `PMevCompositionalPipeline` executando a
   cadeia $y = (f_5 \circ \dots \circ f_1)(x)$ e viabilizando testes de ablacao
   estrutural camada por camada.
4. **`engine/pmev_falsification.py`:** Motores analiticos automatizados para avaliacao
   estatistica e refutacao de $H_4$ (MDF river sob assimetria de RP), $H_7$
   (opcionalidade SPR $\Omega(s)$), $H_9$ (nao-conservacao em $T\$$ sob late reg) e
   $H_{12}$ (parcimonia informacional BIC).
5. **`engine/pmev_postflop_matrix.py`:** Harness da Aula 1.2 com board $K\diamondsuit
   J\clubsuit T\spadesuit$, condicionamento de bunching hipergeometrico multivariado
   e comprovacao empirica do *Downward Sizing Drift*.
6. **`shared/types/pmev.ts`:** Espelhamento tipado TypeScript para integracao
   isomorfica com frontend Next.js.
7. **`tests/test_pmev_compositional.py`:** Suite de 12 testes validando as Fases 0 a 4
   da bancada experimental.

## 2. Decisao de Governança e Feedback

Registra-se o feedback 9 do Tier 0, com expurgo definitivo de qualquer mencao a
terceiros errados em cache e preservacao integral da autoria soberana de Raphael
Vitoi no diptico `Entendendo o ICM e suas heuristicas.docx` e `Aula 1.2.docx`.
