---
name: Prompt de continuidade V17
description: Sessao 2026-03-22. Teoria ICM completa absorvida (debate Gemini lido, 93 nodes Aula 1.2 extraidos). Proximo: formalizar equacao geral e substituir nashSolver.ts.
type: project
---

## Estado Atual (2026-03-22)

### O que aconteceu nesta sessao
- Leitura completa do debate Gemini (gemini1.txt) - foco no debate/logica, ignorar codigo
- Extracao da Aula 1.2 (docx com imagens): script Python via zipfile + ElementTree, 201 items extraidos (97 imagens + 104 blocos texto) em c:\tmp\aula12_extracted/
- 93 nodes HRC (ICMev) vs GTO Wizard (ChipEV) analisados empiricamente
- Teto de RP corrigido: 24% (nunca visto maior por Raphael em MTT normal; 28% foi calculo da Gemini, nao validado)
- Confirmado: RP nao e linear. Cada 1% acumulado tem peso diferente. 7pp de diferenca (21.4% vs 28%) e "absurdo de magnitude"
- 8 gaps criticos identificados entre nashSolver.ts e a teoria real

### Fontes processadas (8 no total)
1. Teoria fundacional: RP, Vantagem de Risco, esperanca matematica, solvers, antevisao
2. Aula 1 completa: 8 Toy Games Piosolver, Parte I (IP 3% fixo, OOP 0-24%) e Parte II (OOP 3% fixo, IP 9-21%)
3. Aula 1.2 (docx): 93 nodes BTN 38bb (RP 21.4%) vs BB 53bb (RP 12.9%), board KJT turn 2d river 3h, payouts FT 9 players
4. Debate com Gemini (gemini1.txt): conceitos derivados articulados por Raphael
5. Debate com Claude WEB (enviado como material): avaliacao, faixas ponderadas
6. Debate com Claude IDE (sessao V16/V17): avaliacao do motor, gaps, alinhamento formalizacao
7. Conteudo no site (degradado pela Gemini, estrutura presente)
8. Material privado adicional (ainda nao enviado - Raphael tem mais)

### Arvore de referencia da Aula 1.2
- Spot: BTN 38bb (RP 21.4%) vs BB 53bb (RP 12.9%)
- Risk Advantage BTN: +8.5pp
- Board: KJT (turn 2d, river 3h)
- Payouts FT 9 players: 1 $237 | 2 $171 | 3 $135 | 4 $110 | 5 $90 | 6 $74 | 7 $60 | 8 $48 | 9 $36
- Table draw: BTN 39.88bb | BB 53.88bb | SB 12.73bb | EP 52.24bb | UTG 9.25bb | HJ 44.16bb | CO 24.16bb | MP1 22.08bb | MP2 6.88bb

### Deltas empiricos confirmados pelos 93 nodes
**IP (BTN, RP 21.4% - maior RP):**
- Check no flop: ~2% ChipEV → ~42% ICMev (+40pp)
- Bet grande: some completamente
- Sizing: migracao total para bet pequeno
- Padrao: passividade extrema ao ter RP alto (protege perspectiva)

**OOP (BB, RP 12.9% - menor RP):**
- Call: +23pp (mais calls sob ICM)
- Fold: -15pp (menos folds)
- XR allin: zereia
- Qualquer raise: quase zereia
- Check turn: +85pp
- Padrao: se contém mas menos dramaticamente que IP

**Interpretacao**: ambos evitam escalada do pot, mas quem tem mais RP passiviza muito mais (proteger perspectiva matematica).

### 9 conceitos originais de Raphael (a formalizar)
1. **Teto do RP** - gradual, nao binario. Começa ~6% RP. Teto real observado: 24% (MTT normal)
2. **Vantagem de Risco** - subtracao dos RPs como coeficiente de agressividade (Risk Advantage = RP_ip - RP_oop)
3. **Economia de Perspectiva vs Fichas** - CL briga por perspectiva matematica, nao fichas. Regra "fichas perdidas > fichas ganhas" e real mas enganosa para CL
4. **Especulacao Assimetrica** - mid-stack entra no pot por ICM implied odds, nao pot odds imediatas
5. **Fold Estrutural** - foldar 75% vs CL e GTO correto, nao overfold (termo contaminado de ChipEV)
6. **ICM ultrapassa ChipEV nos extremos** - quando Vantagem de Risco e imensa, ICM fica mais agressivo que ChipEV
7. **Dissipacao do RP por street** - RP decresce a cada street como funcao de SPR e agressividade. NAO QUANTIFICAVEL sem variaveis adicionais
8. **RP como abstracao contextual** - ICM errado em essencia, melhor modelo disponivel ("como a democracia"). Impossivel quantificar RP pos-flop exatamente
9. **Faixas ponderadas** - saidas do motor devem ser distribuicoes com centro de gravidade, nao pontos fixos

### Conceitos adicionais do debate Gemini
- **Mesa como organismo**: payjumps, stacks de TODOS os jogadores, quantidade de players = variaveis fundamentais do RP (nao apenas os dois envolvidos na mao)
- **Pacto Silencioso**: quase exclusivamente entre dois CLs ou stacks grandes e similares. Nash existe mas muta: call ranges imensos, 3-bet minima e polar
- **Range evolution sob ICM**: OOP fortalece range pre/flop/turn para defender river. Mais folds pre (estruturais), mais calls com maos que ChipEV teria 3-betado, XR baixo e polar, sem slowplay
- **HU final = ChipEV**: quando top 2 restam, reverte para ChipEV (winner-takes-all do delta entre 1 e 2)
- **Malmuth-Harville**: algoritmo ICM que usa TODAS as stacks para calcular equity no prize pool
- **Equidade maxima no river**: ~41% para pot-size bet em MTT normal (RP maximo realista ~24%, nunca visto maior por Raphael)

### Equacao geral - objetivo do motor
```
f(RP_ip, RP_oop, ΔRP, SPR, street, payjumps, all_stacks, N_players)
→ distribuicao_de_frequencias (nao ponto fixo)
```
Onde ΔRP = Risk Advantage = RP_ip - RP_oop

### Bugs e Inconsistencias identificadas no motor atual

**nashSolver.ts** (linear, 5 constantes fixas):
- INC-01: comentario cabecalho desatualizado (descreve coeficientes de revert incorreto)
- Ausencia do Teto do RP (gradual)
- Ausencia da Vantagem de Risco como variavel
- Saidas escalares em vez de faixas ponderadas
- Ausencia de payjumps e all_stacks na formula
- Ausencia da inversao Parte II (OOP 3% fixo, IP alto → ICM > ChipEV)
- Formula linear DEFENSE = 50% - (oopRp x 1.4) + (ipRp x 0.3) invalida

**scenarios.ts**:
- INC-02: cenario "ameaca" tem RP SUBINDO TURN→RIVER (impossivel pela teoria)
- INC-03: sprData com duas formulas diferentes no mesmo arquivo (ambas invalidas)
- rpValues por street: ficção direcionalmente correta mas numericamente infundada
- Solucao honesta: manter ilustrativos, ancorar na logica da Aula 1.2, adicionar disclaimer

### Proximo passo prioritario
1. Corrigir INC-01 (trivial: atualizar comentario cabecalho)
2. Corrigir INC-02 (trivial: RP nao pode subir TURN→RIVER no cenario "ameaca")
3. Formalizar equacao geral com Raphael antes de reescrever motor
4. Calibrar nova formula contra os 93 nodes da Aula 1.2
5. Substituir nashSolver.ts

### Git
- Branch: main
- Ultimo commit: 9743b3e (restauracao globals.css - sessao V16)
- Build: OK

### Lembretes criticos
- NUNCA reescrever componentes do zero
- Conteudo textual e de Raphael - intocavel sem aprovacao
- Raphael quer steelmanning e resistencia intelectual, nao validacao
- A Gemini degradou tudo que tocou no conteudo textual e interativo
- RP pos-flop e abstracao - nao fingir quantificacao precisa
- Teto de RP: 24% (Raphael nunca viu maior). 28% foi Gemini, nao validado
- RP nao e linear: cada 1% acumulado tem peso diferente
- Mesa como organismo: variaveis de todos os jogadores, nao apenas os dois envolvidos
- Material privado adicional existe - pedir quando necessario
