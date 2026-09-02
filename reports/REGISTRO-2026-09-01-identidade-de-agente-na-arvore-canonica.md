---
id: registro-2026-09-01-identidade-de-agente-na-arvore-canonica
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-01T20:05-03:00
atualizado_em: 2026-09-01T20:05-03:00
classes:
- interno
- medido
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: 3.12.3
  node: v22.22.2
  pwsh: 7.4.6
  suite: 766 passed, 9 skipped, 0 failed
  arquivos_de_identidade_divergentes: 19 de 19
  identidades_com_modelo_hardcoded: 18 de 19
  congelada_em: '2026-09-01'
caminhos:
- agents/prompts.py
- agents/context_builder.py
- engine/cognitive.py
verificado:
- leitura_identidade_claude
- gravacao_memoria_claude
- test_agents_sota
nao_verificado: nenhuma -- suite de testes de memoria e agentes executada
revisoes_de_ancora:
- registro: validacao-2026-08-28-arquitetura-de-memoria
  caminhos:
  - agents/context_builder.py
  - engine/cognitive.py
  parecer: 'Aquela validacao mediu tres arvores de memoria agentica coexistindo e
    19 de 19 MEMORY.md divergentes, ancorando-se nestes dois consumidores. A mudanca
    deste commit nao contraria o que ela mediu: confirma o mesmo diagnostico um nivel
    acima, na identidade do agente, e fecha o lado que faltava. A leitura de memoria
    que ela documentou ja priorizava a arvore canonica e permanece intacta; o que
    muda e a leitura de identidade, que nunca tinha sido repontada, e a diretriz de
    escrita, que mandava o agente gravar na arvore despriorizada. O registro de 2026-08-28
    segue valido como medicao daquela data.'
---

# Identidade de agente na arvore canonica

## O achado

O `.cerebro` foi fundido no `.claude`, que passou a ser canonico. A leitura de
**memoria** acompanhou a fusao: `agents/context_builder.py` tenta
`.claude/agent-memory/<agente>/MEMORY.md` primeiro e so cai para a arvore antiga
se a canonica nao existir.

A leitura de **identidade** nao acompanhou. `agents/prompts.py` lia
`.cerebro/agents/<agente>.md` sem sequer tentar a canonica -- e essa copia estava
congelada em 2026-08-30.

O efeito e o que a memoria do `@auditor` ja tinha nomeado em outro contexto:
*corrigir o gerador nao corrige o artefato ja gravado*. O `bf9f982e` erradicou o
modelo em prosa dos `MEMORY.md`, e o `sync_agents_reality.ps1` escreve os 19
documentos de identidade atualizados -- mas ambos escrevem em `.claude/`, e o
runtime lia `.cerebro/`. A correcao e o artefato existiam; o consumidor apontava
para outro lugar.

## O que o LLM deixava de receber

Comparando `.claude/agents/auditor.md` com a copia lida em runtime, faltavam no
prompt as secoes `Skills Especializadas` (`sota-quality-gate`,
`firebase-security-rules-auditor`, `credentials`, `windows-system-maintenance`),
`Scripts & Ferramentas Integradas` (`cwv_gate.ps1`, `sri_integrity_verifier.py`)
e `Gatilho de Roteamento`. Em troca, o agente recebia `Motor Base:
gemini-2.5-pro` -- um modelo fixo em prosa que o manifesto ja nao usava.

## Correcao

| Arquivo | De | Para |
| :--- | :--- | :--- |
| `agents/prompts.py` | `.cerebro/agents/<agente>.md` | `.claude/agents/<agente>.md` |
| `engine/cognitive.py` | `.cerebro/agents/<agente>.md` | `.claude/agents/<agente>.md` |
| `agents/context_builder.py` | diretriz de escrita em `.cerebro/agent-memory/` | `.claude/agent-memory/` |
| `engine/cognitive.py` | diretriz de escrita em `.cerebro/agent-memory/` | `.claude/agent-memory/` |

`core/autopoiesis_engine.py` ja tentava a canonica primeiro e nao foi tocado.

## Divida declarada, nao fechada

Restam ~27 referencias a `.cerebro` no codigo vivo. Elas nao sao identidade nem
memoria: sao `task_results`, logs de auditoria, `GLOBAL_INSTRUCTIONS.md`, corpus
de filosofia e governanca, `settings.local.json` do MCP e caminhos do
`queue_manager`. Migrar sem confirmar a contrapartida em `.claude/` arrisca
quebrar rastreamento de tarefa e log -- fica declarado aqui, nao executado.

O diretorio `.cerebro/` continua versionado com 94 arquivos, alguns sem
equivalente na arvore canonica. Enquanto essa conferencia nao for feita, remover
o diretorio destruiria conteudo que talvez nunca tenha sido consolidado.
