---
id: cli-interativa-identity-spec
tipo: especificacao
escopo: Site
autor: Raphael Vitoi
criado_em: 2026-11-15T00:00:00-03:00
verificado:
  - Definicao estetica e tom de voz da CLI interativa
nao_verificado:
  - Validacao da identidade junto ao orquestrador CLI em runtime
title: "IDENTITY SPEC: A Voz da CLI Inteligente"
type: technical
status: active
owner: site-governance
updated_at: 2026-11-15
---

# IDENTITY SPEC: A Voz da CLI Inteligente

> **Autor:** @maverick | **Status:** Definicao Estetica

## 1. O Tom de Voz (Tone of Voice)

A CLI deve soar como uma extensao do sistema nervoso do usuario.

- **Sofisticada:** Usa termos precisos ("Deploying", "Compiling", "Auditing") em
  vez de genericos ("Fazendo", "Salvando").
- **Dark/Cyber:** Estetica minimalista, alto contraste, uso de cores neon (Cyan,
  Magenta, Green) sobre fundo preto.
- **Sintetica:** Frases curtas. Sem "gordura" linguistica.

## 2. Paleta de Cores (ANSI Codes)

- **[SISTEMA/KERNEL]:** `DarkGray` (Estrutura invisivel)
- **[MAVERICK/INOVACAO]:** `Magenta` (Criatividade, Caos controlado)
- **[SUCESSO/PREDATOR]:** `Green` ou `Emerald` (Luz verde, caminho livre)
- **[ERRO/DEATH ZONE]:** `Red` (Perigo, Bloqueio)
- **[INPUT USUARIO]:** `White` ou `Cyan` (Clareza)

## 3. Glossario de Interacao

| Situacao       | Texto Padrao (Chato)     | Texto Visceral (Nosso Padrao)                    |
| :------------- | :----------------------- | :----------------------------------------------- |
| **Prompt**     | `O que voce quer fazer?` | `[NEXUS] Awaiting Directive >`                   |
| **Sugestao**   | `Voce quis dizer X?`     | `[PATTERN MATCH] Intent detected: 'X'. Confirm?` |
| **Erro**       | `Comando nao encontrado` | `[NULL] Signal lost. Re-align input.`            |
| **Aguarde**    | `Processando...`         | `[NEURAL NET] Negotiating with agents...`        |
| **Finalizado** | `Pronto.`                | `[SYMMETRY] Integrity verified. Cycle complete.` |

## 4. Easter Eggs (A Alma da Maquina)

Ocasionalmente (1% de chance), a CLI deve soltar aforismos ao iniciar:

- _"Chaos is just unrecognized order."_
- _"Code is poetry written in logic."_
- _"Survival > Accumulation."_

## 5. Diretriz para o Implementor

Utilizar `Write-Host` com cores especificas para categorizar a origem da
mensagem (qual agente esta falando). O usuario deve sentir que esta conversando
com a "Tavola Redonda" dos agentes, nao com um script `.bat`.
