---
id: prompt-continuacao-2026-09-05-site-moldes
tipo: runbook
escopo: Site
ecossistema: codex
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-05T15:19:43.191567-03:00'
commit: d6bace4df5f404e8fb4dd711df087cc7db0aedcf
classes:
  - interno
  - medido
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
verificado:
  - Contexto desta sessao consolidado.
nao_verificado:
  - Estado Git deve ser reconferido na retomada.
supersede: null
---

# Prompt de continuação

Continue o trabalho em C:\Users\rapha\.gemini\Site. Leia CLAUDE.md, ../CLAUDE.md e reports/HANDOFF-2026-09-05-auditoria-site-moldes.md; confira os últimos commits, pushes e git status antes de editar.

O usuário quer uma auditoria e desenvolvimento sistêmicos: compreender conceito e relações antes do mecanismo. PMev e sua alimentação teórica estão em evolução; fontes do website/repo podem estar corroídas. Outputs são moldes que devem funcionar, ser coerentes e permitir evolução. Não exigir demonstração empírica da teoria como condição para calcular. Há material candidato em C:/ e no repo, inventariado com hashes, ainda sem autenticação autoral.

Foi concluída a auditoria global backend→frontend e uma primeira implementação dos moldes: ABI de 1.326 combos, contratos dos cinco pedidos do worker, resposta estruturada a entradas desconhecidas, ligação dos outputs ao contexto, estados terminais ICM, programação dinâmica, fallback demonstrativo e correções de usabilidade. A regressão de undefined em DownwardDriftSimulator foi corrigida e exercitada no navegador. Resultados mais recentes da implementação: backend 940 passed/1 skipped; frontend 233 passed; build e tipos aprovados. O gate permanece FRÁGIL por cobertura INP/TBT e contraste inconclusivo; não alegar certificado verde.

Próximo objetivo técnico: formalizar as convenções de estado (stacks, pote, investimentos, unidades, contrafactuais e liquidação) em um corpus pequeno de cenários, comparando os motores existentes e preservando a separação entre convenção computacional e hipótese autoral. Consultar a auditoria para priorizar os defeitos restantes. Não reescrever a teoria ou alimentar routing automaticamente. O solver Rust multiway permanece em construção.

O usuário autorizou agregar no fechamento alterações locais que declarou já auditadas. Também informou que seu push já havia ocorrido. Reflog e remoto confirmaram master=d6bace4d e push às 12:51:35 -03:00, mas diferenças locais persistiam. A investigação dessa divergência foi DELEGADA pelo usuário: não retomá-la como frente paralela nem atribuir autoria sem evidência. O inventário dos arquivos incorporados e os limites constam do relatório.

Feedback desta sessão: 10/10, literal no ledger, sequência 16. Preserve a memória de que testes verdes não dispensam inventariar todos os consumidores de mensagens. Confirme no Git o resultado do protocolo de publicação; autorização para este fechamento não é autorização perpétua para commits, pushes, purgas ou mudanças globais em trabalhos futuros.
