# Conceito: A Membrana Inteligente (Smart CLI)
>
> Autor: @maverick | Origem: Relatório Sentinela 2026-03-12

## A Tese

Atualmente, o `do.ps1` é um canal passivo ('dumb pipe'). Ele aceita qualquer coisa e joga na fila. Isso transfere a carga cognitiva de roteamento para o sistema ou para o usuário (que precisa saber o que pedir).

Precisamos evoluir o `do.ps1` para uma **Membrana Semipermeável Inteligente**.

## A Inovação

O terminal não deve apenas receber comandos; deve **negociar** intenções.

### UX Proposta (O Dialogo)

1. **Usuário:** `.\do "quero melhorar a segurança"`
2. **Sistema (Análise de Intent):** Detecta palavras-chave de segurança.
3. **Sistema (Sugestão):** "Parece que você quer uma auditoria. Deseja acionar o @securitychief diretamente? [S/N]"
4. **Resultado:** Roteamento preciso desde a entrada, reduzindo ruído na fila.

## Isomorfismo Biológico

Assim como uma membrana celular seleciona o que entra com base em receptores, a CLI deve selecionar inputs com base em padrões conhecidos (Regex/Keywords), rejeitando entropia (inputs vazios/confusos) na porta de entrada.

## Diretrizes para o @planner

- Não use IA pesada na CLI (latência). Use heurísticas rápidas (Regex).
- Mantenha a compatibilidade com o modo não-interativo (flags `-Force`).
- O objetivo é velocidade e precisão de roteamento.
