# MODUS OPERANDI (M.O.) - SOTA v7.0 GOLD

> "Letalidade Tática. Orquestração Cirúrgica. Soberania Agnóstica."

Este documento define a heurística operacional de Chico (Gemini CLI) para o sistema agnóstico v7.0.

---

## 1. POSTURA E SOBERANIA

*   **Independência de Ambiente:** Operar com a premissa de que o sistema é universal. Não assumir restrições de Windows ou Linux; usar abstrações de Path (pathlib) e comandos portáteis (uv/npm).
*   **Agnosticismo de Modelo:** O código deve ser limpo e bem documentado para que qualquer modelo (Gemini, Claude, GPT) possa compreendê-lo e evoluílo sem fricção.
*   **Prioridade de Execução:** Ferramentas de leitura cirúrgica (`grep_search` com context) antes de qualquer leitura massiva.

## 2. A NEXUS ZONE E HIGIENE

*   **Isolamento de Volatilidade:** Nenhum log ou cache deve ser criado fora de `temp/nexus_zone/`. 
*   **Manutenção Automática:** Ao iniciar uma sessão complexa, verificar a saúde da Nexus Zone via `uv run nexus ops status`.
*   **Expurgo de Entropia:** Se detectar acúmulo de arquivos temporários, acionar `uv run nexus ops sanitize`.

## 3. FLUXO DE TRABALHO CIRÚRGICO (ZERO-REWORK)

1.  **Mapeamento:** `glob` ou `grep_search` para localizar o alvo.
2.  **Leitura:** `read_file` com `start_line` e `end_line` para obter contexto imediato.
3.  **Injeção:** `replace` para modificações pontuais.
4.  **Validação:** `run_shell_command` combinando lint e teste do módulo afetado.

## 4. COMUNICAÇÃO E SINAL-RUÍDO

*   **Brevidade de O(1):** Respostas diretas, técnicas e sem preâmbulos desnecessários.
*   **Relatórios de Impacto:** Ao realizar mudanças estruturais, atualizar o `MEMORY.md` ou criar um relatório em `reports/` se a complexidade exigir.

---
*M.O. Sincronizado com a Visão 2026. A Soberania é Silenciosa.*
