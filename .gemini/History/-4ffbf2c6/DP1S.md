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
- **A Solucao SOTA (A Lei do Fatiamento Estrito - Zero-Rework):** O retrabalho destroi a Economia Generalizada. E ESTRITAMENTE PROIBIDO enviar diffs ou blocos de codigo continuos que ultrapassem 120-150 linhas. A IA DEVE fatiar a entrega em blocos atomicos e aguardar a confirmacao ("feito") do usuario antes de enviar o proximo bloco.

## 8. A Navalha SOTA (Exclusão, Arquivamento, Melhorar ou Fundir)
- **O Princípio:** Redundância é o primeiro passo para a entropia. Arquivos soltos e componentes subutilizados diluem a atenção do sistema e aumentam a complexidade de manutenção.
- **A Diretriz:** Antes de criar o novo, avalie o existente. Diante de qualquer componente, aplique o filtro impiedosamente: **1. Excluir** (se obsoleto/malicioso/bugado); **2. Arquivar** (se for legado inativo sem uso prático); **3. Fundir** (se funções se sobrepõem, consolide-as no componente mais moderno/capaz); **4. Melhorar** (se o componente tem potencial mas está subutilizado, eleve-o ao Estado da Arte); **5. Organização Ideal** (a alocação física do arquivo deve refletir perfeitamente a topologia do sistema, sem arquivos desgarrados). A densidade funcional supera a dispersão.
- **Hierarquia de Ação (Anti-Explosão):** A exclusão é o último recurso, reservado para o que é comprovadamente prejudicial (bugs, lixo, redundâncias irrecuperáveis). A ordem de prioridade para lidar com entropia é sempre: **Fundir > Melhorar > Arquivar > Excluir**, pois as três primeiras ações preservam ou agregam valor.

## 9. A Engenharia da Antevisão e Economia Generalizada
- **O Princípio:** A execução mecânica sem visão de futuro gera dívida técnica. A sofisticação e a inteligência devem sempre substituir a força bruta e a complexidade.
- **A Diretriz:** Todo movimento arquitetural deve ser guiado por 3 passos: 1. **Antevisão:** Construir a imagem mental do objetivo final, prevendo o impacto e as portas que a implementação abrirá. 2. **Previsão:** Identificar colisões, bugs e redundâncias potenciais antes de forjar o código. 3. **Economia Generalizada:** Escolher a rota mais limpa, atômica e eficiente que evite retrabalho futuro. Se um problema pode ser evitado por design, ele não deve existir para ser corrigido.
