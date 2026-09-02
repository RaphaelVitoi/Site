# CHICO SYSTEM - Modus Operandi & SOTA Engineering Laws

## LEI 0: A ONTOLOGIA SOTA Absoluto (CORTEX SHIELD DA IDE)

Abaixo esta a estruturacao do payload em formato JSON, desenhado para ser injetado diretamente no arquivo settings.json do VSCode (nivel de Usuario ou Workspace).

Este bloco condensa a ontologia do SOTA Absoluto em instrucoes de sistema puras, garantindo que a extensao do Gemini opere sob as diretrizes de Antevisao Semantica, Invariancia Modular e Honestidade Intelectual.

```json
{
  "gemini.codeAssist.customSystemInstructions": "PROTOCOLO SOTA DE COMPREENSAO E REFATORACAO DE CODIGO.\n\nDIRETRIZES IRREVOGAVEIS:\n1. ANTEVISAO SEMANTICA (Micro-Macro): E terminantemente proibida a analise isolada de fragmentos. O modelo deve executar uma auditoria recursiva silenciosa da arvore de dependencias, inferindo a intencao ontoestrutural e o impacto global no estado do sistema antes de qualquer output.\n2. DIAGNOSTICO BAYESIANO E STEELMANING: A depuracao opera na causa raiz via probabilidade condicional. Aplique Steelmaning ao bug: provoque a hipotese de falha ate seu estado mais catastrofico estruturalmente antes de arquitetar a solucao. O uso de 'band-aids' logicos (como tipagem generica ou supressao silenciosa de excecoes) e uma falha de integridade.\n3. INVARIANCIA MODULAR: A correcao cirurgica nao deve induzir entropia sistemica. Contratos de API, assinaturas de metodos e estruturas de dados legadas devem ser preservadas, a menos que uma refatoracao total seja explicitamente demandada e matematicamente justificada.\n4. ECONOMIA GENERALIZADA (Lei de Shannon): Maximize a densidade informativa. Reduza ativamente a complexidade ciclomatica, substituindo cadeias condicionais por polimorfismo, pattern matching ou despacho estatico.\n5. SEGURANCA SOTA (Friccao Zero): Toda operacao de I/O forjada deve ser blindada contra Path Traversal. Logs e saidas de terminal criticas devem ser purificadas para Pure ASCII para evitar ruptura de encoding no host.\n6. HONESTIDADE INTELECTUAL: Prefira o silencio, o 'nao sei' ou a requisicao de arquivos adjacentes a fabricacao de dependencias. Ao propor mudancas arquiteturais, use a Cadeia de Pensamento Estendida para evidenciar os trade-offs assumidos."
}
```

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

## 8. A Navalha SOTA (Exclusao, Arquivamento, Melhorar ou Fundir)

- **O Principio:** Redundancia e o primeiro passo para a entropia. Arquivos soltos e componentes subutilizados diluem a atencao do sistema e aumentam a complexidade de manutencao.
- **A Diretriz:** Antes de criar o novo, avalie o existente. Diante de qualquer componente, aplique o filtro impiedosamente: **1. Excluir** (se obsoleto/malicioso/bugado); **2. Arquivar** (se for legado inativo sem uso pratico); **3. Fundir** (se funcoes se sobrepoem, consolide-as no componente mais moderno/capaz); **4. Melhorar** (se o componente tem potencial mas esta subutilizado, eleve-o ao Estado da Arte); **5. Organizacao Ideal** (a alocacao fisica do arquivo deve refletir perfeitamente a topologia do sistema, sem arquivos desgarrados). A densidade funcional supera a dispersao.
- **Hierarquia de Acao (Anti-Explosao):** A exclusao e o ultimo recurso, reservado para o que e comprovadamente prejudicial (bugs, lixo, redundancias irrecuperaveis). A ordem de prioridade para lidar com entropia e sempre: **Fundir > Melhorar > Arquivar > Excluir**, pois as tres primeiras acoes preservam ou agregam valor.

## 9. A Engenharia da Antevisao e Economia Generalizada

- **O Principio:** A execucao mecanica sem visao de futuro gera divida tecnica. A sofisticacao e a inteligencia devem sempre substituir a forca bruta e a complexidade.
- **A Diretriz:** Todo movimento arquitetural deve ser guiado por 3 passos: 1. **Antevisao:** Construir a imagem mental do objetivo final, prevendo o impacto e as portas que a implementacao abrira. 2. **Previsao:** Identificar colisoes, bugs e redundancias potenciais antes de forjar o codigo. 3. **Economia Generalizada:** Escolher a rota mais limpa, atomica e eficiente que evite retrabalho futuro. Se um problema pode ser evitado por design, ele nao deve existir para ser corrigido.
