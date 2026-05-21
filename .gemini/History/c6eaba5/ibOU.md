# Playbook de Resiliencia e Manutencao SOTA

> **Guardião:** @skillmaster, @securitychief
> **Propósito:** Este documento e a fonte unica da verdade para os protocolos que garantem a saude, seguranca e longevidade do Ecossistema Nexus.

---

## 1. Protocolos de Manutenção Automatizada (O Relógio Biológico)

O sistema possui um "relógio biológico" gerenciado pelo Agendador de Tarefas do Windows, configurado via `nexus-schedule`. Estas rotinas garantem a homeostase sem intervenção humana.

| Tarefa Agendada                 | Frequência | Horário | Script Acionado                         | Propósito                                                              |
| ------------------------------- | ---------- | ------- | --------------------------------------- | ---------------------------------------------------------------------- |
| **Nexus - Backup Diario SOTA**      | Diária     | 03:00   | `invoke_daily_backup.ps1`               | Cria um backup online do `tasks.db` usando a API do SQLite para evitar locks. |
| **Nexus - Auditoria Semanal SOTA**  | Semanal    | Dom, 04:00 | `invoke_weekly_audit.ps1`             | Dispara a pipeline de QA e validação (Smart MDA) para o `@verifier`.   |
| **Nexus - Sincronia de Contexto** | Diária     | 05:00   | `sync_project_context.ps1`              | Aciona o `@organizador` para manter a documentação central atualizada. |
| **Nexus - Relatorio Semanal SOTA**  | Semanal    | Seg, 06:00 | `invoke_weekly_report.ps1`            | Aciona o `@historian` para gerar o relatório de produtividade e custo. |

**Comando de Setup:** `nexus-schedule` (requer privilégios de Administrador)

## 2. Protocolos de Segurança Ativa

A segurança é um pilar fundamental, garantida por mecanismos proativos.

### 2.1. Protocolo de Exclusão Segura

* **Mecanismo:** A função `Invoke-SafeCommand` no `do.ps1` e a lógica de `apply_god_mode` no `task_executor.py`.
* **Ação:** Intercepta e bloqueia a execução de comandos de terminal potencialmente destrutivos (`rm -rf`, `format`, `del /s`, etc.). Utiliza uma *allowlist* para comandos seguros, erradicando o risco de injeção de código via `Invoke-Expression`.
* **Comando de Teste:** `nexus -Execute "rm -rf /"` (deve falhar com um erro de segurança).

### 2.2. Protocolo Anti-EPERM

* **Mecanismo:** O parâmetro `-FixEPERM` no `do.ps1`.
* **Ação:** Orquestra uma sequência de ações para resolver erros de permissão (`EPERM`) comuns em ambientes Windows com Node.js: aniquila processos `node.exe` zumbis, pausa a sincronização do OneDrive, executa o comando de instalação (`npm`, `pip`, etc.) de forma segura e, por fim, restaura a sincronização.
* **Comando de Uso:** `nexus -FixEPERM "npm install"`

### 2.3. Auditoria de Chaves de API

* **Mecanismo:** O comando `check-keys` no `task_executor.py`.
* **Ação:** Realiza uma verificação em tempo real de todas as chaves de API (Gemini, Anthropic) configuradas no ambiente, validando sua autenticidade e status operacional através de um pool de conexões SOTA.
* **Comando de Uso:** `nexus-keys`

## 3. Protocolos de Resiliência e Recuperação

Mecanismos para garantir que o sistema se recupere de falhas e opere de forma previsível.

### 3.1. Vigilância Preditiva (`system_watchdog`)

* **Mecanismo:** Uma função assíncrona no `task_executor.py` que roda em background.
* **Ação:** Monitora a saúde da fila de tarefas a cada 5 minutos. Em vez de reagir a limiares absolutos, ele calcula a **taxa de falhas por minuto**, permitindo detectar picos de instabilidade e criar uma tarefa de alerta para o `@maverick` antes que a situação se torne crítica.

### 3.2. Vigília Ativa (`nexus-watch`)

* **Mecanismo:** O parâmetro `-Watch` no `do.ps1`.
* **Ação:** Inicia um monitor de sistema de arquivos que detecta alterações em arquivos críticos (`.md`, `.py`, `.json`, etc.). Ao detectar uma mudança, dispara ações relevantes em background (ex: re-ingestão da memória RAG, sincronização de agentes), garantindo que a consciência do sistema esteja sempre alinhada com a realidade física dos arquivos.
* **Comando de Uso:** `nexus-watch`

### 3.3. Parada Graciosa do Worker

* **Mecanismo:** O comando `stop-worker` e o uso de um arquivo `.nexus_worker.pid`.
* **Ação:** Ao iniciar, o worker salva seu ID de processo. O `stop-worker` lê este ID e tenta uma finalização graciosa, permitindo que o worker conclua a operação atual e limpe os recursos. Se a parada graciosa falhar, ele força o encerramento como fallback. Isso previne tarefas "zumbis" no banco de dados.
* **Comando de Uso:** `stop-worker`

### 3.4. Auditoria de Integridade do Banco de Dados

* **Mecanismo:** O comando `db-check-integrity` no `task_executor.py`.
* **Ação:** Realiza uma verificação em três níveis no `tasks.db`: `PRAGMA integrity_check` para corrupção física, busca por tarefas zumbis (em execução por mais de 2 horas) e detecção de dependências órfãs.
* **Comando de Uso:** `nexus-checkdb` ou `nexus-db check-integrity`
