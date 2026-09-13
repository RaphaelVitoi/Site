---
id: registro-2026-09-13-publicacao-do-snapshot-diario-terra
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Codex GPT-5.6 Sol <noreply@openai.com>"
criado_em: 2026-09-13T09:10:00-03:00
atualizado_em: 2026-09-13T09:10:00-03:00
classes: [interno, medido, calibracao, proveniencia, autoria]
caminhos:
  - reports/agent-calibration/daily/2026-09-12.json
  - reports/agent-calibration/daily/2026-09-12.md
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  head: 72670ac61039947fb2611327a64200d303f607c6
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    AUTORIA: os dois artefatos diarios foram produzidos por GPT-5.6 Terra
    <noreply@openai.com>, sob supervisao de Raphael Vitoi. O frontmatter Markdown
    foi corrigido de Codex generico para essa identidade exata antes do commit.
  - >-
    INTEGRIDADE: o JSON e sintaticamente valido e preserva fallback TimesFM
    analitico, weights_loaded false, quatro feedbacks elegiveis em duas sessoes,
    gate estrutural fechado e outliers fora da amostra de calibracao.
  - >-
    MEDICAO: 74 testes de feedback, procedencia, fechamento de ciclo, portao por
    sessao e TimesFM de calibracao passaram com zero erro e zero warning.
nao_verificado:
  - >-
    A publicacao nao converte o snapshot em calibracao: falta a terceira sessao
    distinta e a corroboracao independente exigida pelo contrato.
  - >-
    Nenhuma eficacia comportamental, causalidade de intervencao ou peso TimesFM
    carregado foi inferido a partir do relatorio diario.
revisoes_de_ancora:
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: [reports/agent-calibration/daily/2026-09-12.json]
    parecer: >-
      A regeneracao preserva o contrato acumulativo corrigido: corte por sequence,
      sessoes distintas como gate estrutural, densidade intrassessao apenas como
      dado e insuficiencia literal sem calibracao planejada. O snapshot agora inclui
      os feedbacks e correcoes posteriores do mesmo dia sem reescrever os ledgers.
---

# Publicação do snapshot diário produzido por Terra

Os dois artefatos de 2026-09-12 entram no mesmo commit das engines por autorização
explícita do Tier 0, mas conservam autoria independente. Sol auditou estrutura,
proveniência e testes; não produziu nem reivindica o conteúdo analítico de Terra.

O estado permanece `dados insuficientes — nenhuma calibração planejada`: duas
sessões distintas não satisfazem o mínimo de três, e densidade dentro de uma sessão
não substitui independência.
