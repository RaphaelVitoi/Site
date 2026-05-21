# PRD: A Membrana Inteligente (Smart CLI v2.0)

> **Autor:** @planner (via CHICO) | **Épico:** CLI-INTERATIVA

## 1. Visão Geral

Evoluir o arquivo `do.ps1` (wrapper do Worker) de um mero "dumb pipe" passivo para um Duto Interativo de Intenção (Membrana Semipermeável). A interface deve reduzir a carga cognitiva humana, roteando comandos baseados em linguagem natural para o Especialista SOTA adequado.

## 2. Requisitos Funcionais

- **Roteamento Heurístico:** Deve utilizar chaves RegEx para "adivinhar" o agente adequado baseado no input (ex: "preciso codar a tela" -> `@implementor`).
- **Confirmação Interativa (Handshake):** Ao inferir um agente, o sistema deve pedir confirmação [Y/n]. Se `n`, permite inserção manual.
- **Modo de Sujeição (-Force):** O parâmetro `-Force` deve bypassar a confirmação humana (útil para orquestração automática).
- **Direcionamento Direto:** Iniciar a string com `@agente` deve sobrescrever qualquer heurística imediatamente.
- **Easter Eggs:** Ao iniciar (Boot), o sistema tem 10% de chance de exibir um aforismo do `@maverick` para manter a cultura Cyber-Estética vibrante.

## 3. Requisitos Não-Funcionais

- **Performance:** Zero delay perceptível. Não usar LLM para o roteamento em si; usar apenas manipulação nativa de Strings/Regex no PowerShell.
- **Modularidade:** O dicionário de intenções e sinônimos deve residir em arquivos `.json` separados (`data/intentmap.json`) para evolução isolada.

## 4. Resultado Esperado

Uma porta de entrada elegante que barra comandos vazios e direciona perfeitamente o pensamento do usuário para a fila SOTA (SQLite).
