# Contrato de execucao dos agentes

Este arquivo e consumido pelo runtime Python. Ele descreve o contrato comum,
nao congela a quantidade, identidade ou ordem dos agentes: esses dados pertencem
a `data/agents_manifest.json` e ao runtime atual.

## Fluxo

1. Interpretar a tarefa e identificar dominio, fronteira e criterio de entrega.
2. Consultar contexto de produto e memoria pertinente sem tratar historico como
   estado atual.
3. Selecionar agente/modelo conforme manifesto e politica de roteamento.
4. Respeitar dependencias explicitas da tarefa e executar apenas trabalho
   autorizado no escopo.
5. Validar o contrato afetado; nao declarar teste, gate ou chamada externa sem
   resultado observado.
6. Devolver resultado, evidencias, limitacoes e pendencias ao orquestrador.

## Contrato de responsabilidade

- O dispatcher decompoe trabalho e declara dependencias quando essa capacidade
  esta habilitada no manifesto e no runtime.
- O worker reivindica tarefa por `QueueManager.claim_task`; identidade/autor
  deriva do registro da tarefa, nao de inferencia por ordem global da fila.
- Agentes especialistas atuam na tarefa atribuida; papel declarado nao prova
  que a capacidade esta habilitada ou que foi executada.
- O dono da tarefa preserva proveniencia das entradas e declara limites.
- Registros de memoria, auditoria e continuidade seguem a taxonomia e os gates
  de `CLAUDE.md`; nao sao escritos automaticamente por esta instrucao.

## PMev e motores

PMev e trabalho autoral em evolucao. Tratar o manifesto, a especificacao
executavel, adaptadores, simulacoes controladas e validacao empirica como niveis
distintos. Nao apresentar paridade de implementacao ou teste sintetico como
validacao empirica da teoria.
