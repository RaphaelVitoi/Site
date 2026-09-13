ENCICLOPÉDIA DA TEORIA DA PERSPECTIVA MATEMÁTICA (PMev) E POKER RACIONAL
Autor: Raphael Vitoi
Edição Canônica e Consolidação Científica Integral (v7.0 Gold Standard)
Data de Publicação: 18 de agosto de 2026

________________

SUMÁRIO GERAL

1. Volume I: Prolegômenos Epistemológicos e Genealogia do Poker Racional

   * 1.1 Da Heurística Prática à Formalização de Sistemas Complexos
   * 1.2 Ruptura com o Dogmatismo de Solvers e o "Vácuo Matemático"
   * 1.3 Os Quatro Núcleos Epistemológicos do Poker Racional
   * 1.4 A Distinção entre Superioridade Representacional, Preditiva e Decisória

2. Volume II: A Arquitetura Aninhada da PMev e o Formalismo POSG

   * 2.1 Definição do Estado Global de Torneio (S_t)
   * 2.2 O Operador de Continuação em Horizonte Finito (Lookahead Truncado)
   * 2.3 O Axioma do Aninhamento Formal: $\mathcal{M}{\text{ICM}} \subset \mathcal{M}{\text{PMev}}$
   * 2.4 A Escada Hierárquica de Modelos (PMev-0 a PMev-F)

3. Volume III: Microeconomia, Contest Theory e a Geometria do Risco

   * 3.1 Teoria de Concursos e Arquitetura Ótima de Prêmios (Moldovanu & Sela)
   * 3.2 Não-Linearidade de Utilidade e Aversão ao Risco Endógena
   * 3.3 A Derivação Exata do Bubble Factor (BF) e do Risk Premium (RP)
   * 3.4 O Diferencial de Autorização Estratégica: Risk Advantage ($\Delta RP$)

4. Volume IV: Probabilidade e Processos Estocásticos de Eliminação

   * 4.1 Limitações do Modelo Harville / Forward Plackett-Luce
   * 4.2 O Modelo de Atrito e Sobrevivência (Reverse Plackett-Luce)
   * 4.3 O Teorema de Absorção em Cadeias de Markov de Diaconis & Ethier ($\mathcal{O}(N^{-3})$)
   * 4.4 Resíduos Sistemáticos em Grandes Datasets Empíricos (Kim 2025; Scott et al. 2025)

5. Volume V: Teoria de Opções Reais e Macro-Dinâmica por Jogos de Campo Médio

   * 5.1 O Axioma do Valor de Continuação do Fold ($V(S_{\text{fold}}) > 0$)
   * 5.2 A Ação de Fold como Opção Real de Espera (Option to Wait) e Histerese
   * 5.3 Formalização da Opcionalidade Contrafactual $\Omega(s)$
   * 5.4 Macro-Evolução do Field via Mean Field Games (Sistema Acoplado HJB / Fokker-Planck)

6. Volume VI: A Ponte Janda-Vitoi e Dinâmicas de Defesa Pós-Flop

   * 6.1 Subversão da Frequência Mínima de Defesa Linear ($\text{MDF}_{\text{ChipEV}}$)
   * 6.2 Dedução da Equação de Indiferença de Nash sob Bubble Factor no River
   * 6.3 O Mecanismo do Teto do Risk Premium
   * 6.4 Paradoxo da Inversão de Risco do Chip Leader e o Pacto Silencioso

7. Volume VII: Teoria dos Jogos Comportamental e Inteligência Artificial

   * 7.1 Agent Quantal Response Equilibrium (AQRE) e Parametrização $\lambda_j$
   * 7.2 Inferência Bayesiana Hierárquica sobre Tipos Estratégicos (EDM / MDA)
   * 7.3 Amortização da Edge por Profundidade de Stack ($S_{\text{eff}}$)
   * 7.4 Resolução em Subjogos com Profundidade Truncada (ReBeL / Continual Resolving)

8. Volume VIII: Protocolo Experimental de Solvers e Análise Metodológica

   * 8.1 Evidências Empíricas da Aula 1.2 (HRC Pós-Flop vs. GTO Wizard)
   * 8.2 A Falácia da Stack Efetiva Isolada e o Bunching Effect Global
   * 8.3 Downward Drift de Sizings: Compressão Pós-Flop sob Assimetria de Risco

9. Volume IX: Transições Institucionais e a Termodinâmica de Late Registration

   * 9.1 O Operador de Transição de Entrada Tardia
   * 9.2 Teorema da Conservação de Valor no Prizepool
   * 9.3 O Bônus de Equity do Entrante vs. Diluição dos Incumbentes (Benchmark Hallaert)

10. Volume X: O Ledger Mestre de Hipóteses Falsificáveis e Validação Padrão Ouro

* 10.1 As 12 Hipóteses Científicas Operacionais ($H_1$ a $H_{12}$)
* 10.2 Protocolo Experimental Fora da Amostra (Holdout Split & Proper Scoring Rules)
* 10.3 Testes Adversariais e Controles Negativos
* 10.4 Governança de Código Aberto no GitHub (Pipeline CI/CD SOTA v7.0 GOLD)

________________

VOLUME I: PROLEGÔMENOS EPISTEMOLÓGICOS E GENEALOGIA DO POKER RACIONAL
1.1 Da Heurística Prática à Formalização de Sistemas Complexos
A formulação do Poker Racional e da Teoria da Perspectiva Matemática (PMev), idealizada por Raphael Vitoi, nasce da constatação empírica e analítica de que a tomada de decisão em torneios multimesas (MTTs) de elite não pode ser reduzida à memorização linear de frequências estáticas geradas por softwares de solução pontual (solvers). O ecossistema de um torneio opera como um sistema estocástico, multiagente, aberto e interconectado, onde cada decisão individual irradia externalidades financeiras sobre a totalidade do campo de jogadores.
1.2 Ruptura com o Dogmatismo de Solvers e o "Vácuo Matemático"
O paradigma clássico do poker moderno comete um erro epistemológico sistemático: a extrapolação irrestrita de conceitos de ChipEV (onde o valor marginal de cada ficha é constante e perfeitamente linear, $U(s) = s$) para ambientes de alta pressão utilitária (ICM). Solvers em vácuo calculam o equilíbrio estático entre dois agentes como se o torneio se encerrasse naquele instante ($H = 0$), ignorando:

1. O relógio institucional ($\tau_t$) e o decaimento exógeno de stacks pela subida de blinds.
2. A composição dinâmica das demais mesas e as transições de rebalanceamento (table draw).
3. A heterogeneidade de habilidade técnica e a distribuição estocástica de erros dos oponentes humanos.
4. O valor contrafactual de preservar opções estratégicas futuras ($\Omega(s)$).
1.3 Os Quatro Núcleos Epistemológicos do Poker Racional
1. Núcleo I: Geometria do Risco & Matemática Utilitária: Formalização da assimetria entre $EV$ monetário e ChipEV, do prêmio de risco operacional e da compressão de sizings (Downward Drift).
2. Núcleo II: A Ponte Janda-Vitoi & Subversão da MDF: Demonstração de que a Frequência Mínima de Defesa linear é superada pelo Teto do Risk Premium.
3. Núcleo III: Arquitetura Solvógica & Efeitos Sistêmicos: Crítica à modelagem de stack efetiva isolada, demonstração do Bunching Effect global e convergência $\epsilon$-Nash em solvers de alta resolução.
4. Núcleo IV: Inteligência Bayesiana & A Mesa como Organismo Vivo: Modelagem adaptativa de tendências populacionais (MDA/EDM) e dinâmicas de colusão implícita (Pacto Silencioso).
1.4 A Distinção Epistemológica Fundamental
A consolidação científica da PMev exige a separação rigorosa entre três dimensões probatórias: $$\underbrace{\text{Superioridade Representacional}}{\text{Demonstrada formalmente por aninhamento}} \quad \neq \quad \underbrace{\text{Superioridade Preditiva}}{\text{Exige validação empírica fora da amostra (CRPS/Log-Loss)}} \quad \neq \quad \underbrace{\text{Superioridade Decisória}}_{\text{Exige mensuração de regret monetário realizado}}$$

________________

VOLUME II: A ARQUITETURA ANINHADA DA PMEV E O FORMALISMO POSG
2.1 Definição do Estado Global de Torneio ($S_t$)
Um torneio multimesas no instante $t$ é formalizado como um Jogo Estocástico Parcialmente Observável (POSG): $$S_t = (\mathbf{s}_t, \mathbf{p}, \mathbf{z}_t, h_t, \tau_t) \in \mathcal{S}$$ onde $\mathbf{s}t \in \Delta^N \cdot S{\text{total}}$ é o vetor de stacks de todos os $N$ jogadores ativos, $\mathbf{p} = (p_1, \dots, p_K)$ é o vetor decrescente de premiação, $\mathbf{z}_t$ são os atributos de mesa e posições, $h_t$ é o histórico de ações e $\tau_t$ é o relógio institucional.
2.2 O Operador de Continuação em Horizonte Finito
O valor da tomada de decisão é governado pelo operador de lookahead com horizonte $H$: $$Q_{\text{PMev}}^H(S_t, a_t, b_t) = \mathbb{E}{\pi_i, \pi{-i}} \left[ \sum_{k=0}^{H-1} \gamma^k r(S_{t+k}, a_{t+k}) + \gamma^H \Phi(S_{t+H}) ;\middle|; S_t, a_t, b_t \right]$$ com condição terminal de contorno mínima $\Phi(S_{t+H}) = V_{\text{ICM}}(S_{t+H})$.
2.3 O Axioma do Aninhamento Formal
A PMev assume como axioma de compatibilidade científica: $$\mathcal{M}{\text{ICM}} \subset \mathcal{M}{\text{FGS}} \subset \mathcal{M}{\text{PMev}}$$ Existe um vetor de restrições paramétricas $\eta_0$ tal que a PMev recupera exatamente o baseline clássico: $$V{\text{PMev}}(S_t; \eta_0) = V_{\text{ICM}}(S_t)$$
2.4 A Escada Hierárquica de Modelos

| Modelo | Escopo de Modelagem | Função no Programa de Validação |
| :--- | :--- | :--- |
| **PMev-0** | Stacks Globais + Estrutura de Payouts (Harville Puro) | Baseline de consistência e aninhamento. |
| **PMev-D** | Relógio institucional ($\tau_t$), subida de blinds, posição orbital, SPR | Teste da dinâmica temporal determinística. |
| **PMev-T** | Transições estocásticas: quebra de mesa, redraw, late registration | Teste de transições institucionais de field. |
| **PMev-S** | Skill heterogênea e amortização de edge por profundidade ($S_{\text{eff}}$) | Teste de assimetria de capacidade técnica. |
| **PMev-B** | Crenças Bayesianas $b_t(\theta)$ e resposta quântica adversária (AQRE) | Teste de modelagem comportamental e ruído. |
| **PMev-O** | Opcionalidade contrafactual $\Omega(s)$ e valor dinâmico de fold | Teste de flexibilidade estratégica futura. |
| **PMev-F** | Supermodelo Total Integrado | Modelo candidato final para avaliação OOS. |

________________

VOLUME III: MICROECONOMIA, CONTEST THEORY E A GEOMETRIA DO RISCO
3.1 Teoria de Concursos e Arquitetura de Prêmios
A teoria econômica de Contest Theory (Lazear & Rosen 1981; Moldovanu & Sela 2001, 2006) demonstra que torneios com recompensas por classificação induzem alocações ótimas de esforço e aversão ao risco através da dispersão marginal de prêmios: $$\Delta p_k = p_k - p_{k+1}$$ Quando a função de custo de esforço/risco é convexa — como ocorre em MTTs devido à concavidade estrita da curva de premiação —, a distribuição de prêmios em múltiplos degraus induz assimetrias estratégicas severas entre líderes e seguidores.
3.2 Não-Linearidade de Utilidade e Aversão Endógena
Conforme Gilbert (2009), participar de uma aposta justa bilateral em fichas ($\mathbb{E}[\Delta s] = 0$) em ambiente de ICM resulta estritamente em destruição de valor esperado monetário para ambos os participantes ($\mathbb{E}[\Delta V_{\text{ICM}}] < 0$), gerando uma externalidade positiva líquida para os jogadores passivos não envolvidos na mão.
3.3 A Derivação Exata do Bubble Factor e do Risk Premium
O Bubble Factor do jogador $i$ contra o jogador $j$ é a razão marginal de penalidade utilitária: $$BF_{i \to j} = \frac{\Delta V_{\text{ICM}}^{-}(i \to j)}{\Delta V_{\text{ICM}}^{+}(i \to j)} = \frac{V_{\text{ICM}}(s_i) - V_{\text{ICM}}(s_i - \text{investimento})}{V_{\text{ICM}}(s_i + \text{ganho}) - V_{\text{ICM}}(s_i)}$$

O ponto de indiferença de call monetário exige equidade mínima: $$q_{\text{req}} = \frac{BF}{BF + 1}$$

O Risk Premium ($RP$) é definido rigorosamente como o acréscimo de equidade sobre o baseline linear: $$RP = q_{\text{req}} - q_{\text{ChipEV}} = \frac{BF}{BF + 1} - \frac{B}{P + 2B}$$ No confronto simétrico com pot odds nominais de 50% ($q_{\text{ChipEV}} = 0,!5$): $$RP_{\text{simétrico}} = \frac{BF}{BF + 1} - \frac{1}{2} = \frac{BF - 1}{2(BF + 1)}$$
3.4 O Diferencial de Autorização Estratégica: Risk Advantage ($\Delta RP$)
A autorização de agressão estratégica entre dois jogadores é parametrizada pelo diferencial aritmético: $$\Delta RP_{i \leftrightarrow j} = RP_i(j) - RP_j(i)$$

* Quando $\Delta RP > 0$ a favor de $i$, o jogador $i$ pode expandir exponencialmente suas frequências de blefe e pressão secundária pós-flop, pois o jogador $j$ é contido pela severidade de sua desvantagem extrínseca de risco.

________________

VOLUME IV: PROBABILIDADE E PROCESSOS ESTOCÁSTICOS DE ELIMINAÇÃO
4.1 Limitações Estruturais do Harville / Forward Plackett-Luce
O mecanismo tradicional de Harville (1973) opera como um modelo de escolha discreta direta (Forward Plackett-Luce): $$P(i_1, i_2, \dots, i_k) = \prod_{m=1}^k \frac{s_{i_m}}{\sum_{j=m}^k s_{i_j}}$$ Esse modelo herda a premissa de corridas de participantes independentes, calculando probabilidades do topo para a base (top-down). Contudo, torneios de poker operam por processos de atrito e absorção sequencial (bottom-up).
4.2 O Modelo de Atrito e Sobrevivência (Reverse Plackett-Luce)
Conforme demonstrado por Graves et al. (2003) e Henderson & Kirrane (2018), competições de eliminação estocástica com risco de cauda são modeladas com precisão estatística superior pelo modelo reverso de atrito: $$P(\sigma_{\text{elim}}) = \prod_{m=1}^{k-1} \frac{\lambda_{i_m}^{-1}}{\sum_{j=m}^k \lambda_{i_j}^{-1}}$$ onde $\lambda_i = f(s_i, \text{skill}_i, \text{posição}_i)$ é a taxa de resiliência e sobrevivência do stack.
4.3 O Teorema de Absorção em Cadeias de Markov de Diaconis & Ethier
A prova matemática de que o modelo Harville/ICM diverge da verdadeira dinâmica de eliminação estocástica foi estabelecida por Persi Diaconis e Stewart N. Ethier (2022) no modelo clássico de Gambler's Ruin multiagente no simplex $\Delta^3$:

* Para 3 jogadores com capitais $(1, 1, N-2)$, a probabilidade prevista pelo ICM de o jogador com $N-2$ fichas ser eliminado em primeiro lugar decai como: $$P_{\text{ICM}}(\text{Jogador 3 é eliminado primeiro}) = \frac{2}{N(N-1)} \sim \mathcal{O}(N^{-2})$$
* O cálculo analítico exato via núcleo de Poisson e medidas harmônicas em cadeias de Markov absorventes prova que a verdadeira taxa de absorção assintótica decai como: $$P_{\text{Real}}(\text{Jogador 3 é eliminado primeiro}) \sim \frac{C}{N^3} = \mathcal{O}(N^{-3})$$
4.4 Resíduos Sistemáticos em Grandes Datasets Empíricos
A evidência empírica recente confirma o teorema matemático:

1. Juho Kim (2025 - IEEE CoG): Em análise de 9.958 torneios e 33.478 jogadores, o ICM reduziu substancialmente o erro frente a baselines ingênuos ($MSE = 4,!30 \times 10^{-3}$ vs. $6,!77 \times 10^{-3}$), mas gerou resíduos sistemáticos estruturados: subestimação consistente de stacks grandes e superestimação de stacks curtas: $$\mathbb{E}[\varepsilon_{\text{ICM}} \mid \text{Stack Quantile}] \neq 0$$
2. Scott, Sher & Paz (2025 - JGBE): Em 17.852 entradas de 25 eventos WSOP Circuit, confirmou-se a sobreperformance das maiores stacks em relação às expectativas estáticas de Harville.

________________

VOLUME V: TEORIA DE OPÇÕES REAIS E MACRO-DINÂMICA POR JOGOS DE CAMPO MÉDIO
5.1 O Axioma do Valor de Continuação do Fold
A normalização $EV_{\text{fold}} = 0$ oculta o valor contrafactual de sobrevivência do stack. O valor de uma decisão de aposta é expressa por: $$EV_{\text{call}} = E \cdot V(S_{\text{win}}) + (1 - E) \cdot V(S_{\text{loss}}) - V(S_{\text{fold}})$$ onde $V(S_{\text{fold}}) > 0$ em termos absolutos de valuation de torneio.
5.2 O Fold como Exercício da Option to Wait e Histerese
Na Teoria de Opções Reais (Dixit & Pindyck 1994; Arrow & Fisher 1974), arriscar fichas constitui um investimento irreversível sob incerteza e volatilidade. O fold atua como o exercício contínuo da Option to Wait (Opção de Esperar), preservando a flexibilidade estratégica de enfrentar oponentes mais fracos em posições futuras mais favoráveis. A incerteza expande a Zona de Histerese Estratégica ($W_H$): $$W_H = S_{\text{entry}}^* - S_{\text{exit}}^*$$ fundamentando por que o limiar ótimo de investimento de fichas em MTTs deve ser estritamente superior ao break-even de ChipEV.
5.3 Formalização da Opcionalidade Contrafactual $\Omega(s)$
$$\Omega(S_t) = V^(S_t) - V^{\mathcal{A}{\text{restrito}}}(S_t)$$ onde $\mathcal{A}_{\text{restrito}}$ representa a perda de manobrabilidade tática pós-flop por compressão severa de SPR.
5.4 Macro-Dinâmica por Mean Field Games (MFG)
Para torneios com $N \to \infty$ participantes, a macro-evolução da densidade de fichas populacional $m(t, s)$ e o controle ótimo individual $v(t, s)$ são governados pelo sistema acoplado de EDPs (Lasry & Lions 2007; Nutz & Zhang 2019, 2023): $$\begin{cases} \partial_t v(t,s) + \sup_{a \in \mathcal{A}} \left{ \mu(s, a, m_t) \partial_s v(t,s) + \frac{1}{2}\sigma^2(s, a) \partial_{ss} v(t,s) \right} = 0 & \text{(Hamilton-Jacobi-Bellman)} \ \partial_t m(t,s) + \partial_s \left( \mu^*(s, m_t) m(t,s) \right) - \frac{1}{2}\partial_{ss} \left( \sigma^{*2}(s) m(t,s) \right) = -\delta_{\text{ruin}}(s) & \text{(Fokker-Planck com Absorção)} \end{cases}$$ Esse sistema modela com rigor analítico a compressão contínua do M de Harrington da população pelo relógio de blinds e o rebalanceamento estocástico de mesas (Table Rebalancing).

________________

VOLUME VI: A PONTE JANDA-VITOI E DINÂMICAS DE DEFESA PÓS-FLOP
6.1 Subversão da MDF Clássica
A Frequência Mínima de Defesa tradicional ($\text{MDF} = \frac{P}{P+B}$), formulada por Matthew Janda para jogos em ChipEV, colapsa em torneios. Tentar defender a MDF linear em nós de alto Bubble Factor resulta em destruição massiva de $EV$ monetário.
6.2 Dedução da Equação de Indiferença de Nash sob Bubble Factor no River
No confronto de river enfrentando aposta polarizada $B$ em pote $P$ sob Bubble Factor $BF$: $$EV_{\text{call}} = E \cdot (P + B) - (1 - E) \cdot (B \cdot BF) = 0$$ Isolando o limiar de equidade exigida $E^$: $$E^(B, P, BF) = \frac{B \cdot BF}{P + B + B \cdot BF} = \frac{BF}{\frac{P}{B} + 1 + BF}$$

A frequência de defesa ótima torna-se: $$\text{MDF}_{\text{PMev}}(B, P, BF) = 1 - E^*(B, P, BF) = \frac{P + B}{P + B + B \cdot BF}$$
6.3 O Mecanismo do Teto do Risk Premium
Conforme $BF \to \infty$, $E^* \to 1$ e $\text{MDF}_{\text{PMev}} \to 0$. O Teto do RP estabelece o limite intransponível onde a sobrevivência monetária prevalece sobre a captura de blefes marginais, forçando o defensor a realizar overfolds estruturais em relação ao ChipEV.
6.4 Paradoxo da Inversão de Risco do Chip Leader e o Pacto Silencioso

1. Inversão de Risco: Quando o líder em fichas arrisca dobrar um competidor direto, ele restaura a equidade de um rival perigoso e corrói sua própria alavancagem futura sobre a mesa.
2. O Pacto Silencioso (Silent Collusion): No equilíbrio de Nash de Mesas Finais com múltiplos short stacks, stacks dominantes evitam colisões bilaterais pré-flop (suprimindo 3-bets e expandindo flat calls), transferindo passivamente a pressão de eliminação para as pilhas menores.

________________

VOLUME VII: TEORIA DOS JOGOS COMPORTAMENTAL E INTELIGÊNCIA ARTIFICIAL
7.1 Agent Quantal Response Equilibrium (AQRE)
Em substituição a noções informais de "taxas de maluquice", a PMev formaliza os desvios e a racionalidade limitada dos oponentes via AQRE (McKelvey & Palfrey 1995): $$\pi_j(a \mid s, \theta_j) = \frac{\exp\left(\lambda_j(\theta_j) \cdot Q_j(s, a)\right)}{\sum_{a' \in \mathcal{A}} \exp\left(\lambda_j(\theta_j) \cdot Q_j(s, a')\right)}$$ onde $\lambda_j \in [0, \infty)$ é o parâmetro de sensibilidade do oponente: $\lambda_j \to \infty$ recupera o equilíbrio de Nash exato; $\lambda_j \to 0$ representa escolha aleatória uniforme.
7.2 Inferência Bayesiana Hierárquica (EDM / MDA)
A atualização da distribuição de crenças $b_t(\theta_j)$ utiliza shrinkage hierárquico (Albrecht & Stone 2018; Southey et al. 2012): $$P(\theta_j \mid \mathcal{D}_j) \propto P(\mathcal{D}_j \mid \theta_j) \cdot P(\theta_j \mid \text{População, Stakes, Estrutura})$$ Amostragens pequenas puxam a estimativa para o prior populacional; amostragens volumosas personalizam a contra-estratégia exploratória (node-locking probabilístico).
7.3 Amortização da Edge por Profundidade de Stack
A vantagem técnica relativa ($\Delta \text{Skill}$) é modulada pela complexidade da árvore de decisões: $$\text{Edge}(S_{\text{eff}}) = f(\Delta \text{Skill}) \cdot \log(S_{\text{eff}})$$

* Com $S_{\text{eff}} \ge 60\text{bb}$: Árvore profunda e fractal; múltiplos nós pós-flop maximizam a oportunidade de erro cumulativo ($O_e$) do oponente amador.
* Com $S_{\text{eff}} \le 10\text{bb}$: Árvore binária ($\text{Push} \lor \text{Fold}$); a equidade intrínseca de showdown pré-flop e as tabelas comoditizadas de Nash amortizam a superioridade técnica, neutralizando a edge do jogador de elite.
7.4 Resolução em Subjogos com Profundidade Truncada (ReBeL / Continual Resolving)
A tratabilidade computacional em tempo real fundamenta-se nos algoritmos ReBeL (Brown et al. 2020) e DeepStack (Moravčík et al. 2017), solucionando subjogos com profundidade finita $H$ truncados em redes de valor terminal $\Phi(S_{t+H}) = V_{\text{ICM}}(S_{t+H})$.

________________

VOLUME VIII: PROTOCOLO EXPERIMENTAL DE SOLVERS E ANÁLISE METODOLÓGICA
8.1 Evidências Empíricas da Aula 1.2 (HRC Pós-Flop vs. GTO Wizard)
No estudo de caso com árvore completa de Mesa Final 9-max ($11 Vanilla, BTN 38bb vs. BB 53bb, board $K\diamondsuit J\clubsuit T\spadesuit 2\diamondsuit 3\heartsuit$):

1. Supressão de Sizings Grandes: O solver em ICMev elimina quase 100% das apostas de 50% e pot-size no flop, concentrando 94,3% de checks e 5,7% de apostas de 20% do pote.
2. Defesa Restrita do Big Blind: Com desvantagem de risco de +8,5% para o BTN, o BB reduz check-raises e aumenta folds em mais de 35% comparado ao ChipEV.
3. Pós-Flop Barrel e River Collusion: O BTN em posição exerce pressão contínua com small bets no flop e turn, forçando o BB a atingir o Teto do RP no river com $54,2%$ de fold perante shove.
8.2 A Falácia da Stack Efetiva Isolada e o Bunching Effect Global
1. Contexto Global: O HRC Pós-Flop incorpora as stacks dos jogadores que deram fold pré-flop, demonstrando que a proximidade de eliminações alheias altera as frequências dos dois jogadores ativos em mais de 30%.
2. Bunching Effect: O descarte de cartas baixas/desconectadas pelos jogadores em fold pré-flop altera a densidade residual do baralho, aumentando a concentração de cartas altas nos ranges restantes.

________________

VOLUME IX: TRANSIÇÕES INSTITUCIONAIS E A TERMODINÂMICA DE LATE REGISTRATION
9.1 O Operador de Entrada Tardia
A entrada tardia no instante $t_{\text{close}}$ adiciona um jogador com stack inicial $s_0$, contribuição líquida $c$ e altera a premiação por $\Delta \mathbf{p}$: $$S^+ = \mathcal{T}_{\text{entry}}(S^-; s_0, c, \Delta \mathbf{p})$$
9.2 Teorema da Conservação de Valor
Em um torneio sem overlay ou rake adicional: $$\sum_{i \in \text{Incumbentes}} \Delta V_i = -B_{\text{entry}} = -(V_e(S^+) - c)$$
9.3 O Bônus de Equity do Entrante (Benchmark Hallaert)
Nas simulações Monte Carlo em R de Kenny Hallaert (2019):

* Online ($500 buy-in): 52/165 ativos; stack inicial adquire valor ICM imediato de ~$581 (+16% de bônus).
* Live ($4.650 buy-in): 189/518 ativos; stack inicial adquire valor ICM imediato de ~$5.117 (+10% de bônus).
* Live ($9.400 buy-in): 90/173 ativos; stack inicial adquire valor de ~$9.844 (+4,7% de bônus), diluindo a equity dos incumbentes em 0,28% em média.

________________

VOLUME X: O LEDGER MESTRE DE HIPÓTESES E VALIDAÇÃO PADRÃO OURO
10.1 O Ledger Mestre das 12 Hipóteses Falsificáveis
ID
 Enunciado da Hipótese
 Baseline de Comparação
 Desenho Experimental / Dataset
 Métrica de Desempenho
 Critério Estrito de Falsificação
 $H_1$
 Superioridade Preditiva OOS: A PMev-D reduz o erro de previsão de colocação final em relação ao Harville ICM.
 $\text{PMev-0}$ (Harville ICM) e $\text{FGS}$
 Holdout temporal estrito por eventos independentes (WSOP + Online).
 Continuous Ranked Probability Score (CRPS) e Log-Loss
 $\mathbb{E}[\mathcal{L}{\text{PMev-D}}^{\text{OOS}}] \ge \mathbb{E}[\mathcal{L}{\text{ICM}}^{\text{OOS}}] - \delta$ com $\delta \le 0$.
 $H_2$
 Mediação do Resíduo de Kim: O viés sistemático do ICM em função da stack ($\varepsilon_{\text{ICM}} \sim \text{Stack}$) é mitigado pelas variáveis da PMev.
 Modelo residual de Kim (2025)
 Regressão linear: $\varepsilon_{\text{ICM}} \sim \beta_1 \text{Stack} + \mathbf{\Gamma} \mathbf{Z}_{\text{PMev}}$.
 Coeficiente $\beta_1$ e $R^2$ ajustado
 $\beta_1$ permanece estatisticamente inalterado ($p > 0,!05$) após condicionamento a $\mathbf{Z}_{\text{PMev}}$.
 $H_3$
 Erosão Temporal Antecipada ($t-3$): A proximidade do salto de blinds deprecia $V(S_{\text{fold}})$, expandindo o range ótimo de abertura.
 Solver estático sem relógio ($\Delta t = \infty$)
 Testes pareados em solver com estados $S^{(0)} (\Delta t = 15\text{m})$ vs. $S^{(1)} (\Delta t = 2\text{m})$.
 Variação de Range $\Delta \text{RFI}$ e $\Delta Q(\text{open})$
 $\Delta Q(\text{open}) \le 0$ ou expansão de range não-detectável estatisticamente.
 $H_4$
 Subversão da MDF no River: Em alto Bubble Factor ($BF > 1,!5$), a defesa de bluffcatchers é limitada por $E^*(BF)$ e não pela MDF linear.
 $\text{MDF}_{\text{GTO}} = \frac{P}{P+B}$ (Janda)
 Solves pareados de river variando a matriz de payouts com árvore idêntica.
 Frequência de Defesa $\text{Def}_{%}$ vs. $1 - E^*(BF)$
 $\text{Def}{%}$ converge para $\text{MDF}{\text{GTO}}$ ignorando a penalidade do Bubble Factor.
 $H_5$
 Amortização da Edge por Stack: A diferença de winrate ($\text{bb}/100$) entre jogadores de skills distintas decresce com a redução de $S_{\text{eff}}$.
 Modelo de Edge Constante ($\text{Edge} \propto \text{Skill}$)
 Análise empírica de base massiva (MDA >10M mãos) segmentada por faixas de stack.
 Diferencial de Winrate $\Delta \text{ROI}$ e $\Delta \text{bb}/100$
 $\Delta \text{ROI}(10\text{bb}) \approx \Delta \text{ROI}(100\text{bb})$, refutando a amortização logarítmica.
 $H_6$
 Exploitabilidade Superior via AQRE: Modelar adversários com resposta quântica ($\lambda_j$) gera maior rentabilidade que node-locks rígidos.
 Node-locking fixo e Nash puro
 Backtesting contra bases históricas de jogadores rastreados com split treino/teste.
 Regret acumulado e $EV$ monetário realizado
 Política AQRE apresenta regret superior ou $EV$ realizado inferior ao node-lock fixo.
 $H_7$
 Opcionalidade Contrafactual do SPR: Preservar cobertura e flexibilidade pós-flop possui valor estocástico positivo ($\Omega(s) > 0$).
 Modelo sem opcionalidade ($\Omega(s) \equiv 0$)
 Simulações pareadas de trajetória com e sem restrição artificial de linhas pós-flop.
 $\Delta V = V^(s) - V^_{\text{restr}}(s)$
 $\Omega(s) \le 0$ em estados com profundidade efetiva $S_{\text{eff}} \ge 40\text{bb}$.
 $H_8$
 Downward Drift Condicional de Sizings: Assimetrias de risco desfavoráveis suprimem apostas grandes em favor de checks e small bets (20-25%).
 Estrutura de apostas em ChipEV puro
 Solves de flop/turn pareados no HRC comparando ChipEV vs. ICMev 9-max.
 Frequência agregada de apostas $\ge 50%$ pot
 Frequências de apostas $\ge 50%$ mantêm-se inalteradas entre ChipEV e ICMev.
 $H_9$
 Conservação de Valor em Late Reg: O bônus financeiro de entradas tardias é compensado pela redução de equity dos incumbentes.
 Hipótese de não-conservação / valor nulo
 Replicação do algoritmo Monte Carlo de Hallaert em Python com seeds controladas.
 Balanço contábil: $\sum \Delta V_i + B_{\text{entry}}$
 $\left|\sum_{i} \Delta V_i + B_{\text{entry}}\right| > \epsilon_{\text{MonteCarlo}}$, violando a conservação.
 $H_{10}$
 Pacto Silencioso em Mesas Finais: Stacks dominantes reduzem 3-bets e aumentam flat calls na presença de múltiplos short stacks.
 Estratégia pré-flop em ChipEV
 Simulações HRC pré-flop comparando FT com shorts vs. FT com stacks equilibrados.
 Frequência de 3-bet do CL contra o Vice-CL
 Frequência de 3-bet entre líderes não se altera perante a distribuição de stacks da mesa.
 $H_{11}$
 Insolvência das Pot Odds em Multiway: A taxa de erro estratégico cometida por humanos guiados por pot odds nominais cresce em potes multiway.
 Modelo de decisão linear por Pot Odds
 Estudo experimental controlado com profissionais avaliando decisões com RIO latentes.
 Taxa de erro de decisão e perda de $EV$ monetário
 Decisões baseadas em Pot Odds puras apresentam desempenho idêntico ao modelo PMev.
 $H_{12}$
 Parcimônia Paramétrica da PMev: O ganho de informação da PMev-F compensa a penalidade de complexidade sobre modelos restritos.
 Modelos parcimoniosos ($\text{PMev-0}$ e $\text{PMev-D}$)
 Avaliação via critérios de informação de Akaike (AIC) e Bayesiano (BIC) fora da amostra.
 $\Delta \text{AIC}$ e $\Delta \text{BIC}$
 $\text{BIC}(\text{PMev-F}) > \text{BIC}(\text{PMev-D})$, indicando complexidade injustificada.
 10.2 Protocolo de Validação Fora da Amostra (OOS)
A validação definitiva exige a demonstração estatística de que o modelo aninhado supera os baselines com significância estatística: $$\Delta_{\text{OOS}} = \mathcal{L}{\text{ICM/FGS}}^{\text{OOS}} - \mathcal{L}{\text{PMev}}^{\text{OOS}} > \delta > 0$$
10.3 Testes Adversariais e Controles Negativos

1. Controle de Permutação de Habilidade: Embaralhar aleatoriamente os índices de skill ($\theta_j$). A degradação na performance confirma sinal genuíno de habilidade.
2. Controle de Ruído Temporal: Inserir tempos aleatórios de blinds ($\tau_t$). A perda de ganho confirma a causalidade do relógio institucional.
10.4 Governança de Código Aberto no GitHub
O repositório pmev-benchmark no GitHub (RaphaelVitoi) integrará os datasets anonimizados, scripts de replicação de solvers e pipeline de CI/CD (SOTA v7.0 GOLD) com SonarQube Cloud aprovado.

________________

Documento consolidado e pronto para submissão aos periódicos e conferências internacionais de Teoria dos Jogos e Inteligência Artificial em Jogos.
