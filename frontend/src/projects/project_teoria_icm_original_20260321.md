---
name: Teoria ICM original de Raphael Vitoi
description: Conceitos originais de ICM pos-flop que Raphael desenvolveu e que precisam ser formalizados e injetados no simulador.
type: project
---

# Teoria ICM original de Raphael Vitoi

## Conceitos Originais (não existem na literatura)

### 1. Teto do RP

- Limite mecanico de defesa imposto pelo RP. Nao e binario (Death Zone em 40%) - e gradual, ja opera em 6%.

- O OOP defende ate onde o RP permite, nao pelo MDF classico.
- Nos toy games: OOP mantem mesma frequencia de defesa mesmo quando IP aumenta bluffs - defende no Teto, nao abaixo nem acima.

### 2. Vantagem de Risco (Risk Advantage)

- Subtracao entre RPs (ida - volta). Metrica da proporcao de agressividade permitida.

- Hipotese forte de Raphael: "a agressividade do CL e quase a proporcao exata da subtracao dos dois RPs"
- Precisa validacao contra mais spots do HRC.

### 3. Economia de Perspectiva vs Fichas

- CL nao briga por fichas, briga por perspectiva matematica de posicoes superiores.

- "Fichas perdidas impactam mais que conquistadas" e verdade mas enganosa para CL com distancia suficiente.
- CL aposta para negar perspectiva alheia, nao para acumular.

### 4. Especulacao Assimetrica

- Mid-stack entra no pote nao por pot odds, mas por implied odds de ICM.

- Investe pouco, absorve agressividade obrigatoria do CL, realiza equity passivamente quando acerta.
- Se acerta, perspectiva e expectativa matematica explodem.
- Inverso do que pedagogia convencional ensina ("tighten up sob ICM").

### 5. Fold Estrutural (nao Overfold)

- 75% de fold contra CL nao e erro - e frequencia GTO sob ICM.

- "Overfold" e vicio de linguagem herdado do ChipEV. Terminologia correta: fold estrutural.

### 6. ICM ultrapassa ChipEV nos extremos

- Quando Vantagem de Risco e imensa, ICM fica MAIS agressivo que ChipEV, nao mais tight.

- Contradiz consenso popular. O CL com distancia massiva de RP ultrapassa o "teto negativo" do ChipEV.
- Na media dos MTTs a distancia nao e tao alta (jogo mais tight). Mas na FT com disparidade de stacks, e comum.

### 7. Dissipacao do RP por Street

- RP pos-flop e ABSTRACAO - depende de sizing, textura, agressividade, configuracao de stacks, payout.

- RP "geral" diminui a cada street (pot cresce, stack efetiva diminui, pressao ICM cai).
- MAS nao e proporcional a perspectiva matematica restante da stack.
- Defensor fortalece range pre/flop/turn para se defender no river (fold mais, call em vez de 3bet, XR baixo e polar).

### 8. RP como Abstracao

- "O ICM esta errado em essencia, mas e como a democracia - o melhor modelo orientativo que temos."

- RP depende de milhares de variaveis. Nao e numero fixo - e abstracao contextual.
- Edge (variavel humana subjetiva) nao cabe em equacao. Solucao proposta: faixas ponderadas.

### 9. Faixas Ponderadas (ideia para formalizacao)

- Em vez de pontos fixos, o motor cuspir distribuicao com centro de gravidade.

- Centro = matematica pura (output do solver). Limites = abstracao humana (edge, emocao, historico).
- Spread como funcao de Vantagem de Risco, SPR, e coeficiente de incerteza.
- "Nao e exato, mas e honesto. Honesto e melhor que falso-preciso."

### Dados Empiricos Disponiveis

- 8 Toy Games com dados do Piosolver (Aula 1) - LIDOS E ABSORVIDOS

- 93 nodes HRC vs GTO Wizard (Aula 1.2, BTN 38bb vs BB 53bb, RP 21.4% vs 12.9%)
- Prova matematica do teto de equidade no river (max ~41%, nao ultrapassa 45%)
- Estudos Monte Carlo sobre max late register e tamanho de field

### Estrutura dos Toy Games (Aula 1)

Board: 22223 | IP: AA/QQ/JJ (18 combos) | OOP: KK (6 combos - bluffcatcher puro)
Pot: 100 | Aposta unica: 100 (pot-size all-in) | OOP sempre checa primeiro
Premissa: clairvoyance, sem edge, sem abstracoes, sizings definidas

**Parte I - IP RP=3 fixo, OOP RP progressivo (0→24):**

- TG1 ChipEV: IP 6v+3b, OOP call 50% (MDF=alpha=50%)
- TG2 OOP RP=6: IP bluffs → 4.2 combos. OOP fold levemente mais.
- TG3 OOP RP=9: IP bluffs → 5 combos. OOP atinge TETO - para de foldar mais. IP explota bluffando mais, OOP mantem mesma call freq.
- TG4 OOP RP=18: IP 6v vs 8b (desequilibrado ChipEV). OOP continua no mesmo Teto.
- TG5 OOP RP=24: IP ataca mais. OOP no mesmo Teto. Respostas ICM raramente sao extremas.

Duas frequencias distintas: (1) com que freq OOP ENFRENTA o shove (aumenta), (2) com que freq OOP CHAMA quando enfrenta (estavel no Teto).
O Teto e Nash: custo de eliminacao ancora defesa num piso fixo onde qualquer desvio piora EV.

**Parte II - OOP RP=3 fixo, IP RP progressivo (9→21):**

- TG1 IP RP=9: IP bluffa levemente acima ChipEV. OOP com RP baixo PAGA MENOS.
- TG2 IP RP=18: IP mantem mesmo range bluff-heavy. OOP fold cada vez mais.
- TG3 IP RP=21: Mesmo range IP. OOP chega a ~80% de fold.

Mecanismo da Parte II: dobrar o IP aumenta stack dele, reduz pressao ICM da mesa inteira, beneficia todos exceto quem ele eliminar. Custo de dar fichas ao IP supera EV de capturar o bluff. OOP preserva paisagem de pressao.

**Conceito Batata Quente:** IP shove impoe RP+FE sobre OOP. OOP nao pode devolver (nao ha re-shove devolvendo a pressao). OOP arca sozinho com o peso da decisao.

**RP de ida vs RP de volta:** Conceito da realidade do torneio, nao demonstrado nos toy games. No toy game o RP e variavel controlada imposta artificialmente - nao emerge de stacks reais. Em torneio real, quem abre tem "RP de ida" e quem responde tem "RP de volta", e geralmente diferem.

### 10. Donk Bet em ICM (Aula 1.2 Adendo)

- ICM algema o IP → forca check-back com frequencia elevada → OOP lidera com sizing minimo (10-20% do pote)

- IP nao pode punir com raise porque crescer o pote viola seu proprio incentivo ICM
- Loop fechado: passividade forcada do IP cria brecha que o donk bet explora, e a mesma pressao ICM impede a punicao
- Termo: "ataque defensivo" - agressivo na forma, defensivo na funcao (proteger equity, nao construir pote)
- Qualificacao: depende de SPR, textura do board, magnitude do RP do IP. Nao e principio universal.

### 11. Efeito de Irradiacao (Aula 1.2 Adendo)

- Micro-stack nao precisa jogar uma mao sequer para alterar a estrategia otima de todos

- Externalidade pura: mera existencia altera funcoes de utilidade dos demais
- "A variavel sobrevivencia supera qualquer equidade de cartas"
- O efeito e um gradiente, nao binario: varia com tamanho do micro-stack, distancia do payjump, estrutura de premiacao
- Paradoxo com Donk Bet: a brecha para donk bet abre exatamente quando o custo de qualquer acao sobe (irradiacao maxima)

### Analise Opus Web - Pontos Validados

- Mecanismo do Teto: utilidade marginal decrescente → assimetria custo/ganho → limiar de call. Correto.

- Refutacao tripartite de "fichas perdidas valem mais": (a) custo de oportunidade de nao pressionar, (b) fold equity tem valor sem risco de eliminacao, (c) nao acumular permite rivais crescerem
- Tensao solver: toy games dependem de outputs numericos mas o texto diz pra nao focar nos numeros. Resolucao: numeros sao ilustracoes do padrao, nao prescricoes de frequencia.

**Why:** Estes conceitos sao a base teorica do simulador e do site inteiro. Cada formalizacao bem-sucedida vira metrica no motor.
**How to apply:** Ao trabalhar no motor ou nos cenarios, sempre verificar se o output e consistente com estes conceitos. Nunca simplificar a ponto de contradize-los.
