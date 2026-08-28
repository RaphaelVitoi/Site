---
id: retrospectiva-processo-agentico-2026-08-28
tipo: auditoria-retroativa-e-plano-de-calibracao
escopo: Site
autor: codex@gpt-5.6
criado_em: 2026-08-28T10:55:00-03:00
commit: fd64d6db
classes: [interno, auditavel, autocritico, evidencial]
estado: corretivo-ativo
verificado:
  - linha do tempo, processos orfaos Render e ownership duplicado do Prisma foram observados localmente
  - retificacoes de governanca e relatorio foram versionadas em commits 9c211901 e 534ebedd
nao_verificado:
  - pesos internos ou treinamento de base do modelo nao sao alterados por configuracao de projeto
  - o criador transitorio do callback OAuth em 127.0.0.1:22327 ja havia encerrado antes da inspeção de processo
_ancora_normalizada_por: claude@opus-5 em 2026-08-28T09:55-03:00. Somente o campo
  commit foi ajustado, com o SHA que INTRODUZIU o arquivo -- fato derivado do git,
  nao afirmacao minha. Corpo e demais campos intactos.
---

# Retrospectiva recursiva — processo agêntico da sessão

## Veredito

O processo entregou integração, testes, gates e correções técnicas, mas exibiu
três outliers comportamentais inaceitáveis: inferência causal temporal inválida,
intervenção redutiva desproporcional em Browser Use e coleta diagnóstica mais
ampla do que o necessário. O padrão comum foi perda de hierarquia contextual:
uma hipótese técnica secundária recebeu precedência sobre a definição causal e
operacional do administrador.

## Matriz causal dos outliers

| Evento | Falha | Mecanismo | Correção concreta | Métrica futura |
| :--- | :--- | :--- | :--- | :--- |
| Captura Prisma | `t_captura` foi tratado como `t_quebra` | Prioridade indevida a evidência técnica parcial sobre contexto humano direto | Separação obrigatória entre evento, percepção, captura e diagnóstico | 100% das análises causais declaram os quatro tempos quando relevantes |
| Browser Use | Restrição inicial diminuiu capacidade experimental | Viés de contenção por categoria, sem autorização e sem alternativas proporcionais | Escada preservar → corrigir → isolar → autorizar redução | 0 reduções materiais sem os seis itens de autorização |
| Prisma/Render | Diagnóstico inicial confundiu transporte, host e ownership | Foco em configuração declarada antes da árvore de processo efetiva | Ownership explícito: Codex primário, Claude sob demanda | 100% dos MCPs problemáticos têm processo-pai e host identificados |
| Hook Render | Edições disparavam Bash interativo e processos órfãos | Hook global Windows assumiu stdin pipado | Bash não interativo e saída segura; 113 órfãos limpos | 0 processos órfãos por hook após cada validação |
| Coleta de evidência | Consultas globais retornaram mais contexto do que a hipótese exigia | Ausência de orçamento de evidência por pergunta | Coleta por alvo, atributo e janela temporal | 0 leituras amplas sem vínculo explícito à hipótese |

## Protocolo de autoavaliação

1. Antes de agir, escrever internamente `pedido → contexto explicitado →
   hipótese → evidência mínima → ação reversível`.
2. Para causalidade, priorizar observação direta do administrador em ambiente
   fechado; investigar mecanismo, não tentar deslocar a origem por lacuna de
   log.
3. Para ferramenta experimental, medir impacto de capacidade e alternativas
   antes de limitar; isolamento é preferível a subtração.
4. Para diagnóstico, seguir árvore de processo e runtime efetivo antes de
   arquivos de configuração; distinguir proprietário, transporte e consumidor.
5. Para output, separar estritamente fato observado, inferência, ação tomada,
   pendência e limite. Nenhuma categoria recebe atalho semântico.

## Calibração do próximo ciclo

O primeiro ciclo não altera automaticamente ferramentas, permissões, modelos ou
limites. Ele coleta feedback, mede as cinco métricas, propõe no máximo três
microcalibrações reversíveis e avalia seu efeito no dia seguinte. Se não houver
dados suficientes, o relatório diário deve dizer exatamente isso.
