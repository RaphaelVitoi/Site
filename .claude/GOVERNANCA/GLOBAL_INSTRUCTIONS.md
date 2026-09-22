# Instrucoes operacionais do runtime

Este arquivo e injetado nos prompts dos agentes pelo backend. Ele contem regras
operacionais para o runtime; nao e fonte paralela de governanca.

## Hierarquia e fontes de verdade

- Autoridade de produto e teoria: Raphael Vitoi.
- Governanca do projeto Site: `CLAUDE.md` na raiz do repositorio.
- Governanca multiprojeto: `../CLAUDE.md`.
- Preferencia/modelo por agente: `data/agents_manifest.json`.
- Fallback e roteamento: `data/system_config.json` e `llm/routing_policy.py`.
- Capacidade e autorizacao de modelos: `llm/model_registry.py`.
- Contexto de produto e runtime: `.claude/project-context.md`.
- Especificacoes: `docs/`; auditorias e handoffs datados: `reports/`.

Em conflito, siga a fonte mais especifica acima. Nao copie valores versionados
para este prompt. Configuracao, catalogo ou documentacao nao provam runtime.

## Execucao e mudancas

- Preserve linhas, interfaces, contratos, autoria e alteracoes fora do escopo.
- Antes de declarar uma capacidade integrada, localize seu consumidor ativo em
  API, worker ou pipeline e a verificacao correspondente.
- Diferencie resultado medido, inferencia, configuracao e estado desconhecido.
- Nao alegue sucesso de teste, gate, deploy, chamada externa ou processo sem
  evidencia observada. Declare verificacoes executadas e nao executadas.
- Nao contorne hooks ou gates. Siga o fluxo de validacao definido em `CLAUDE.md`.
- Nao use credenciais revogadas nem pressuponha chamadas reais a provedores.
- Falha de telemetria observacional nao deve alterar o resultado funcional ou
  matematico principal sem contrato explicito.
- Preserve autoria e proveniencia. Texto-fonte, derivacao, adaptador, simulacao
  e validacao empirica sao classes distintas; codigo nao prova hipotese.
- Nao escreva memoria, backup ou relatorio sem autorizacao da tarefa ou contrato
  explicito do artefato.

## Runtime do backend

- Entrada API principal: `main.py` -> `api.v1.server.start_api_server`.
- Persistencia/fila: `database/queue_manager.py` (SQLite/aiosqlite).
- Posse atomica de tarefa: `QueueManager.claim_task`.
- Workers: `worker/`; agentes e motores: `agents/`, `engine/`, `core/` e `llm/`.
- Ha servicos auxiliares, como `tools/hybrid_router/app.py`; nao assumir que
  modulo ou servico esta ativo sem localizar launcher e consumidor.
- Respostas de engine preservam proveniencia, nivel de implementacao, engine ou
  modelo efetivamente usado, fallback e limitacoes segundo o contrato vigente.
- Agentes, rotas, modelos e capacidades devem vir de seus catalogos canonicos;
  nao criar fontes paralelas em prompts ou handlers.

## Declaracao de estado

Ao concluir trabalho, informe mudancas, motivo, verificacoes e limites materiais.
Resultados historicos mantem data, commit, ambiente e escopo; nao representam
medicao do checkout atual.
