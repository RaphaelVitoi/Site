# ESPECIFICAÇÃO TÉCNICA: A Membrana Inteligente (Smart CLI)

**ID da Tarefa:** INOVACAO-CLI-20260316
**Autor:** @planner
**Status:** REJEITADA PELO @AUDITOR (REGRESSÃO DETECTADA)
**Conceito Original:** [CONCEPT_MAVERICK.md](./CONCEPT_MAVERICK.md)

---

## 🛑 CHANGELOG DE AUDITORIA (@auditor)

**Veredito:** BLOQUEADA
**Motivo:** O script `do.ps1` atual (v2.0) **já possui** a Membrana Inteligente implementada de forma superior. Ele utiliza arquivos JSON externos (`data\intentmap.json` e `data\synonyms.json`) para a heurística, o que é mais limpo e escalável do que o mapeamento hardcoded em hashtable proposto no item 3 desta SPEC.
**Ação:** A tarefa de implementação será cancelada para evitar uma regressão (downgrade) na arquitetura da CLI. A integridade do sistema foi protegida.

---

## 1. Visão Geral

Esta especificação detalha a implementação da "Membrana Inteligente" no script `do.ps1`. O objetivo é transformar a CLI de um receptor passivo para um roteador de intenção interativo, que negocia com o usuário para direcionar a tarefa ao agente mais apropriado, reduzindo a carga cognitiva e o ruído na fila de tarefas. A interatividade será opcional, permitindo a execução direta via flag.

## 2. Requisitos Técnicos

1.  **Interatividade Opcional:** O script `do.ps1` deve aceitar um parâmetro `-Force` (switch) que, quando presente, pula toda a lógica interativa e executa a tarefa como no comportamento legado.
2.  **Mapeamento de Intenções:** Uma estrutura de dados (hashtable em PowerShell) deve ser criada para mapear palavras-chave a agentes específicos.
    - Exemplo: `'segurança', 'auditoria', 'bug'` -> `'@securitychief'`
3.  **Análise de Input:** O script deve analisar o input de descrição da tarefa em busca das palavras-chave definidas no mapeamento.
4.  **Diálogo de Confirmação:** Se uma palavra-chave for encontrada, o script deve apresentar um prompt ao usuário (usando `Read-Host`) sugerindo o agente especialista e pedindo confirmação (S/N).
5.  **Roteamento Dinâmico:** Se o usuário confirmar, o parâmetro do agente para a função `Add-AgentTask` deve ser sobrescrito com o agente sugerido. Se o usuário negar, o agente padrão (`@dispatcher`) deve ser usado.
6.  **Manutenção da Compatibilidade:** A chamada final para `Add-AgentTask` deve permanecer funcional e compatível com o kernel `Agent-TaskManager.psm1`.

## 3. Ordem de Implementação

1.  **Backup:** Crie uma cópia de segurança do `do.ps1` atual.
2.  **Adicionar Parâmetro `-Force`:** Modifique o bloco `param()` no início do `do.ps1` para incluir `[switch]$Force`.
3.  **Criar Mapeamento de Agentes:** Dentro do script, defina uma hashtable chamada `$agentIntentMap`.
    ```powershell
    $agentIntentMap = @{
        "@securitychief" = @("segurança", "auditoria", "bug", "vulnerabilidade");
        "@organizador"   = @("organizar", "limpar", "documentar", "índice");
        "@seo"           = @("seo", "ranking", "google", "palavra-chave");
        # Adicionar outros agentes conforme necessário
    }
    ```
4.  **Implementar Lógica de Análise:**
    - Envolva a lógica principal em um `if (-not $Force.IsPresent) { ... }`.
    - Dentro do `if`, itere sobre `$agentIntentMap`. Para cada agente, verifique se alguma de suas palavras-chave está presente no input do usuário (`$Description`).
5.  **Implementar Diálogo Interativo:**
    - Se uma correspondência for encontrada, use `Read-Host` para perguntar ao usuário: `"Intenção de '$keyword' detectada. Deseja acionar o agente $agent diretamente? [S/n]"`.
6.  **Atualizar Variável do Agente:** Com base na resposta, atualize a variável que armazena o nome do agente a ser usado na tarefa.
7.  **Garantir Fallback:** Se nenhuma palavra-chave for encontrada, ou se o modo `-Force` for usado, o agente padrão (`@dispatcher`) deve ser mantido.

## 4. Checklist de Auditoria (@auditor)

- [ ] O script executa sem erros com e sem a flag `-Force`.
- [ ] A entrada do usuário é devidamente sanitizada antes de ser processada.
- [ ] O script lida corretamente com entradas vazias ou nulas.
- [ ] O mapeamento de intenções não contém conflitos óbvios.

## 5. Casos de Teste (@verifier)

- **Entrada:** `.\do "quero uma auditoria de segurança"` -> **Saída Esperada:** Prompt para usar `@securitychief`.
- **Entrada:** `.\do "quero uma auditoria de segurança" -Force` -> **Saída Esperada:** Tarefa criada para `@dispatcher` sem prompt.
- **Entrada:** `.\do "criar novo post sobre poker"` -> **Saída Esperada:** Tarefa criada para `@dispatcher` sem prompt.
- **Entrada:** `.\do ""` -> **Saída Esperada:** O script não quebra e solicita uma descrição válida.

---

**Fim da Especificação.**
