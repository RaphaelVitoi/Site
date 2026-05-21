# PRD: Planejar e especificar a 'CLI Inteligente' (Smart do.ps1) baseada no conceito do Maverick

> Gerado automaticamente via Autopoiese

## Estrutura Simétrica

### 1. Problema

A interface atual (`do.ps1`) é passiva e exige que o usuário saiba exatamente qual agente ou tarefa solicitar. Isso gera carga cognitiva e potencial erro de roteamento.

### 2. Resultado Esperado

Uma CLI interativa que atua como uma membrana inteligente: recebe inputs vagos, analisa a intenção e sugere o caminho correto (agente/tarefa) antes de enfileirar.

### 3. Requisitos

- R-01: Análise de intenção baseada em palavras-chave (Regex).
- R-02: Sugestão ativa de agentes (ex: "Palavra 'segurança' detectada -> Sugerir @securitychief").
- R-03: Modo interativo (default) e silencioso (`-Force`).

### 4. Riscos

- Latência: A análise não pode demorar mais que 200ms.
