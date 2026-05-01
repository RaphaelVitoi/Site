# Conceito: A Membrana Inteligente (Smart CLI)
> Autor: @maverick | Origem: RelatArio Sentinela 2026-03-12

## A Tese
Atualmente, o do.ps1 A um canal passivo ('dumb pipe'). Ele aceita qualquer coisa e joga na fila. Isso transfere a carga cognitiva de roteamento para o sistema ou para o usuArio (que precisa saber o que pedir).

Precisamos evoluir o do.ps1 para uma **Membrana SemipermeAvel Inteligente**.

## A InovaAAo
O terminal nAo deve apenas receber comandos; deve **negociar** intenAAes.

### UX Proposta (O Dialogo)
1. **UsuArio:** .\do "quero melhorar a seguranAa"
2. **Sistema (AnAlise de Intent):** Detecta palavras-chave de seguranAa.
3. **Sistema (SugestAo):** "Parece que vocAa quer uma auditoria. Deseja acionar o @securitychief diretamente? [S/N]"
4. **Resultado:** Roteamento preciso desde a entrada, reduzindo ruAdo na fila.

## Isomorfismo BiolAgico
Assim como uma membrana celular seleciona o que entra com base em receptores, a CLI deve selecionar inputs com base em padrAes conhecidos (Regex/Keywords), rejeitando entropia (inputs vazios/confusos) na porta de entrada.

## Diretrizes para o @planner
- NAo use IA pesada na CLI (latAancia). Use heurAsticas rApidas (Regex).
- Mantenha a compatibilidade com o modo nAo-interativo (flags -Force).
- O objetivo A velocidade e precisAo de roteamento.
