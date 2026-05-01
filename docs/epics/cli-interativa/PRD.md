# PRD: A Membrana Inteligente (Smart CLI v2.0)

> **Autor:** @planner (via CHICO) | **Epico:** CLI-INTERATIVA

## 1. Visao Geral

Evoluir o arquivo `do.ps1` (wrapper do Worker) de um mero "dumb pipe" passivo para um Duto Interativo de Intencao (Membrana Semipermeavel). A interface deve reduzir a carga cognitiva humana, roteando comandos baseados em linguagem natural para o Especialista SOTA adequado.

## 2. Requisitos Funcionais

- **Roteamento Heuristico:** Deve utilizar chaves RegEx para "adivinhar" o agente adequado baseado no input (ex: "preciso codar a tela" -> `@implementor`).
- **Confirmacao Interativa (Handshake):** Ao inferir um agente, o sistema deve pedir confirmacao [Y/n]. Se `n`, permite insercao manual.
- **Modo de Sujeicao (-Force):** O parametro `-Force` deve bypassar a confirmacao humana (util para orquestracao automatica).
- **Direcionamento Direto:** Iniciar a string com `@agente` deve sobrescrever qualquer heuristica imediatamente.
- **Easter Eggs:** Ao iniciar (Boot), o sistema tem 10% de chance de exibir um aforismo do `@maverick` para manter a cultura Cyber-Estetica vibrante.

## 3. Requisitos Nao-Funcionais

- **Performance:** Zero delay perceptivel. Nao usar LLM para o roteamento em si; usar apenas manipulacao nativa de Strings/Regex no PowerShell.
- **Modularidade:** O dicionario de intencoes e sinonimos deve residir em arquivos `.json` separados (`data/intentmap.json`) para evolucao isolada.

## 4. Resultado Esperado

Uma porta de entrada elegante que barra comandos vazios e direciona perfeitamente o pensamento do usuario para a fila SOTA (SQLite).

