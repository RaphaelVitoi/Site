---
id: registro-2026-09-09-remediacao-dependabot-httpx2
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Codex GPT-5 [Tier 1.B]"
criado_em: 2026-09-09T12:05:00-03:00
atualizado_em: 2026-09-09T12:05:00-03:00
classes: [interno, medido, seguranca, dependencias, correcao]
caminhos:
  - pyproject.toml
  - uv.lock
  - scripts/ops/Set-ClaudePluginProfile.ps1
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  uv: '0.12.5'
objetivo: >-
  Remediar os tres alertas Dependabot abertos para httpx2 sem ampliar o grafo
  de dependencias nem reintroduzir a colisao com a variavel automatica PROFILE.
classe_tarefa: remediacao-dependabot-e-saneamento-de-analise-estatica
criterio_de_aceite:
  - httpx2 e httpcore2 ficam em 2.12.0 no lock e httpx2 tem piso >=2.12.0.
  - Os tres alertas Dependabot GHSA-8xx6-hgc6-gc2m, GHSA-h4x7-gw46-3wm6 e
    GHSA-pf96-p4fj-6566 deixam de ser atingidos pelo lock.
  - O seletor de plugins preserva a chamada -Profile por alias, sem atribuir
    a variavel automatica PROFILE.
verificado:
  - >-
    GitHub API em 2026-09-09 listou tres alertas abertos, todos transitivos de
    httpx2 2.10.0 em uv.lock -- um high e dois moderate. A versao corrigida
    comum e 2.12.0.
  - >-
    uv lock --check passou depois de fixar httpx2>=2.12.0 como constraint e
    atualizar apenas httpx2/httpcore2 para 2.12.0.
  - >-
    Os testes de MCP e TimesFM passaram 32/32; npm audit na raiz e no frontend
    devolveu zero vulnerabilidades.
  - >-
    O parse em Windows PowerShell 5.1 e o -DryRun com o nome legado -Profile
    passaram para Set-ClaudePluginProfile.ps1.
nao_verificado:
  - >-
    pip-audit continua apontando quatro advisories de chromadb 1.5.9 sem versao
    de correcao publicada. Elas nao sao alertas Dependabot desta remediacao e
    permanecem visiveis sob o aceite de risco do modo PersistentClient embutido.
revisoes_de_ancora:
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos: [pyproject.toml, uv.lock]
    parecer: >-
      O plano de reconciliacao dos pisos transitivos permanece valido. Esta
      alteracao estende a mesma estrategia de constraint-dependencies a httpx2,
      respeitando o resolvedor e sem usar override-dependencies.
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos: [pyproject.toml, uv.lock]
    parecer: >-
      A auditoria de integridade e do piso de transformers permanece valida.
      O novo piso e restrito a httpx2, consumidor transitivo de mcp, e o lock
      foi atualizado somente nos pacotes de transporte necessarios.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: [pyproject.toml]
    parecer: >-
      O handoff continua valido: a alteracao adiciona uma constraint de
      seguranca transitiva e nao muda roteamento de agentes, LFS ou a malha.
  - registro: auditoria-2026-09-08-sessao-do-contraste-e-da-forense
    caminhos: [docs/architecture/NODELOCKING_B20_ARCHITECTURE.md]
    parecer: >-
      A auditoria do contraste permanece valida. O documento B20 recebeu apenas
      a remocao de uma linha em branco terminal para satisfazer MD012; nenhuma
      afirmacao, formula, evidencia ou resultado do contraste foi alterado.
  - registro: handoff-2026-09-08-forense-fechada-e-o-sentinela-em-vigilia
    caminhos: [docs/architecture/NODELOCKING_B20_ARCHITECTURE.md]
    parecer: >-
      O handoff permanece valido pelo mesmo motivo: a normalizacao MD012 nao
      altera o conteudo do documento B20 nem o estado do sentinela, da forense
      ou da proxima frente PMev.
---

# Registro: remediação Dependabot de `httpx2`

## Resultado

O lock deixa de expor `httpx2==2.10.0`; `mcp` passa a resolver com
`httpx2==2.12.0` e `httpcore2==2.12.0`. O piso em `pyproject.toml` evita a
regressão para as faixas vulneráveis em uma resolução futura.

## Limite

Este registro não declara que todas as vulnerabilidades Python do repositório
foram eliminadas. As quatro advisories de `chromadb` continuam sem correção
upstream e não foram escondidas, atualizadas por suposição ou convertidas em
uma migração de servidor fora de escopo.
