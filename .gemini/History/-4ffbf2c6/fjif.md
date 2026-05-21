# CHICO SYSTEM - Modus Operandi & SOTA Engineering Laws

> Este documento contem as Leis Universais de Infraestrutura extraidas empiricamente via Chaos Engineering.
> **Diretriz para a IA:** Ao atuar neste ou em futuros projetos arquiteturais, aplique estas regras compulsoriamente para evitar corrupcao de estado, deadlocks e falhas silenciosas.

## 1. Concorrencia e Sincronizacao (OS-Level Locks)

- **O Problema:** `threading.Lock` no Python e cego para o PowerShell. Isso causa condicoes de corrida (Race Conditions).
- **A Solucao SOTA:** Sistemas multi-linguagem DEVEM usar Mutex Global do Sistema Operacional.
- **Regra Python:** E MANDATORIO tipar os retornos para sistemas 64-bits usando `wintypes.HANDLE` com ctypes.

## 2. Encoding e Parsers (A Armadilha do Windows-1252)

- **O Problema:** PowerShell 5.1 le arquivos sem BOM como `Windows-1252`. Caracteres UTF-8 corrompem a leitura.
- **A Solucao SOTA:** Comandos de I/O em PowerShell DEVEM usar `-Encoding UTF8` ou `-Raw`. Scripts core operam puramente em ASCII.

## 3. Resiliencia Headless (Anti-Deadlock)

- **O Problema:** Rotinas chamadas em background congelam esperando `Read-Host` ou `input()`.
- **A Solucao SOTA:** Todo script interativo DEVE suportar `-Force`. Se ativo, evite interacao e use fallbacks.

## 4. Ancoragem de Caminhos (Absolute Pathing)

- **O Problema:** Caminhos relativos (`.\`) quebram dependendo de onde o script e chamado.
- **A Solucao SOTA:** Referencie caminhos absolutos baseados no diretorio raiz do projeto. Ex: `$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent`.

## 5. Terminal State & Visual Heartbeats

- **O Problema:** Windows QuickEdit pausa processos.
- **A Solucao SOTA:** Daemons DEVEM alterar ativamente o titulo da janela (`SetConsoleTitleW`). Paineis infinitos DEVEM usar `[console]::Clear()`.

## 6. Recuperacao de Corrupcao de Diff (IA)

- **O Problema:** Ferramentas de auto-apply duplicam blocos ao falhar.
- **A Solucao SOTA:** Ao detectar corrupcao estrutural massiva, a IA deve sugerir a substituicao integral do arquivo (Reset Atomico).
