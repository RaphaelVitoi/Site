## CHANGELOG DE AUDITORIA
**Auditado por @auditor** | **Data: 2026-03-08**

| # | Severidade | Localizacao | Problema Encontrado | Correcao Aplicada |
|---|-----------|-------------|--------------------|--------------------|
| 1 | ALTO | SPEC 1.1, 4.4, 11 | "Batata Quente" listada como conceito proprio de Raphael, mas nao aparece no prompt.md nem no pesquisa.md. Origem nao verificavel. | Removido da lista de conceitos proprios. Mantido como conceito emergente do TG2, mas marcado como "conceito derivado da SPEC" ao inves de "nomenclatura original" |
| 2 | ALTO | SPEC 4.2 (TG2-5), 4.3 (TG6-8) | Dados numericos dos toy-games (combos de bluff: 4.2, 5, 8; fold% do OOP) prescritos na SPEC sem verificacao contra o material original. Risco de conflito com dados reais | Adicionada nota explicita de que TODOS os numeros de combos e frequencias devem ser verificados pelo @implementor contra o arquivo original. Numeros na SPEC sao indicativos, o original prevalece |
| 3 | ALTO | SPEC 5.2 | Exemplo do Downward Drift usa placeholders "fold X%, call Y%" ao inves de dados reais | Adicionada nota para o @implementor extrair dados exatos do artigo fonte do GTO Wizard. Placeholders marcados como [VERIFICAR FONTE] |
| 4 | MEDIO | SPEC 1.1 vs prompt.md | Lista de conceitos proprios inconsistente entre documentos. SPEC lista 6+ conceitos, prompt.md lista 4-5 | Padronizada lista de conceitos confirmados pelo prompt.md. Conceitos adicionados pelo planner marcados como "a confirmar com material original" |
| 5 | MEDIO | SPEC 4.3 (TG6-8) | Dados vagos: "ligeiramente acima", "levemente inclinado", "quase 80%". Insuficiente para implementacao sem ambiguidade | Adicionada instrucao explicita para @implementor: extrair dados exatos do material original. Dados vagos mantidos como orientacao direcional, nao como valores prescritivos |
| 6 | MEDIO | SPEC global | SPEC usa em-dash (--) extensivamente. Embora NF-06 se aplique ao documento final, @implementor pode copiar trechos | Adicionado alerta explicito na secao de formato sobre evitar em-dash no documento final |
| 7 | MEDIO | SPEC 3.1 | "Antevisao" declarada como conceito proprio de Raphael sem verificacao. Aparece no pesquisa.md secao 4.1 mas sem confirmacao do material original | Mantido com nota de que deve ser verificado contra o material original. Se nao existir no original, pode ser usado como conceito da aula (nao como "nomenclatura original de Raphael") |
| 8 | BAIXO | PRD secao 2 item 3 vs R-08 | PRD diz "os erros mais comuns" (sem numero) no item 3 da secao 2, mas R-08 diz "10 erros". Prompt.md diz "8 erros" no comportamento esperado e "10 erros" na estrutura | Padronizado para 10 erros no PRD (alinhado com pesquisa.md secao 3.3 que lista exatamente 10) |
| 9 | BAIXO | SPEC 7.4 vs Modulo 5 | pesquisa.md secao 4.1 sugere "Framework de Antevisao" como item do Modulo 5, mas SPEC posiciona Antevisao no Modulo 1 e nao tem secao dedicada no Modulo 5 | Adicionada referencia cruzada no Modulo 5 para retomar Antevisao como framework aplicado |
| 10 | BAIXO | SPEC 4.2 TG1 | MDF (Minimum Defense Frequency) usada implicitamente ("paga 50% das vezes") sem nomear a formula. Publico-alvo conhece MDF, mas a formula explicita ajuda | Adicionada referencia explicita a MDF com a formula |
| 11 | INFO | SPEC global | A SPEC assume que @implementor tera acesso e lera o material original .docx. Isso e dependencia critica ja documentada na secao 9 | Nenhuma correcao necessaria, apenas reforco |
| 12 | INFO | PRD/SPEC | Uso de acentos inconsistente em caminhos de arquivo (heuristicas vs heuristicas) reflete o filesystem real | Nenhuma correcao necessaria |

**Total: 12 problemas (0 criticos, 3 altos, 4 medios, 3 baixos, 2 info)**
**Todos os problemas resolvidos.**

---

# SPEC: Aula Completa sobre ICM e Risk Premium em Final Tables

**Autor:** @planner | **Data:** 2026-03-08 | **PRD:** PRD.md

---

## 1. Resumo da Investigacao

### 1.1 O que existe

**Material primario de Raphael** (`Entendendo o ICM e suas heuristicas.docx`):
- 8 toy-games progressivos no board 22223, AA/QQ/JJ vs KK, pot 100, unica aposta 100
- Parte I (5 cenarios): RP crescente no OOP (0/0, 3/6, 3/9, 3/18, 3/24)
- Parte II (3 cenarios): RP invertido (9/3, 18/3, 21/3)
- Conceitos proprios confirmados (prompt.md): Teto do RP, RP de ida vs volta, Pacto Silencioso, mesa como organismo
- Conceitos a confirmar com material original: Antevisao (mencionado no pesquisa.md, origem a verificar), Vantagem/Desvantagem de Risco (derivado dos TGs, verificar se e nomenclatura do autor)
- Conceitos derivados da SPEC (nao do material original): Batata Quente (criado pelo @planner para nomear o fenomeno do TG2)
- Critica ao uso mecanico de solvers
- Analise de valuations de stacks com calculadora ICM

**Pesquisa complementar** (`pesquisa.md`):
- 7 artigos do GTO Wizard com dados quantitativos
- Fontes de Dara O'Kearney e Barry Carter
- Conexoes interdisciplinares documentadas (Prospect Theory, Teoria de Sistemas, Teoria dos Jogos)
- 9 gaps identificados no material original
- Lista de 10 erros comuns do publico-alvo
- Estrutura de 5 modulos proposta

**Prompt estruturado** (`prompt.md`):
- Publico-alvo definido: jogadores profissionais intermediarios, AVG 109-530
- Tom e estilo prescritos: voz de Raphael Vitoi
- 12 criterios de sucesso verificaveis
- 5 elementos diferenciadores da aula
- Restricoes explicitas sobre nomenclatura e didatismo

### 1.2 O que falta e precisa ser produzido

1. Sistematizacao do Downward Drift com exemplo concreto (fonte: GTO Wizard)
2. Dados quantitativos do custo de jogar ChipEV contextualizados (>10% buy-in, >30% em 3-bet pots)
3. Secao sobre payout structures com dado de 5.7% de diferenca no RP medio
4. Secao sobre FGS vs ICM classico
5. Secao sobre KO/Bounty e interacao RP + equity drop
6. Checklist de decisao ICM pos-flop para uso em tempo real
7. Framework de estudo solo com solvers
8. Conexoes interdisciplinares inseridas nos pontos corretos da aula (nao como apendice)

### 1.3 Conflitos identificados

Nenhum conflito entre material original e pesquisa. O material de Raphael e as fontes externas sao complementares: o material original fornece a metodologia de toy-games e conceitos proprios; as fontes externas fornecem dados quantitativos, nomenclatura complementar (Downward Drift, CSTE) e conceitos que o material original menciona superficialmente (payout structures, FGS).

---

## 2. Estrutura Detalhada da Aula

### Formato do arquivo de saida

- Arquivo unico: `docs/tasks/aula-icm-rp/aula-icm-rp.md`
- Estrutura com headings hierarquicos (H1 para titulo, H2 para modulos, H3 para secoes, H4 para subsecoes)
- Tabelas para dados comparativos e checklists
- Negrito na primeira aparicao de cada conceito proprio com definicao inline
- Blocos de citacao (`>`) para insights-chave e conclusoes de toy-games
- **ALERTA (NF-06):** O documento final da aula NAO deve conter em-dash (--). Usar virgula, ponto, ponto e virgula ou reestruturar a frase. Esta SPEC usa -- por conveniencia de planejamento, mas o @implementor deve substituir por pontuacao adequada ao redigir a aula

---

## 3. Modulo 1: O Problema e o Mapa

### 3.1 Secao: Por que ICM importa desde a mao 1

**Conteudo obrigatorio:**
- Abrir com a tese central: o edge em ICM migrou do pre-flop para o pos-flop. Pre-flop ICM ja esta amplamente otimizado; o gap real esta nas decisoes pos-flop.
- Dado concreto: um MTT de 200 jogadores tem RP de ~1.8% desde a primeira mao. ICM nao "liga" na bubble; ele opera desde o inicio, com efeitos que se acumulam silenciosamente.
- Dado de custo: jogar ChipEV em spots ICM de bubble/FT custa mais de 10% do buy-in, escalando para mais de 30% em 3-bet pots. Fonte: GTO Wizard, "Theoretical Breakthroughs in ICM".
- Conceito de **Antevisao** (a verificar: mencionado no pesquisa.md como conceito original de Raphael, mas nao confirmado no prompt.md. @implementor deve verificar se o termo aparece no material original .docx. Se nao aparecer, usar como conceito da aula sem atribuir como "nomenclatura original"): a capacidade de antecipar como a configuracao de stacks e a pressao ICM vao se manifestar antes de cada decisao.

**Tom:** assertivo, provocativo. O leitor deve sair dessa secao incomodado com a propria ignorancia sobre ICM pos-flop.

**Criterio de verificacao:** o leitor consegue responder "por que ICM pos-flop importa mais que ICM pre-flop em 2026?" com argumentos concretos.

### 3.2 Secao: Risk Premium -- definicao, calculo, intuicao

**Conteudo obrigatorio:**
- Definicao precisa: RP e a equity adicional que um jogador precisa ter alem do pot odds para justificar um all-in (ou call de all-in) sob ICM. Mede o "custo do risco" imposto pelo ICM.
- Calculo: RP = (ICM equity necessaria para call) - (pot odds em ChipEV). Exemplo numerico com configuracao de stacks concreta.
- Fatores que determinam o RP:
  - Interacao direta entre os stacks envolvidos no pot (quem cobre quem)
  - Configuracao geral da mesa (stacks dos jogadores nao envolvidos)
  - Buy-in e irrelevante para o calculo de ICM
- Intuicao: RP alto = jogar "apertado" e correto; RP baixo = jogar "solto" e permitido. RP e o termometro de quanto ICM esta comprimindo suas decisoes.
- Tabela ilustrativa: configuracao de FT tipica (9 jogadores, stacks variados) mostrando o RP de cada stack em relacao a cada outro stack.

**Tom:** didatico e preciso. A definicao deve ser inequivoca.

**Criterio de verificacao:** o leitor consegue olhar uma configuracao de stacks e estimar qualitativamente quem tem RP alto, medio e baixo.

### 3.3 Secao: RP vs Bubble Factor

**Conteudo obrigatorio:**
- Bubble Factor e RP medem a mesma pressao com calculos diferentes.
- Bubble Factor: ratio entre o custo de perder (em $EV) e o beneficio de ganhar. BF de 1.0 = ChipEV. BF > 1.0 = pressao ICM. BF de 2.0 = precisa do dobro da equity para justificar o call.
- RP e mais intuitivo para internalizacao em tempo real: "preciso de X% a mais de equity alem do pot odds". Bubble Factor exige calculo relativo.
- Recomendacao: usar RP como metrica primaria, Bubble Factor como referencia quando encontrado em outras fontes.

**Tom:** breve e funcional. Nao gastar mais que o necessario aqui.

**Criterio de verificacao:** o leitor entende a relacao entre BF e RP e sabe converter mentalmente um no outro.

### 3.4 Secao: Valuations de stack -- o que seu stack realmente vale

**Conteudo obrigatorio:**
- Chip leader nao tem equity proporcional ao primeiro premio. Exemplo: CL com 40% das fichas em FT de 6 nao tem 40% do prize pool.
- Short stack nao tem equity proporcional ao ultimo premio. Exemplo: jogador com 5% das fichas ainda tem equity significativa pelo simples fato de estar vivo.
- Visualizacao: tabela com configuracao de stacks e valuations ICM correspondentes, mostrando a diferenca entre "% de fichas" e "% do prize pool".
- Principio fundamental: **fichas ganhas valem menos que fichas perdidas**. Cada ficha adicional ao CL vale progressivamente menos; cada ficha perdida pelo short stack custa progressivamente mais.
- Nuance critica (do material original): essa regra e verdadeira mas incompleta. O CL nao deve parar de jogar por causa dela. O CL tem a responsabilidade de dificultar que rivais acumulem. A regra correta e: fichas perdidas valem mais que fichas ganhas, E o CL deve usar sua vantagem de risco para pressionar -- desde que dentro dos limites do RP.

**Tom:** preciso, com disposicao para complexificar o senso comum.

**Criterio de verificacao:** o leitor nao repete "fichas perdidas valem mais" sem a nuance de que o CL ainda deve pressionar.

---

## 4. Modulo 2: Toy-Games como Laboratorio

### 4.1 Secao: Justificativa metodologica

**Conteudo obrigatorio:**
- O que sao toy-games: cenarios simplificados que isolam uma unica variavel para estudar seu efeito puro.
- Por que sao a ferramenta certa: em maos reais, multiplas variaveis operam simultaneamente (posicao, ranges, stacks, payout, equity). Toy-games permitem ver ICM operando sem ruido.
- Relacao com solvers: solvers sao toy-games sofisticados. Eles resolvem um modelo simplificado da realidade. A critica ao solver nao e que ele erra, e que ele resolve uma equacao estrategica em um modelo especifico, e o jogador que o usa sem entender o modelo trata a saida como verdade absoluta.
- Setup dos toy-games que serao usados:
  - **Board:** 22223 (board estatico, sem draws, sem flush, sem straight)
  - **Ranges:** IP tem AA, QQ, JJ (value) e KK (bluffcatcher puro). OOP tem KK como unico holding.
  - **Pot:** 100
  - **Unica aposta permitida:** 100 (pot-sized)
  - **Variavel isolada:** Risk Premium de cada jogador
  - IP decide se blefa (KK nao tem value); OOP decide se paga (KK e bluffcatcher puro)

**Tom:** metodologico, estabelecendo credibilidade do framework antes de apresentar resultados.

**Criterio de verificacao:** o leitor entende por que o board 22223 e as ranges foram escolhidos (eliminar variaveis) e por que toy-games sao preferidos a hands reais para aprendizado.

### 4.2 Secao: Parte I -- RP progressivo no OOP

Cinco toy-games em sequencia, cada um com RP crescente no OOP. O @implementor deve reproduzir os dados exatos do material original de Raphael (`Entendendo o ICM e suas heuristicas.docx`).

**NOTA CRITICA DO AUDITOR:** Os numeros de combos e frequencias listados abaixo sao indicativos, extraidos da descricao no pesquisa.md. O material original PREVALECE sobre qualquer numero listado nesta SPEC. Se houver divergencia, o @implementor deve usar os dados do .docx e reportar a discrepancia.

#### Toy-Game 1: ChipEV puro (RP 0/0)

**Dados obrigatorios:**
- RP do IP: 0. RP do OOP: 0.
- KK como bluffcatcher puro: paga 50% das vezes, conforme MDF (Minimum Defense Frequency).
- Formula MDF: MDF = 1 - [aposta / (pot + aposta)] = 1 - (100/200) = 0.5 = 50%. OOP deve defender pelo menos 50% do range para nao ser explorado por bluffs.
- Frequencia de bluff do IP: a = aposta / (pot + aposta) = 100/200 = 0.5. IP precisa blefar exatamente na frequencia que torna OOP indiferente.
- IP blefa com frequencia equilibrada (3 combos de KK como bluff, contra 6 combos de value = AA+QQ+JJ).
- Este e o baseline: sem ICM, sem RP, decisao puramente ChipEV.

**Insight a destacar:** este e o mundo em que a maioria treina. Tudo que segue mostra como esse mundo muda sob ICM.

#### Toy-Game 2: RP IP 3 / OOP 6

**Dados obrigatorios:**
- IP blefa 4.2 combos (vs 3 em ChipEV). IP blefa MAIS porque OOP tem RP alto e folda mais.
- OOP folda mais que no cenario ChipEV.
- Conceito: **Batata Quente** -- OOP nao pode devolver o RP via re-shove (cenario de unica aposta). O RP e unidirecional: OOP absorve o risco inteiro.
- Heuristica: com 25bb ou menos, flats pre-flop desaparecem. O jogador com RP alto nao pode se permitir situacoes pos-flop onde o RP e "batata quente" sem saida.

**Insight a destacar:** RP nao so muda frequencias; muda a propria estrutura de como ranges interagem.

#### Toy-Game 3: RP IP 3 / OOP 9

**Dados obrigatorios:**
- IP blefa 5 combos.
- OOP NAO folda mais que no cenario anterior (RP 3/6). Este e o ponto critico.
- Conceito: **Teto do RP** (nomenclatura original de Raphael) -- existe um limite alem do qual aumentar o RP do OOP nao o faz foldar mais. O defensor atingiu o ponto onde foldar mais seria exploitavel demais.
- O Teto do RP e um commitment device natural do equilibrio: protege o defensor de ser explorado infinitamente.

**Insight a destacar:** o Teto do RP e central para entender por que overbluffar o CL nao funciona infinitamente. Existe um piso de defesa.

#### Toy-Game 4: RP IP 3 / OOP 18

**Dados obrigatorios:**
- IP blefa 8 combos (6 value, 8 bluff = range desbalanceado, mais bluffs que value).
- KK (OOP) ainda paga. Mesmo com range desbalanceado do IP, o OOP esta protegido pelo Teto do RP.
- A razao: respostas da Teoria dos Jogos em ambientes ICM raramente sao extremas. O equilibrio tende a ajustes graduais, nao a mudancas binarias.

**Insight a destacar:** sob ICM, ranges de bluff podem ficar "desbalanceados" pelos padroes de ChipEV, mas o equilibrio ICM ainda sustenta a defesa.

#### Toy-Game 5: RP IP 3 / OOP 24

**Dados obrigatorios:**
- Mesma logica do TG4. KK paga no limite superior do RP.
- Confirmacao do Teto do RP: mesmo com RP extremo (24), o defensor nao folda mais que no cenario 3.

**Insight a destacar:** reforco final do Teto do RP. Ponto pedagogico consolidado.

**Conclusao da Parte I (obrigatoria):**
- Resumo do que os 5 TGs demonstram: RP alto no OOP aumenta bluffs do IP, mas ha um teto natural de defesa.
- Implicacao pratica: overbluffar o CL funciona ate certo ponto. Alem do Teto do RP, o CL para de foldar mais.
- Conexao com conceito de **RP de ida vs RP de volta em SRP**:
  - RPs similares -> jogo passivo (**Pacto Silencioso**: ambos preferem evitar confronto)
  - RP de ida > RP de volta (25%+) -> jogador com menor RP pressiona
  - RP de volta = 2x RP de ida -> pressao substancial pre e pos-flop

### 4.3 Secao: Parte II -- RP invertido (IP alto, OOP baixo)

Tres toy-games com RP alto no IP (o apostador) e baixo no OOP (o defensor). Mesmo setup.

**NOTA CRITICA DO AUDITOR:** Os dados dos TGs 6-8 abaixo sao direcionais (indicam a tendencia), nao prescritivos. Os numeros exatos de combos de bluff e frequencias de fold do OOP devem ser extraidos do material original .docx. As descricoes como "ligeiramente acima" e "quase 80%" sao insuficientes para implementacao; o @implementor deve substituir por dados reais.

#### Toy-Game 6: RP IP 9 / OOP 3

**Dados obrigatorios:**
- IP blefa ligeiramente acima de ChipEV (poucos combos a mais).
- OOP com menor RP PAGA MENOS (contra-intuitivo). O defensor com RP baixo folda mais, nao menos.
- Este resultado e contra-intuitivo e pedagogicamente central.

#### Toy-Game 7: RP IP 18 / OOP 3

**Dados obrigatorios:**
- IP mantem range levemente inclinado a bluff.
- OOP folda AINDA MAIS que no TG6.
- A tendencia se acentua: quanto maior o RP do IP (quem aposta), mais o OOP com RP baixo folda.

#### Toy-Game 8: RP IP 21 / OOP 3

**Dados obrigatorios:**
- Mesmo range do IP.
- OOP folda quase 80%.

**Explicacao obrigatoria da contra-intuitividade (simulacoes do material original):**

Por que OOP folda mais quando IP tem RP alto? Cinco razoes interligadas:

1. **20bb ganhas pelo CL = pouco valor incremental.** Utilidade marginal decrescente: cada ficha a mais no stack do CL vale progressivamente menos em $EV.
2. **20bb perdidas pelo CL = perda desproporcional.** O CL perde nao so fichas, mas tambem pressao futura sobre a mesa (que e um ativo estrategico, nao so numerico).
3. **OOP crescendo reduz pressao futura sobre OOP.** Se OOP ganha o pot, OOP deixa de ser short/medium e a pressao ICM sobre ele diminui. Isso e RUIM para a mesa e para o CL.
4. **Quando CL elimina um short, a MESA se beneficia mais que o CL.** O salto de payout beneficia todos os sobreviventes, nao proporcionalmente ao CL.
5. **Fichas nao se transferem 1:1 em valor.** Parte do valor das fichas transferidas e "distribuida" pela mesa via ICM. O CL ganha fichas mas perde $EV relativo.

**Conclusao da Parte II (obrigatoria):**
- O conceito de **Vantagem de Risco** (covering advantage): cobrir diminui o RP significativamente. O jogador que cobre tem mais liberdade de acao.
- O conceito de **Desvantagem de Risco**: ser coberto eleva RP. Mas a conclusao contra-intuitiva dos TGs 6-8 mostra que o defensor coberto (OOP com RP baixo) folda mais, nao menos.
- **Short stacks e RP medio**: stacks a beira da eliminacao elevam o RP medio de todas as stacks intermediarias. A presenca de um short stack muda a dinamica da mesa inteira.
- **Mesa como organismo** (nomenclatura original): eventos entre dois jogadores afetam as valuations de TODOS. A mesa nao e uma colecao de duelos isolados; e um sistema onde cada stack influencia todos os outros.

### 4.4 Secao: Conceitos emergentes consolidados

**Conteudo obrigatorio (resumo de todos os conceitos que emergiram dos TGs):**

| Conceito | Definicao | TG de origem | Implicacao pratica |
|----------|-----------|-------------|-------------------|
| Teto do RP | Limite alem do qual aumentar o RP do defensor nao o faz foldar mais | TG3 | Overbluffar o CL tem limite natural |
| RP de ida vs RP de volta | Comparacao entre o RP do agressor e o RP do defensor em SRP | TG1-5 | Determina quem tem incentivo para pressionar |
| Pacto Silencioso | Quando RPs sao similares, ambos preferem evitar confronto | TG1-5 | RPs similares = jogo passivo e correto |
| Vantagem/Desvantagem de Risco | Cobrir reduz RP; ser coberto eleva RP | TG6-8 | Avaliar quem cobre quem ANTES de cada decisao |
| Mesa como organismo | Eventos entre 2 jogadores afetam valuations de todos | TG6-8 | Nunca analisar um spot isolado da configuracao geral |
| Batata Quente (*) | RP unidirecional quando nao ha possibilidade de re-shove | TG2 | Evitar situacoes onde o RP nao tem saida |

(*) Batata Quente e conceito derivado da SPEC para nomear o fenomeno do TG2, nao nomenclatura original confirmada do material de Raphael.

**Tom da secao:** consolidacao. O leitor deve ter um mapa claro dos conceitos antes de avancar para o Modulo 3.

---

## 5. Modulo 3: ICM Pos-Flop -- A Fronteira

### 5.1 Secao: Por que o edge real esta no pos-flop

**Conteudo obrigatorio:**
- Tese: ICM pre-flop (push/fold, open-shove ranges, calling ranges) ja esta amplamente otimizado. Ferramentas como ICMIZER, HRC e GTO Wizard tornaram ICM pre-flop acessivel. O gap de skill entre jogadores no pre-flop ICM e menor do que nunca.
- O pos-flop ICM e a nova fronteira: fewer players study it, fewer tools solve it well, fewer coaches teach it. O edge esta onde a competicao nao esta olhando.
- Dado de suporte: GTO Wizard so disponibilizou ICM postflop solving em 2024. Dara O'Kearney lancou "Postflop ICM Simplified" apos isso. O campo e novo.
- Implicacao: jogadores que dominam ICM pos-flop tem edge que se mantera por anos enquanto a maioria continua otimizando apenas pre-flop.

### 5.2 Secao: Downward Drift

**Conteudo obrigatorio:**
- Definicao: **Downward Drift** e a heuristica de que sob pressao ICM, acoes descem um degrau na escala de agressividade. "Big bets viram small bets, small bets viram checks/calls, checks/calls viram folds." (GTO Wizard)
- Exemplo concreto (fonte: GTO Wizard, "How ICM Impacts Postflop Strategy"):
  - Spot: A8s3r flop, BTN 40BB vs BB 70BB
  - ChipEV: BTN c-beta 100% com sizing misto (range de 33% a 75% pot)
  - ICM: BTN c-beta 100% mas quase exclusivamente small sizing (~33% pot)
  - BB em ChipEV: fold X%, call Y%, check-raise 10% [VERIFICAR FONTE: @implementor deve extrair percentuais exatos do artigo "How ICM Impacts Postflop Strategy" do GTO Wizard Blog. Os placeholders X% e Y% nao devem aparecer no documento final]
  - BB em ICM (cobrindo): menos folds, mais calls, check-raise 12% (BB que cobre defende mais agressivamente) [VERIFICAR: percentual de 12% extraido do pesquisa.md, confirmar no artigo original]
- Mecanismo: sob ICM, o custo de construir pots grandes escala desproporcionalmente. O solver compensa reduzindo sizings para construir pots de forma mais controlada.
- Implicacao pratica: ajustar sizings em -12% a -15% como baseline sob ICM vs ChipEV. Nao e regra rigida, e ponto de partida.

**Tom:** tecnico com exemplo concreto. O leitor deve poder verificar o exemplo no GTO Wizard.

**Criterio de verificacao:** o leitor consegue explicar o Downward Drift e aplicar o ajuste de sizing como heuristica.

### 5.3 Secao: SPR e distribuicao do RP por street

**Conteudo obrigatorio:**
- Conceito: o RP total de uma mao nao e "gasto" de uma vez. Ele e distribuido ao longo das streets, proporcionalmente ao tamanho relativo do pot em cada street.
- Relacao com SPR (Stack-to-Pot Ratio): SPR alto = RP distribuido por mais streets = decisoes menos catastroficas individualmente. SPR baixo = RP concentrado = cada decisao carrega peso desproporcional.
- Implicacao para sizing: manter SPR alto sob ICM e uma estrategia defensiva. Sizings menores preservam SPR e distribuem o RP.
- Ranges condensados sob pressao de RP: quando o RP e alto, ranges sao projetados para reter equity, nao para gerar EV maximo. Isso significa menos polarizacao, mais maos de valor medio, menos bluffs especulativos.

### 5.4 Secao: Covering advantage e efeito compounding

**Conteudo obrigatorio:**
- Cobrir o adversario reduz seu RP significativamente (do material original).
- Efeito compounding (fonte: GTO Wizard): a vantagem de cobrir nao se limita a uma street. Em cada street, o jogador coberto enfrenta a mesma pressao incremental. Ao longo de flop-turn-river, o efeito se acumula.
- Exemplo: BB cobrindo BTN defende mais agressivamente (mais calls, check-raise 12% vs 10%) porque o risco de eliminacao e unidirecional.
- Implicacao pratica: antes de cada decisao pos-flop, avaliar se voce cobre ou e coberto. Isso muda sizings, frequencias de bluff e frequencias de defesa.

### 5.5 Secao: Premium hands check-back

**Conteudo obrigatorio:**
- Cenario paradigmatico (fonte: GTO Wizard, "Mastering Postflop ICM"):
  - No bubble, UTG abre e o solver checa AA inteiro no flop. Em ChipEV, UTG beta AA 100%.
  - Razao: o custo de construir um pot grande com AA (e potencialmente perder) excede o beneficio de extrair valor. A sobrevivencia tem valor ICM positivo que compete com o EV de apostar.
- Conceito: **EV de fold positivo** (do material original): para stacks medios quando short stacks estao presentes, simplesmente sobreviver (foldar) tem EV positivo. Cada mao jogada pelo short stack que resulta em eliminacao beneficia todos os sobreviventes.
- Quando checar premiums e correto: alto RP, SPR alto, adversario cobre voce, short stacks presentes na mesa que podem ser eliminados por outros.
- Quando checar premiums e incorreto: RP baixo, voce cobre, SPR baixo (committed), nenhum short stack presente.

### 5.6 Secao: Custo quantificado de jogar ChipEV em spots ICM

**Conteudo obrigatorio:**
- Dado central (fonte: GTO Wizard, "Theoretical Breakthroughs in ICM"): jogar ChipEV contra oponentes ICM-aware em bubble/FT custa mais de 10% do buy-in.
- Em 3-bet pots, o custo escala para mais de 30%.
- Contextualizacao: para um jogador de AVG $215, isso significa perder $21.50+ por torneio em spots ICM de FT. Em 3-bet pots, $64.50+.
- Conceito: CSTE (Chip-Scaled Tournament Equity) como metrica normalizada para medir essa perda entre formatos diferentes.
- Implicacao: treinar ICM pos-flop nao e optional para jogadores serios. O custo de nao treinar e mensuravel e substancial.

### 5.7 Secao: Exercicio guiado -- ChipEV vs ICM no GTO Wizard/DeepSolver

**Conteudo obrigatorio:**
- Passo a passo para configurar uma comparacao ChipEV vs ICM:
  1. Escolher um spot de FT (sugestao: BTN vs BB, 30bb effective, FT de 6, stacks variados)
  2. Resolver em ChipEV
  3. Resolver em ICM com a mesma configuracao
  4. Comparar: sizing, frequencias de c-bet, check-raise, fold
  5. Identificar onde as diferencas sao maiores (geralmente: 3-bet pots, spots com stacks medios, spots onde um jogador cobre o outro)
- O que procurar na comparacao:
  - Reducao de sizing (Downward Drift)
  - Aumento de checks (especialmente premiums)
  - Reducao de bluffs de alta variancia
  - Aumento de defesa do jogador que cobre
- Notas sobre DeepSolver: Smart Tree, nodelocking (referencia ao tutorial deepsolver.docx do usuario)

**Tom:** pratico, instrucional. O leitor deve conseguir replicar o exercicio sozinho.

---

## 6. Modulo 4: Variaveis Contextuais

### 6.1 Secao: Payout structures -- flat vs top-heavy

**Conteudo obrigatorio:**
- Dado central (fonte: GTO Wizard, "How Payout Structures Reshape Postflop Strategy"): diferenca de 5.7% no RP medio entre os extremos do espectro de payout.
- **Flat structures**: RP alto, jogo conservador, ladder climbing valioso. Cada salto de posicao vale proporcionalmente mais. Incentivo forte para sobrevivencia.
  - Efeito no pos-flop: BB leads predominam em boards pareados (maos fortes sao muito mais fortes, incentivo para proteger pots menores).
- **Top-heavy structures**: RP mais baixo, mais agressividade permitida. O primeiro premio concentra a maior parte do prize pool, reduzindo o incentivo de ladder climbing.
  - Efeito no pos-flop: mais polarizacao, sizings maiores permitidos, bluffs de alta variancia mais justificaveis.
- Do material original: payout top-heavy reduz RP de shorts (eles precisam correr mais risco para alcancar os premios de topo); payout flat aumenta RP de shorts (cada posicao que sobem vale mais).
- Implicacao pratica: antes de cada FT, verificar a estrutura de payout e ajustar a agressividade global de acordo.

### 6.2 Secao: FGS vs ICM classico

**Conteudo obrigatorio:**
- Definicao: FGS (Future Game Simulation) e uma evolucao do ICM que corrige suas limitacoes:
  - ICM classico assume que todas as fichas serao apostadas em confrontos aleatorios ate um jogador ter todas. Nao considera blinds futuros, posicao na mesa, skill edges.
  - FGS simula o restante do torneio como uma serie de decisoes futuras, considerando blinds crescentes e posicoes.
- Quando ICM classico falha:
  - Muito cedo no torneio (quando blinds sao pequenas relativo aos stacks e ha muitas decisoes futuras)
  - Em satelites (onde a estrutura de pagamento invalida premissas do ICM)
  - Quando um jogador tem edge significativo de skill
- Ferramentas que implementam FGS: ICMIZER 3, HRC, GTO Wizard
- Implicacao pratica: para FTs de MTT com blinds significativas (que e o cenario da aula), ICM classico e suficientemente preciso. FGS importa mais em fases anteriores e em formatos especificos.

### 6.3 Secao: KO/Bounty tournaments

**Conteudo obrigatorio:**
- A dinamica unica: bounty tournaments criam um incentivo de RP positivo (ganhar fichas para cobrir = capturar bounty) que compete com o RP negativo do ICM.
- Interacao: RP positivo do bounty + equity drop negativo do ICM. As duas forcas operam simultaneamente em direcoes opostas.
- Efeito pratico: em KO tournaments, a agressividade e geralmente mais alta que em vanilla tournaments, especialmente quando o jogador pode capturar um bounty significativo.
- Limitacao: esta secao e introdutoria. KO ICM e um campo complexo que merece tratamento dedicado. O objetivo aqui e que o leitor saiba que as duas forcas existem e interagem.

### 6.4 Secao: CL dynamics

**Conteudo obrigatorio:**
- Do material original: o CL tem responsabilidade de pressionar rivais para dificultar que acumulem. Mas cada pot grande que o CL perde tem custo desproporcional (perda de pressao futura, redistribuicao de valor pela mesa).
- Equilibrio: o CL deve usar sua Vantagem de Risco (cobrir todos) para pressionar, mas dentro dos limites do RP. Overbluffar alem do Teto do RP e "suicidio ICM" do CL.
- RP do CL diminui com menos jogadores na mesa: com menos jogadores, ha menos catastrofe potencial, e o RP de todos diminui. O CL se beneficia da reducao de jogadores.
- Implicacao: o CL ideal pressiona de forma constante e controlada, forcando decisoes dificeis sem se comprometer em pots que ameacem sua posicao.

---

## 7. Modulo 5: Aplicacao Pratica e Erros Comuns

### 7.1 Secao: Os 10 erros mais comuns do jogador AVG 109-530

**Conteudo obrigatorio (cada erro com descricao + correcao concreta):**

| # | Erro | Por que e erro | Correcao |
|---|------|---------------|----------|
| 1 | Treinar pos-flop exclusivamente em ChipEV | Ignora a pressao ICM que transforma sizings, ranges e frequencias em FTs | Dedicar pelo menos 30% do estudo de FT a comparacoes ChipEV vs ICM |
| 2 | Aplicar ICM apenas pre-flop e em decisoes all-in | ICM opera em cada street, em cada sizing, em cada decisao de check/bet/raise | Usar Downward Drift como heuristica em toda decisao pos-flop |
| 3 | Usar sizing de cash game em FTs | Sizings maiores constroem pots que geram risco desproporcional sob ICM | Reduzir sizings em ~12-15% como baseline. Verificar com solver |
| 4 | Nao considerar configuracao de stacks da mesa inteira | O RP depende de TODOS os stacks, nao so dos 2 jogadores no pot | Antes de cada decisao, scanner rapido: quem sao os shorts, quem cobre quem |
| 5 | "ICM suicide" -- tightar demais horas antes da bubble real | Perde EV por excesso de cautela em fase onde ICM tem efeito minimo | ICM e significativo na bubble e FT, nao 30 lugares antes |
| 6 | Overbluffar o chip leader coberto | Nao entende o Teto do RP: o CL para de foldar alem de certo ponto | Verificar RP do CL antes de blefar. Se RP dele e baixo, range de bluff deve ser tighter |
| 7 | Ignorar payout structure | RP varia ate 5.7% entre flat e top-heavy. Isso muda sizing, agressividade, tudo | Verificar payout antes da FT e classificar como flat, middle ou top-heavy |
| 8 | Nao ajustar para KO/Bounty | RP positivo do bounty compete com RP negativo do ICM | Em KO, ser mais agressivo quando pode capturar bounty significativo |
| 9 | Interpretar "fichas perdidas valem mais" literalmente demais | CL para de jogar e perde pressao futura. A regra nao e "nao jogue", e "jogue com margem de seguranca" | CL deve pressionar dentro do RP. Parar de jogar e tao ruim quanto jogar demais |
| 10 | Nao entender que eventos entre 2 jogadores afetam TODOS | Analisar um pot isolado sem considerar o efeito na mesa inteira | Pensar em cada pot como evento que redistribui valuations da mesa |

**Tom:** direto, sem condescendencia. Cada erro com "por que" e "como corrigir".

### 7.2 Secao: Checklist de decisao ICM pos-flop em tempo real

**Conteudo obrigatorio -- checklist aplicavel em <10 segundos por item:**

> **Antes de cada decisao pos-flop em FT:**
>
> 1. **Quem cobre quem?** Eu cobro, sou coberto, ou stacks similares?
> 2. **Shorts presentes?** Tem alguem a beira da eliminacao? Isso eleva meu RP?
> 3. **Meu RP neste pot?** Alto (>10%), medio (5-10%), baixo (<5%)?
> 4. **Payout structure?** Flat (mais conservador) ou top-heavy (mais agressivo)?
> 5. **SPR?** Alto (distribuir RP por streets) ou baixo (comprometido)?
> 6. **Drift?** Meu sizing esta um degrau abaixo do que seria em ChipEV?
> 7. **Vale apostar?** Se o custo do risco supera o EV da aposta, check e correto.

**Formato:** deve ser apresentado como bloco destacado, facilmente memorizavel.

### 7.3 Secao: Como estruturar sessoes de estudo solo

**Conteudo obrigatorio:**
- Framework de estudo em 4 etapas:
  1. **Selecionar spot**: escolher uma situacao de FT que ocorre com frequencia (ex: BTN vs BB, 25-35bb, FT de 6)
  2. **Resolver em ChipEV**: anotar sizings, frequencias, ranges
  3. **Resolver em ICM**: mesma situacao, anotar diferencas
  4. **Diagnosticar**: onde estao as maiores diferencas? Por que? Qual conceito da aula explica essa diferenca?
- Rotina sugerida: 3 spots por sessao, 2-3 sessoes por semana, foco em spots que o jogador enfrenta com frequencia
- Ferramentas: GTO Wizard (ICM postflop solving), DeepSolver (Smart Tree para analise customizada)
- O que registrar: anotar padroes recorrentes (ex: "em todos os spots onde sou coberto, meu sizing de c-bet cai 15%")

### 7.4 Secao: Antevisao como framework aplicado

**Conteudo obrigatorio:**
- Retomar o conceito de **Antevisao** (introduzido no Modulo 1, secao 3.1) como framework pratico de decisao.
- Conectar Antevisao ao checklist da secao 7.2: a Antevisao e o processo mental que o checklist sistematiza.
- Exemplo: antes de uma mao em FT, o jogador com Antevisao ja mapeou os stacks, identificou quem cobre quem, estimou o RP, e ajustou sua predisposicao para agir antes de ver suas cartas.
- Nota: se o conceito "Antevisao" nao for confirmado no material original, esta secao pode ser incorporada como subsecao do checklist (7.2) ao inves de secao independente.

### 7.5 Secao: Conexoes interdisciplinares como lente interpretativa

**Conteudo obrigatorio -- cada conexao vinculada a um conceito especifico da aula:**

#### Prospect Theory (Kahneman & Tversky, 1979)
- Conexao: a funcao valor assimetrica (perdas pesam ~2x mais que ganhos equivalentes) e isomorfica a regra "fichas perdidas valem mais que fichas ganhas".
- O que ilumina: ICM nao e uma anomalia ou distorcao -- e a matematizacao de uma assimetria que a psicologia comportamental ja documentou em outros dominios. Loss aversion no poker nao e vies; sob ICM, e estrategia correta.
- Onde inserir: referenciar no Modulo 1 (secao 3.4, valuations) e aprofundar aqui.

#### Teoria de Sistemas
- Conexao: a mesa como organismo (conceito original de Raphael). Propriedades emergentes: o RP medio da mesa nao e redutivel a nenhum stack individual. Feedback loops: CL pressiona -> stacks medios tightam -> CL acumula -> pressao aumenta (loop positivo).
- O que ilumina: por que analisar spots isolados e insuficiente. Cada decisao tem efeitos de segunda e terceira ordem na mesa inteira.
- Onde inserir: referenciar no Modulo 2 (conclusao da Parte II) e aprofundar aqui.

#### Teoria dos Jogos
- Conexao: Nash Equilibrium sob restricoes de utilidade nao-linear. Em cash games, utilidade e linear (1 ficha = 1 unidade de utilidade). Em torneios sob ICM, utilidade e concava (cada ficha adicional vale menos). Isso muda fundamentalmente o equilibrio.
- O que ilumina: por que ranges sob ICM parecem "subotimos" do ponto de vista ChipEV -- eles sao otimos para uma funcao de utilidade diferente.
- Onde inserir: referenciar no Modulo 2 (Pacto Silencioso como Nash sob ICM) e aprofundar aqui.

**Tom:** intelectualmente denso mas nunca decorativo. Cada conexao deve responder "o que isso muda na minha decisao?" ou "o que isso me ajuda a entender que eu nao entendia?"

---

## 8. Atualizacoes de Documentacao

Nao ha documentacao pre-existente no projeto que precise ser atualizada. A aula e um documento novo.

**Arquivos a serem criados:**
- `docs/tasks/aula-icm-rp/aula-icm-rp.md` -- o documento da aula completa

---

## 9. Ordem de Implementacao

1. **Modulo 1** (O Problema e o Mapa): nao depende de nada. Estabelece vocabulario e motivacao.
2. **Modulo 2** (Toy-Games): depende do vocabulario do Modulo 1 (RP, valuations). Este modulo requer reproducao exata dos dados do material original de Raphael. O @implementor DEVE consultar o arquivo `Entendendo o ICM e suas heuristicas.docx` para todos os numeros.
3. **Modulo 3** (ICM Pos-Flop): depende dos conceitos emergentes do Modulo 2 (Teto do RP, Vantagem de Risco, mesa como organismo). Usa dados do GTO Wizard.
4. **Modulo 4** (Variaveis Contextuais): depende dos Modulos 1-3 para contexto, mas as secoes internas sao independentes entre si.
5. **Modulo 5** (Aplicacao Pratica): depende de todos os modulos anteriores. Os 10 erros referenciam conceitos de cada modulo. O checklist sintetiza tudo. As conexoes interdisciplinares referenciam pontos especificos dos Modulos 1-4.

**Dependencia critica:** Modulo 2 depende do material original de Raphael. Todos os numeros de combos, frequencias e RPs devem ser verificados contra o documento fonte.

---

## 10. Checklist de Seguranca

Nao aplicavel no sentido convencional (nao ha banco de dados, API ou autenticacao). Adaptado para o contexto:

- [ ] Dados numericos dos toy-games verificados contra o material original
- [ ] Nenhum dado inventado ou estimado sem declaracao explicita
- [ ] Fontes nomeadas para todos os dados quantitativos externos (GTO Wizard, Dara O'Kearney)
- [ ] Nomenclatura original de Raphael preservada integralmente (nao renomeada, nao diluida)
- [ ] Tom da aula consistente com a voz de Raphael Vitoi
- [ ] Nenhuma explicacao de conceitos basicos de poker (publico ja domina)
- [ ] Nenhum em-dash (--) no documento final
- [ ] Documento em portugues (pt-BR)

---

## 11. Casos de Teste (criterios de verificacao)

- [ ] A aula cobre os 5 modulos na ordem proposta com progressao logica verificavel
- [ ] Os 8 toy-games do material original estao reproduzidos corretamente com analise completa
- [ ] Os conceitos proprios confirmados de Raphael (Teto do RP, RP de ida vs volta, mesa como organismo, Pacto Silencioso) estao presentes e nomeados com a terminologia original
- [ ] Os conceitos a confirmar (Antevisao, Vantagem/Desvantagem de Risco) foram verificados contra o material original .docx e tratados de acordo
- [ ] O conceito derivado (Batata Quente) esta presente sem ser atribuido como nomenclatura original de Raphael
- [ ] ICM pos-flop e tratado como secao central (Modulo 3), nao como apendice
- [ ] O Downward Drift esta explicado com exemplo concreto (sizing de c-bet sob ICM vs ChipEV)
- [ ] O dado quantitativo do custo de jogar ChipEV (>10% buy-in) esta presente e contextualizado
- [ ] Os 10 erros comuns estao listados com correcao concreta para cada um
- [ ] O checklist de decisao ICM pos-flop em tempo real esta incluido e e aplicavel sem solver
- [ ] Conexoes interdisciplinares (Prospect Theory, Teoria de Sistemas, Teoria dos Jogos) estao presentes e vinculadas a conceitos especificos da aula
- [ ] A critica ao uso mecanico de solvers esta presente e fundamentada
- [ ] O documento e escrito em portugues (pt-BR) e entregue como .md estruturado
- [ ] Um jogador intermediario consegue usar a aula para treinar sozinho com GTO Wizard ou DeepSolver
- [ ] O exercicio guiado de comparacao ChipEV vs ICM tem passo a passo replicavel
- [ ] O framework de estudo solo tem rotina concreta (frequencia, numero de spots, o que registrar)
- [ ] Cada conceito proprio aparece em negrito na primeira ocorrencia com definicao inline

