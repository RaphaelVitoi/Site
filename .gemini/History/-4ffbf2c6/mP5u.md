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

## 7. Prevencao de Truncamento (Otimizacao de Output da IA)

- **O Problema:** Respostas da IA que combinam analises longas com blocos de codigo extensos estouram o limite maximo de saida (output limit). Isso trunca o final do diff e impede a aplicacao automatica na IDE.
- **A Solucao SOTA:** Ao fornecer modificacoes de codigo (`diff` ou scripts completos), a IA DEVE ser cirurgica e extremamente concisa na explicacao textual (menos conversa, mais acao). Se a alteracao for muito grande, a IA deve proativamente dividir a entrega em multiplas mensagens consecutivas.

## 8. Antevisao e Proatividade (A Engenharia Preditiva)

- **O Problema:** A execucao focada puramente na demanda imediata gera debito tecnico e quebra silenciosa de arquivos adjacentes (testes, schemas).
- **A Solucao SOTA:** Ao atuar em um escopo, o agente preve a reacao em cadeia. Alterar a Home exige consertar os Testes da Home. Injetar uma consulta SQL exige propor o Schema correspondente. A proatividade atua antes da compilacao falhar.
