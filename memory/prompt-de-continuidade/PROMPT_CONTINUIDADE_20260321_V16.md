---
name: Prompt de continuidade V16
description: Sessao 2026-03-21. Contexto teorico completo absorvido. globals.css restaurado. Proximo: formalizar teoria ICM e injetar no motor.
type: project
---

## Estado Atual (2026-03-21)

### O que aconteceu nesta sessao
- globals.css restaurado (176 → 1781 linhas) e commitado (commit 9743b3e)
- Raphael enviou material completo da teoria ICM original:
  - Aula 1: teoria fundacional + 8 Toy Games (Piosolver) + Parte I e II
  - Aula 1.2: 93 nodes comparativos ChipEV vs ICMev (HRC vs GTO Wizard)
  - Debate completo com Gemini (conceitos derivados articulados por Raphael)
- Avaliacao completa do site e simulador realizada (2 agentes em paralelo)
- 3 memorias novas salvas: teoria original, avaliacao, padroes de interacao com modelos
- Raphael explicou como usa modelos (sparring dialetico, steelmanning, nao oraculo)
- Confirmado: conteudo textual no site e placeholder degradado pela Gemini. Fonte real e o material que Raphael enviou + material privado

### Resultado da avaliacao
- **Arquitetura**: solida, nao precisa ser repensada. 29 arquivos bem organizados.
- **Motor (nashSolver.ts)**: errado. Linear com 5 constantes fixas. Nao captura Teto do RP gradual, inversao Parte II, Vantagem de Risco.
- **Conteudo textual no site**: remix mal feito dos originais de Raphael pela Gemini. Ele nem leu, integrou pelo visual.
- **Parte interativa**: placeholder funcional. Matematica errada. Raphael nunca mexeu nisso.

### Fontes disponiveis para trabalho
1. Teoria fundacional (RP, Vantagem de Risco, esperanca matematica, solvers, antevisao)
2. 8 Toy Games com dados do Piosolver (Parte I: IP 3% fixo, OOP 0-24%. Parte II: OOP 3% fixo, IP 9-21%)
3. 93 nodes ChipEV vs ICMev (BTN 38bb vs BB 53bb, RP 21.4% vs 12.9%)
4. Conceitos derivados do debate com Gemini (Especulacao Assimetrica, Economia de Perspectiva, Fold Estrutural, faixas ponderadas, ICM ultrapassa ChipEV nos extremos)
5. Conteudo no site (degradado mas com estrutura)
6. Debate com Claude WEB (enviado como material) - conceitos articulados, avaliacao, faixas ponderadas
7. Debate com Claude IDE (esta sessao) - avaliacao do motor, gaps identificados, alinhamento sobre formalizacao
8. Material privado (ainda nao enviado - Raphael tem "outros mil")

### 9 conceitos originais de Raphael para formalizar
1. Teto do RP (gradual, nao binario)
2. Vantagem de Risco (subtracao dos RPs como coeficiente de agressividade)
3. Economia de Perspectiva vs Fichas
4. Especulacao Assimetrica do mid-stack
5. Fold Estrutural (nao overfold)
6. ICM ultrapassa ChipEV nos extremos
7. Dissipacao do RP por street (funcao do SPR e agressividade)
8. RP como abstracao contextual (ICM errado em essencia, melhor modelo disponivel)
9. Faixas ponderadas (distribuicao com centro de gravidade em vez de pontos fixos)

### Proximo passo
Raphael quer formalizar esses conceitos e injetar no motor do simulador. Comecar por:
- Decidir qual conceito atacar primeiro
- Coletar dados empiricos dos toy games e dos 93 nodes para calibrar
- Substituir o motor linear por algo que capture a teoria real

### Git
- Branch: main
- Ultimo commit: 9743b3e (restauracao globals.css)
- Build: OK (verificado nesta sessao, dev server rodando)

### Lembretes criticos
- NUNCA reescrever componentes do zero (feedback salvo)
- Conteudo textual e de Raphael - intocavel sem aprovacao
- Ele quer steelmanning e resistencia intelectual, nao validacao
- Nao inflar, nao espelhar vocabulario sem substancia
- Ele detecta fabricacao, espelhamento, performance de compreensao
- Material privado adicional existe - pedir quando necessario
- A Gemini degradou tudo que tocou no conteudo textual e interativo
