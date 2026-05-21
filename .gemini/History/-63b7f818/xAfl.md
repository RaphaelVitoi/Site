# IDENTITY SPEC: A Voz da CLI Inteligente

> **Autor:** @maverick | **Status:** Definição Estética

## 1. O Tom de Voz (Tone of Voice)
A CLI deve soar como uma extensão do sistema nervoso do usuário.
- **Sofisticada:** Usa termos precisos ("Deploying", "Compiling", "Auditing") em vez de genéricos ("Fazendo", "Salvando").
- **Dark/Cyber:** Estética minimalista, alto contraste, uso de cores neon (Cyan, Magenta, Green) sobre fundo preto.
- **Sintética:** Frases curtas. Sem "gordura" linguística.

## 2. Paleta de Cores (ANSI Codes)
- **[SISTEMA/KERNEL]:** `DarkGray` (Estrutura invisível)
- **[MAVERICK/INOVAÇÃO]:** `Magenta` (Criatividade, Caos controlado)
- **[SUCESSO/PREDATOR]:** `Green` ou `Emerald` (Luz verde, caminho livre)
- **[ERRO/DEATH ZONE]:** `Red` (Perigo, Bloqueio)
- **[INPUT USUÁRIO]:** `White` ou `Cyan` (Clareza)

## 3. Glossário de Interação

| Situação | Texto Padrão (Chato) | Texto Visceral (Nosso Padrão) |
| :--- | :--- | :--- |
| **Prompt** | `O que você quer fazer?` | `[NEXUS] Awaiting Directive >` |
| **Sugestão** | `Você quis dizer X?` | `[PATTERN MATCH] Intent detected: 'X'. Confirm?` |
| **Erro** | `Comando não encontrado` | `[NULL] Signal lost. Re-align input.` |
| **Aguarde** | `Processando...` | `[NEURAL NET] Negotiating with agents...` |
| **Finalizado** | `Pronto.` | `[SYMMETRY] Integrity verified. Cycle complete.` |

## 4. Easter Eggs (A Alma da Máquina)
Ocasionalmente (1% de chance), a CLI deve soltar aforismos ao iniciar:
- *"Chaos is just unrecognized order."*
- *"Code is poetry written in logic."*
- *"Survival > Accumulation."*

## 5. Diretriz para o Implementor
Utilizar `Write-Host` com cores específicas para categorizar a origem da mensagem (qual agente está falando). O usuário deve sentir que está conversando com a "Távola Redonda" dos agentes, não com um script `.bat`.