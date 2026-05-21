# SPEC: A Fundação de Aço (Migração do Kernel para SQLite)

**Autor:** @planner (via CHICO) | **Data:** 2026-03-16
**Contexto:** Fase 1 do Plano de Obliteração Estratégica (Visão 4D)
**Alinhamento:** MODUS_OPERANDI.md (Regra 9: Simetria, Harmonia e Autopoiese)

---

## 1. O Vetor Temporal (Por que estamos fazendo isso?)

- **Passado:** A fila inicial `tasks.json` permitiu um bootstrap rápido, dependendo de regravações atômicas de arquivo protegidas por Mutex.
- **Presente:** Com o aumento de agentes e requisições concorrentes, o I/O no arquivo JSON (mesmo com o hard-limit de 500 tasks) tornou-se um gargalo físico e estrutural.
- **Futuro:** Para que a "Ingestão Semântica" e os "Pipelines Multi-Tráfego" escalem indefinidamente sem corrupção, precisamos de um motor de banco de dados ACID nativo. O SQLite é o Estado da Arte para este cenário local.

## 2. Decisão Arquitetural (A Simetria)

O PowerShell 5.1 puro não possui módulos SQLite nativos elegantes. Adicionar uma `.dll` externa quebra o paradigma de portabilidade (ASCII/Scripts puros).

**A Solução SOTA:** Já temos um ecossistema Python em `.venv` atuando no arquivo `task_executor.py` (usado atualmente para validação Pydantic). O Python possui a biblioteca nativa `sqlite3` blindada contra problemas de encoding no Windows. Transformaremos o `task_executor.py` na **Camada de Acesso a Dados (DAL)** do micro-kernel. O PowerShell (CLI) delega as transações DB para o Python, consumindo a resposta em JSON.

## 3. Estrutura do Banco de Dados (`queue/tasks.db`)

### Tabela Principal: `tasks`

| Coluna        | Tipo (SQLite)    | Propósito                              |
| :------------ | :--------------- | :------------------------------------- |
| `id`          | TEXT PRIMARY KEY | ID único da tarefa (ex: TASK-2026...)  |
| `description` | TEXT             | Descrição/Prompt do que deve ser feito |
| `status`      | TEXT             | pending, running, completed, failed    |
| `timestamp`   | TEXT             | ISO-8601 de criação                    |
| `agent`       | TEXT             | Agente designado (ex: @implementor)    |
| `priority`    | TEXT             | normal, high, low (default: normal)    |
| `metadata`    | TEXT             | Payload JSON adicional (opcional)      |
| `completedAt` | TEXT             | ISO-8601 de término (opcional)         |

## 4. Plano de Implementação (@implementor)

A execução deve ser atômica e não destrutiva. O sistema não pode ficar offline.

### Passo 1: Expansão do Motor Python (`task_executor.py`)

- Refatorar o script para aceitar novos comandos via CLI (ex: `python task_executor.py db-init`, `python task_executor.py db-add <b64>`, `python task_executor.py db-get <status>`, `python task_executor.py db-cleanup <days>`).
- O Python lidará internamente com o `sqlite3`, garantindo locks nativos do SQLite, removendo a necessidade excessiva do Mutex no PowerShell.

### Passo 2: O Script de Migração (Bridge)

- Criar `scripts/maintenance/migrate_json_to_sqlite.ps1`.
- Ler o `queue/tasks.json` atual (e o `archive.json` se necessário) e inserir todos os registros usando o novo comando do Python para popular o `tasks.db`.

### Passo 3: Refatoração do Kernel (`Agent-TaskManager.psm1`)

- Modificar as funções do Kernel:
  - `Add-AgentTask`: Roteia os dados (em Base64 para segurança ASCII) para `task_executor.py db-add`.
  - `Get-AgentTaskStatus`: Executa `task_executor.py db-get <status>` e faz o parse do JSON retornado para os scripts em PS.
  - `Invoke-TaskCleanup`: Aciona a rotina SQLite de expurgo (ex: deletar ou mover para uma tabela `archive` local no banco).
- _Nota Autopoiese:_ O Mutex Global no PS (`Invoke-WithMutex`) pode ser mantido apenas como uma casca protetora extra para chamadas concorrentes ao interpretador Python, mas o SQLite será o verdadeiro garantidor ACID.

## 5. Riscos e Reversibilidade

- **Risco:** Falha na leitura do banco pelo PowerShell devido a latência do interpretador Python.
- **Mitigação:** O retorno do Python deve ser sempre UTF-8 sanitizado. Se a migração (Passo 2) falhar, o script aborta sem tocar no `Agent-TaskManager.psm1`.
- **Reversibilidade (Fallback):** O arquivo `tasks.json` antigo será mantido intacto como `.bak`. Caso o SQLite apresente instabilidade na V1, podemos reverter o módulo do Kernel para a versão anterior puxando de um commit anterior ou do próprio `.bak`.

---

> "A fundação de aço garante que o organismo respire livremente em meio ao caos."
