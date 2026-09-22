# Contexto atual do projeto Site

> Atualizado em 2026-09-22 a partir do checkout local. Este arquivo e contexto
> operacional consumido pelo backend; governanca e configuracao permanecem em
> suas fontes canonicas.

## Produto e dominio

Poker Racional e a plataforma de Raphael Vitoi para conteudo, educacao e
ferramentas de poker, com foco teorico em ICM e Perspectiva Matematica (PMev).
PMev e um programa autoral de pesquisa e desenvolvimento para ampliar a analise
economica e decisoria em MTTs. O repositorio contem teoria, contratos
executaveis, simulacoes e interfaces; codigo ou simulacao nao provam por si
superioridade empirica.

## Arquitetura observada

- Frontend: Next.js, React e TypeScript.
- API principal: `main.py` inicia `api.v1.server.start_api_server` (aiohttp).
- Persistencia/fila: `database/queue_manager.py`, SQLite e aiosqlite;
  `QueueManager.claim_task` estabelece a posse atomica de uma tarefa.
- Workers: `worker/`; agentes e motores: `agents/`, `engine/`, `core/` e `llm/`.
- Existem servicos auxiliares, incluindo `tools/hybrid_router/app.py`; nao
  assumir atividade sem launcher e consumidor comprovados.
- Contrato de capacidade e proveniencia: `docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md`.

## Interpretacao de estado

- Capacidade integrada requer consumidor real no fluxo executado; manifest,
  import opcional ou endpoint declarado isoladamente nao bastam.
- Separar fonte de configuracao, codigo consumidor e evidencia de runtime.
- Dados de fila, credenciais, processos e portas sao estado local: medir quando
  a tarefa depender deles.
- Telemetria observacional nao entra no calculo principal sem contrato explicito.
- Preservar autoria e proveniencia dos materiais de Raphael. Diferenciar
  corpus, derivacao, adaptador, simulacao e validacao empirica.

## Ambiente Python e estado das auditorias

`pyproject.toml` declara `requires-python = ">=3.12"`; `uv.lock` e o lockfile
associado. Auditoria feita com outra versao deve declarar a divergencia e nao
comprova conformidade com o requisito do projeto.

O ultimo relatorio de backend disponivel nesta atualizacao e
`reports/AUDITORIA-2026-09-21-backend-padrao-ouro.md`: registra commit-base
`5e14c63e` e Python 3.11.16. O checkout observado esta em `3505fed4` e o
manifesto exige Python 3.12+. Portanto, os resultados do relatorio sao
historicos, nao verificacao do estado atual. O mesmo relatorio informa 80%
overall e aproximadamente 64% para o core; os escopos precisam ser reconciliados
antes de comparar ou declarar um percentual unico.

## Fontes canonicas

- Governanca do projeto: `CLAUDE.md`; multiprojeto: `../CLAUDE.md`.
- Contexto injetado no runtime: este arquivo e
  `.claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md`.
- Roteamento: `data/agents_manifest.json`, `data/system_config.json`,
  `llm/routing_policy.py` e `llm/model_registry.py`.
- Especificacoes, arquitetura e pesquisa: `docs/`.
- Auditorias e handoffs datados: `reports/`.

Nao manter aqui contagens de agentes, versoes comerciais de modelos, status de
deploy, disponibilidade de credenciais ou resultados de testes sem medicao
atual e escopo identificado.
