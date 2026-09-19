# Arquitetura Estratégica Unificada do Arcabouço Poker & PMev

## Paradigma Raphael Vitoi — Ecossistema Nexus SOTA v8.0 GOLD

> **Data de Consolidação:** 13 de Setembro de 2026  
> **Fontes Integradas:** Google Drive API v3 (4.021 itens), Microsoft OneDrive (15.786 itens) e Repositório Local (`Site/engine/` & `docs/research/pmev/`).  
> **Matriz de Evidência Pós-Flop:** **Aula 1.2 (Raphael Vitoi)** — corpus-fonte com 97 nós/figuras descritos; o fixture operacional local contém 7 `EvidencePair`, ainda sem reprodução independente enquanto faltarem build, e-Nash e unidade explícitos (board Kd Jc Ts, BTN RP 21,4% vs. BB RP 12,9%).  
> **Fundamentação Acadêmica:** Microeconomia de Torneios (Moldovanu & Sela, 2001/2006), Processos Estocásticos de Absorção (Diaconis & Ethier), Benchmark Empírico de Resíduos (Kim, 2025), Teoria dos Jogos Algorítmica (Brown et al., ReBeL 2020) e Equilíbrio Quantal (McKelvey & Palfrey, AQRE).

---

## 1. Visão Geral e Topologia em 6 Camadas

O arcabouço unificado de Poker e PMev organiza o conhecimento em seis camadas hierárquicas e complementares:

```mermaid
flowchart TD
    classDef epist fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef formal fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef engine fill:#0284c7,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef lab fill:#0369a1,stroke:#7dd3fc,stroke-width:1px,color:#fff;
    classDef ped fill:#047857,stroke:#34d399,stroke-width:2px,color:#fff;
    classDef data fill:#334155,stroke:#94a3b8,stroke-width:1px,color:#e2e8f0;

    C1["1. Camada Epistemológica & Axiomática<br/>Enciclopédia Magna 12/12, Tratado 10 Volumes, Dossiês"] :::epist --> C2["2. Camada Formal-Matemática<br/>Modelos PMev-0 a PMev-F, Wasserstein-Fisher-Rao, Markov R1-R6"] :::formal
    C2 --> C3["3. Camada de Engenharia & Contratos<br/>engine/pmev_spec.py, pipeline, late_registration, experiments"] :::engine
    C3 --> C4["4. Camada de Solvers & Bancadas<br/>HRC Pro Benchmarks, Super-Solve Bolha (10.95GB), 3.279 CFRs"] :::lab
    C4 --> C5["5. Camada Pedagógica & Evidência Pós-Flop<br/>Aula 1.2 (97 nós pareados), Pressão em Alto ICM (36 slides), Ole, Fabi"] :::ped
    C5 --> C6["6. Camada de Dados Brutos (Data Lake)<br/>3.804 Hand Histories (WPN, PS, 888, iPoker) para MDA"] :::data
```

---

## 2. O Díptico de Evidência Autoral: Entendendo o ICM e suas Heurísticas & Aula 1.2 (Raphael Vitoi)

A fundação conceitual e analítica pós-flop do ecossistema é consolidada em dois documentos autorais soberanos de Raphael Vitoi localizados originalmente em `Downloads/` e replicados em `docs/research/pmev/`:

### 2.1 A Matriz Conceitual de Toy Games: `Entendendo o ICM e suas heurísticas.docx` (5,72 MB)

* **Ledger Estruturado:** [`docs/research/pmev/ENTENDENDO_ICM_HEURISTICAS_LEDGER.md`](file:///c:/Users/rapha/.gemini/Site/docs/research/pmev/ENTENDENDO_ICM_HEURISTICAS_LEDGER.md) (26.000 caracteres, 201 parágrafos).
* **Fundamentação de Toy Games:** Modela o confronto clássico de river polarizado em board neutro ($22223$), pote de 100 fichas e shove de 100 fichas:
  $$\text{Range IP: } \{AA, QQ, JJ\} \text{ (18 combos)}, \quad \text{Range OOP: } \{KK\} \text{ (6 combos - bluffcatcher puro)}$$
* **ChipEV vs. Teto de RP:** Enquanto no ChipEV o defensor paga $1-a = 50\%$ para neutralizar blefes, o ICM impõe o *Teto do RP*, fixando a defesa estritamente no limite de risco aceitável.
* **Inversão de RP e Efeito Organismo da FT:** Demonstra que quando o IP possui RP massivo ($\text{RP}_{\text{IP}} = 21\%$ vs $\text{RP}_{\text{OOP}} = 3\%$), o OOP, mesmo com risco mínimo, **eleva seu fold para até 80%**, pois dobrar o oponente dissipa a pressão do CL sobre o restante da mesa (a FT como organismo dinâmico interconectado). Cálculos validados em parceria com Dan Almeida.

### 2.2 A Matriz Empírica Pós-Flop: `Aula 1.2.docx` (31,3 MB)

* **Ledger Estruturado:** [`docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md`](file:///c:/Users/rapha/.gemini/Site/docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md) (329 parágrafos, 97 figuras/nós gráficos pareados HRC Pós-Flop vs. GTO Wizard).
* **Cenário Real de FT 9-Max:** MTT Vanilla de \$11, field de 126 entradas, premiação estruturada (\$237,34 a \$36,47).
* **Confronto:** BTN abre min-raise, SB fold, BB call. BTN com 38 BB e BB com 53 BB em pote de 5,63 BB no bordo dinâmico $K\diamondsuit J\clubsuit T\spadesuit$.
* **Assimetria de Risk Premium Medida:**
  $$\text{RP}(\text{BTN}) = 21,4\%, \quad \text{RP}(\text{BB}) = 12,9\%, \quad \Delta \text{RP} = +8,5 \text{ p.p.}$$
* **Fenômenos Provados em Árvore Completa:**
  1. *Downward Sizing Drift:* Sob pressão de ICM, o solver não apenas amplia os checks, mas desloca apostas grandes para sizings menores (leads de 25% do pote).
  2. *Bunching Recursivo Global:* O HRC integra os descartes pré-flop dos 7 jogadores ausentes na mão, alterando a densidade residual do baralho.
  3. *Desconstrução da Passividade do Chip Leader:* A inércia do CL destrói sua vantagem de risco ao permitir colisões livres entre stacks médios.

### 2.3 Formalizações Teóricas Adicionais: EV do Fold Positivo, FGS Dinâmico e Anatomia das RIO (Raphael Vitoi)

A partir dos manuscritos fundamentais [`Site/docs/research/materials/icmteoriaadicionalpt1.txt`](file:///c:/Users/rapha/.gemini/Site/docs/research/materials/icmteoriaadicionalpt1.txt) e [`Site/docs/research/materials/icmteoriaadicionalpt2.txt`](file:///c:/Users/rapha/.gemini/Site/docs/research/materials/icmteoriaadicionalpt2.txt), integram-se quatro teoremas estruturais ao arcabouço:

1. **O Teorema do EV do Fold Dinâmico em ICM:**
   * Em ChipEV puro, $EV_{\text{fold}} = -\text{antes} = -0,125\text{ BB}$. Logo, qualquer mão com $EV > -0,125\text{ BB}$ (por exemplo, $-0,10\text{ BB}$) já se constitui matematicamente como um open lucrativo.
   * No pós-flop, o investimento prévio impõe $EV_{\text{fold}} < 0$, elevando o custo de abandonar a equidade já comprometida.
   * **A Inversão em ICM:** Em torneios e mesas finais com múltiplos short stacks, **$EV_{\text{fold}}$ pode ser estritamente POSITIVO** ($\mathbb{E}[\text{fold}] > 0$). Foldar do MP com 12 BB quando há shorts de 5 BB à frente significa "passar a vez", preservando capital e potencializando que os adversários colidam e sejam eliminados, capturando payjumps passivos sem assumir risco de variância.

2. **A Cadeia Epistemológica dos Quatro Tempos:**
   $$\text{ICMev (Snapshot Financeiro)} \longrightarrow \text{Esperança Matemática (Lógica Preditiva)} \longrightarrow \text{Expectativa Matemática (Distribuição Probabilística)} \longrightarrow \text{Perspectiva Matemática (Decisão Fechada)}$$
   * *ICMev:* Métrica de corte transversal estático ("qual o valor financeiro da stack se o torneio terminasse neste instante?").
   * *Esperança Matemática:* Vetor estratégico de probabilidades, riscos e ganhos futuros.
   * *Expectativa Matemática:* Distribuição com desvio-padrão considerando a transição de estados no FGS futuro.
   * *Perspectiva Matemática:* A síntese final, fechada e unificada que supera a decisão míope baseada em ICMev isolado.

3. **Reverse Implied Odds (RIO) como Antimatéria das Pot Odds:**
   * Pot odds são uma métrica míope de curto prazo (snapshot) aplicada a um jogo de fluxo contínuo. Atuam como um "cavalo de Troia": oferecem um preço barato para ver a carta, mas atraem o jogador para o passivo estrutural de acertar a segunda melhor mão e continuar sangrando fichas no turn e river.
   * $\text{Implied Odds} = \text{Especulação (Vetor } + \text{)}; \quad \text{Reverse Implied Odds} = \text{Passivo Estrutural (Vetor } - \text{)}$.
   * Em cenários de ICM severo, o *overcall* no river é apenas o sintoma terminal; a negligência das RIO no flop/turn é a causa primária da aniquilação de Perspectiva.

4. **FGS Holístico com Relógio $t-3$, Table Draw e Resiliência Emocional:**
   * O FGS tradicional restringe-se a horizontes curtos (6 mãos) com métrica M empobrecida. A formulação Vitoi incorpora:
     * *Antecipação Temporal ($t-3$):* O tempo exato para o salto do nível de blind altera a urgência de ação antes do relógio zerar.
     * *Iminência do Blinds:* Rotação de assento (ex.: UTG que será BB na mão seguinte).
     * *Table Draw:* Ordem de inspeção obrigatória (BB $\rightarrow$ BTN $\rightarrow$ SB $\rightarrow$ nós mesmos).
     * *Defesa Assimétrica do MDF:* O check-raise punitivo possui peso estratégico qualitativo desproporcionalmente maior do que o check-call passivo na realização da defesa mínima de frequência.
     * *Taxa de Desvio Emocional:* Calibração do modelo para a probabilidade humana de erro e blefes irracionais sob pressão extrema.

---

## 3. O Ledger Mestre das 12 Hipóteses Falsificáveis ($H_1$ a $H_{12}$)

<!-- pmev-hypotheses:begin (gerado de data/pmev_hypotheses.json; nao editar a mao) -->

| Hipótese | Enunciado | Baseline | Critério Estrito de Falsificação | Módulo Python Local | Evidência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **$H_1$** | Superioridade Preditiva OOS | $\text{PMev-0}$ / $\text{FGS}$ | $\mathbb{E}[\mathcal{L}_{\text{PMev-D}}^{\text{OOS}}] \ge \mathbb{E}[\mathcal{L}_{\text{ICM}}^{\text{OOS}}]$ | `pmev_pipeline.py` | sem evidência |
| **$H_2$** | Mediação do Resíduo de Kim | Modelo Kim (2025) | $\beta_{\text{stack}}$ não atenua com $\mathbf{Z}_{\text{PMev}}$ ($p > 0,05$) | Regressão OLS local | sem evidência |
| **$H_3$** | Erosão Temporal ($t-3$) | Solver estático | $\Delta Q(\text{open}) \le 0$ na iminência dos blinds | `pmev_spec.py` | sem evidência |
| **$H_4$** | Subversão de MDF no River | $\text{MDF} = \frac{P}{P+B}$ | Defesa converge para MDF tradicional | `pmev_controlled_experiments.py` | sem evidência |
| **$H_5$** | Amortização de Edge por Stack | Edge Constante | $\Delta \text{ROI}(10\text{bb}) \approx \Delta \text{ROI}(100\text{bb})$ | Análise MDA | sem evidência |
| **$H_6$** | Exploitabilidade via AQRE | Nash Inexplorável | Política AQRE apresenta regret superior | Estimador Bayesiano | sem evidência |
| **$H_7$** | Opcionalidade do SPR $\Omega(s)$ | $\Omega(s) \equiv 0$ | $\Omega(s) \le 0$ para $S_{\text{eff}} \ge 40\text{bb}$ | `pmev_spec.py` | sem evidência |
| **$H_8$** | Downward Drift de Sizings | Árvores ChipEV | Em nós de aposta livre, frequência de apostas $\ge 50\%$ inalterada ou crescente | `pmev_h8_drift.py` | transcrita, não reproduzível |
| **$H_9$** | Conservação em Late Reg | Valor Nulo | $\sum \Delta V_i + B_{\text{entry}} \neq 0$ | `pmev_late_registration.py` | sem evidência |
| **$H_{10}$** | Pacto Silencioso em FT | ChipEV | Frequência de 3-bet CL vs Vice inalterada | Aula 1.2 (HRC 9-Max) | sem evidência |
| **$H_{11}$** | Insolvência de Pot Odds | Decisão Linear | Decisões por Odds têm desempenho idêntico | Estudo cego com pros | sem evidência |
| **$H_{12}$** | Parcimônia Paramétrica | $\text{PMev-0}$ / $\text{PMev-D}$ | $\text{BIC}(\text{PMev-F}) > \text{BIC}(\text{PMev-D})$ | `pmev_pipeline.py` | sem evidência |

<!-- pmev-hypotheses:end -->

---

## 4. Arcabouço Computacional Refutável e Contrato Compositivo PMev (Sol × Hermes)

A consolidação do Ecossistema Nexus SOTA v8.0 GOLD estabelece a transição da PMev de hipótese conceitual para arcabouço computacional refutável, condicionando a validade da cadeia compositiva à estabilidade medida da redistribuição entre jogadores (§4.1) e à estrita eliminação da dupla contagem na barreira absorvente.

A cadeia autoral de seis operadores:

$$\text{ChipEV} \xrightarrow{f_1} \text{ICMev} \xrightarrow{f_2} \text{Esperança} \xrightarrow{f_3} \text{Expectativa} \xrightarrow{f_4} \text{Perspectiva} \xrightarrow{f_5} \text{PMev}$$

é adotada formalmente como uma **arquitetura de operadores observáveis e testáveis**, rejeitando qualquer presunção apriorística de precisão ou rotulação da engine como "oráculo". Compor funções não reduz variância automaticamente: pela aproximação de primeira ordem, para $y = (f_5 \circ f_4 \circ f_3 \circ f_2 \circ f_1)(x)$, a covariância é $\Sigma_y \approx J_{\text{global}} \Sigma_x J_{\text{global}}^\top$. Os jacobianos podem contrair ou amplificar o erro residual. Estabilidade, portanto, é propriedade estrita a medir por camada e por ablação.

### 4.1 Dinâmica de Propagação do Erro e Estabilidade do Jacobiano

A cadeia compositiva de seis operadores opera como um sistema dinâmico não linear $y = (f_5 \circ f_4 \circ f_3 \circ f_2 \circ f_1)(x)$. Pela expansão de Taylor de primeira ordem, a matriz de covariância propagada no estágio final é dada por:

$$\Sigma_y \approx J_{\text{global}} \Sigma_x J_{\text{global}}^\top, \quad \text{onde} \quad J_{\text{global}} = \prod_{k=1}^5 J_{f_k} = J_{f_5} J_{f_4} J_{f_3} J_{f_2} J_{f_1}$$

A covariância usa a **derivada real** de cada operador. Uma matriz regularizada que não é a derivada muda o número reportado sem mudar o operador, e subestima a incerteza.

**Correção de 2026-09-13, medida na mesa final da Aula 1.2.** A versão anterior desta seção impunha $\rho(J_{\text{global}}) \le \prod_{k} \Vert J_{f_k} \Vert_2 \le 1$. O critério é mal posto por duas razões:

1. **Unidade.** $f_1$ leva fichas a T\$, e o raio de $J_{f_1}$ depende da unidade das stacks: $3{,}32$ com stacks em bb e $0{,}033$ com as mesmas stacks multiplicadas por 100. Um critério que muda com a unidade não mede estabilidade.
2. **Conservação.** As camadas T\$ → T\$ que conservam o prize pool satisfazem $\mathbf{1}^\top J = \mathbf{1}^\top$. Têm autovalor 1, logo $\rho(J) \ge 1$ por construção, e a contração estrita é impossível para elas.

O que se mede é o raio da **redistribuição** entre jogadores, só nas camadas T\$ → T\$, com $P = I - \tfrac{1}{n}\mathbf{1}\mathbf{1}^\top$ o projetor de soma zero:

$$\rho_\perp = \rho\left(P \, J_{f_4} J_{f_3} J_{f_2} \, P\right)$$

Ele não depende da unidade das stacks e é informativo: $\rho_\perp \approx 0{,}45$ no default, em que $f_3$ contrai a redistribuição, e $\rho_\perp = 1$ na parametrização neutra, em que a cadeia é a identidade. $\rho_\perp > 1$ indica camada que amplifica diferenças entre jogadores, e é reportado, não imposto.

O Jacobiano regularizado de $f_3$ declarava $\rho = 0{,}909$ onde o real é $1{,}0$ e subestimou em cerca de 4% o erro padrão do herói contra Monte Carlo; com a derivada real, a diferença para Monte Carlo foi de 0,7%. Implementação em `engine/pmev_composition.py` e `tangent_spectral_radius` de `engine/pmev_operators.py`.

```text
[Estado Normalizado x]
       │
       ▼
   ┌───────┐
   │  f_1  │ ──► ChipEV / ICMev Baseline (J_1: fichas → T$, fora do critério)
   └───────┘
       │
       ▼
   ┌───────┐
   │  f_2  │ ──► Projeção Temporal / Markov R1-R6 (J_2: conserva o pool)
   └───────┘
       │
       ▼
   ┌───────┐
   │  f_3  │ ──► Política Comportamental / AQRE (J_3: conserva o pool; ρ⊥ ≈ 0,45 no default)
   └───────┘
       │
       ▼
   ┌───────┐
   │  f_4  │ ──► Absorção Estocástica & Barreira (J_4: exige continuação condicional à sobrevivência)
   └───────┘
       │
       ▼
   ┌───────┐
   │  f_5  │ ──► Funcional PMev com Incerteza (J_5: identidade + covariância)
   └───────┘
       │
       ▼
[Measured<T>: Decisão + Covariância Σ_y]
```

Regularizar a matriz jacobiana não estabiliza o operador. Se uma camada amplificar a redistribuição ($\rho_\perp > 1$), a correção é no próprio operador (em $f_3$, o prior Dirichlet, hoje o parâmetro `dirichlet_alpha`), e a mudança precisa aparecer na ablação. Em $f_4$, a ruína só entra com valor de continuação condicional à sobrevivência; sobre a equidade incondicional ela é contada duas vezes (86,27 contra 106,23 T\$ exatos num all-in do BU).

### 4.2 Protocolo de Fechamento da Matriz Pós-Flop (Aula 1.2)

A discrepância entre os 97 nós descritos pedagogicamente na Aula 1.2 e os 7 `EvidencePair` materializados no fixture local decorre da ausência de paridade paramétrica entre o solver de referência e a árvore de execução.

**Parâmetros Estruturais do Cenário (Board $K\diamondsuit J\clubsuit T\spadesuit$):**

* **Pote:** 5,63 BB | **Stack Efetivo:** 38 BB (BTN) vs. 53 BB (BB)
* **Assimetria de Risco:** $\text{RP}(\text{BTN}) = 21,4\%$, $\text{RP}(\text{BB}) = 12,9\%$ ($\Delta\text{RP} = +8,5\text{ p.p.}$)
* **Premiação:** US\$ 237,34 (1º) a US\$ 36,47 (9º)

| Dimensão de Controle | Fixture Local Atual ($N=7$) | Requisito de Replicação Independente ($N=97$) |
| :--- | :--- | :--- |
| **Precisão de Convergência** | Não versionada / Iteração arbitrária | $\epsilon \le 0,1\% \text{ do pote}$ ($\epsilon\text{-Nash}$ explícito) |
| **Efeito Bunching** | Estático ou omitido | Condicionamento estocástico nos 7 folds pré-flop via distribuição hipergeométrica multivariada |
| **Abstração de Ações** | Sizings truncados (1 bet size) | Multi-size contínuo: Leads de $25\%$, Bets de $33\%$, $75\%$, All-in geométrico |
| **Métrica de Unidade** | Fração decimal sem tipagem | Tipagem estrita via `Measured<TournamentDollars>` com rastreio de proveniência |
| **Build/Engine Solver** | HRC Pro (versão não congelada) | Checksum do binário do solver, seeds estocásticas e dump da árvore em formato aberto |

A migração de $N=7$ para $N=97$ exige a execução de scripts de harness que congelem a abstração da árvore pós-flop, garantindo que o *Downward Sizing Drift* (migração de apostas de polarização $\ge 75\%$ para bloqueios/leads de $25\%$) seja uma propriedade da superfície de equilíbrio induzida por $\Delta\text{RP}$, e não um artefato de discretização de apostas.

### 4.3 Análise Crítica e Fronteiras de Falsificação ($H_1$ a $H_{12}$)

Quatro hipóteses concentram os maiores riscos de degeneração formal ou sobreajuste:

```text
                  FRONTEIRAS DE FALSIFICAÇÃO CRÍTICAS
                  
  [H_4: MDF River]                    [H_7: Opcionalidade SPR]
   MDF* = P / (P + B*(1 + ΔRP))        dΩ/ds quebra monotonia em
   Colapso da defesa linear            S_eff ∈ [20, 25] bb (Push/Fold)
             │                                   │
             ▼                                   ▼
  ─────────────────────────────────────────────────────────────
             ▲                                   ▲
             │                                   │
  [H_9: Conservação Late Reg]         [H_12: Parcimônia Paramétrica]
   Σ ΔV_i + B_entry ≠ 0                BIC(PMev-F) vs BIC(PMev-D)
   Não-linearidade em U(W)             Penalização de complexidade k*ln(n)
```

#### $H_4$: Subversão do MDF no River

O cálculo tradicional de Defesa Mínima ($\text{MDF} = \frac{P}{P+B}$) assume neutralidade ao risco (ChipEV). Sob assimetria de prêmio de risco, o fold equity efetivo exigido pelo agressor e o limiar de indiferença do defensor desacoplam-se:

$$\text{MDF}_{\text{PMev}} = \frac{P - \Delta\text{RP}_{\text{def}} \cdot (P + B)}{(P + B) \cdot (1 - \Delta\text{RP}_{\text{def}})}$$

*Critério de refutação:* Se em nós de river com $S_{\text{eff}} / P \le 1,5$ a frequência empírica de defesa divergir de $\text{MDF}_{\text{PMev}}$ em direção ao $\text{MDF}_{\text{linear}}$ ($p > 0,01$), $H_4$ é rejeitada.

#### $H_7$: Opcionalidade do SPR $\Omega(s)$

A premissa $\Omega(s) > 0$ para $S_{\text{eff}} \ge 40\text{ bb}$ assume que a preservação de stack profundo gera valor marginal estritamente crescente via realização de equidade futura. Contudo, em zonas de transição ($S_{\text{eff}} \in [20, 25]\text{ bb}$), a convexidade da função de utilidade é interrompida pela perda de manobrabilidade pós-flop (colapso no regime push/fold), gerando:

$$\frac{\partial^2 U}{\partial s^2} < 0 \implies \Omega(s) \le 0$$

*Critério de refutação:* $\Omega(s)$ deve demonstrar monotonicidade estrita fora do intervalo de transição $[20, 25]\text{ bb}$. Se $\Omega(s) \le 0$ for observado em $S_{\text{eff}} \ge 40\text{ bb}$, a opcionalidade modelada é inconsistente.

#### $H_9$: Não-Conservação em Late Registration

A proposição $\sum \Delta V_i + B_{\text{entry}} = 0$ preserva-se exclusivamente em valor nominal de fichas (conservação de massa). Em espaço de utilidade de torneio ($T\$$):

$$\sum_{i=1}^{N} \Delta V_i(T\$) + V_{\text{entrant}}(T\$) \neq \text{Buy-in}$$

A injeção de stack inicial no field dilui o ICM dos stacks médios enquanto subsidia marginalmente os chip leaders (efeito guarda-chuva de eliminação).

*Critério de refutação:* Constatação de que a soma vetorial das equidades ICM dos jogadores ativos varia exatamente pelo valor de inscrição menos rake ($\Delta V_{\text{pool}} = \text{Buy-in} \cdot (1 - \text{rake})$). Se a variância for nula, o modelo falha em capturar o custo estocástico da diluição de ICM.

#### $H_{12}$: Parcimônia Paramétrica via BIC

Para os modelos $\text{PMev-0}$ (ICM baseline, $k_0$), $\text{PMev-D}$ (Dinâmico, $k_D$) e $\text{PMev-F}$ (Full, $k_F$):

$$\text{BIC} = k \ln(n) - 2 \ln(\widehat{L})$$

A expansão de parâmetros de $\text{PMev-D}$ para $\text{PMev-F}$ só é admissível se:

$$2 \left( \ln(\widehat{L}_F) - \ln(\widehat{L}_D) \right) > (k_F - k_D) \ln(n)$$

Caso contrário, o acréscimo de graus de liberdade configura overfitting sobre o ruído das amostras de Hand Histories.

### 4.4 Contrato Estrutural `Measured<T>` e Não-Duplicação da Ruína

Para garantir interoperabilidade determinística entre Python, TypeScript e WASM, define-se o contrato formal de dados:

```typescript
type Unit = 'TournamentDollars' | 'Chips' | 'Probability' | 'Dimensionless';

interface Bounds {
  readonly lower: number;
  readonly upper: number;
  readonly confidenceLevel: number; // Ex: 0.95, 0.99
}

interface Provenance {
  readonly engineVersion: string;
  readonly solverId: string;
  readonly seed?: number;
  readonly iterations?: number;
  readonly nashDistanceEpsilon?: number;
}

interface Measured<T extends number | number[]> {
  readonly value: T;
  readonly unit: Unit;
  readonly isValid: boolean;
  readonly standardError: number;
  readonly confidenceInterval: Bounds;
  readonly provenance: Provenance;
}
```

#### Resolução do Operador de Absorção

Na modelagem de caminhos de transição sob processos estocásticos de absorção (Diaconis & Ethier), a expectativa de utilidade $\mathbb{E}[U \mid s, a]$ não pode aplicar desconto multiplicativo arbitrário $(1 - P(\text{ruína}))$ sobre uma função de valor que já contém estados absorventes.

O particionamento exato do espaço amostral exige:

$$\mathbb{E}[U \mid s, a] = \underbrace{P(R \mid s, a) \cdot U(s_{\text{absorvido}})}_{\text{Payout já assegurado na eliminação}} + \underbrace{\sum_{s' \notin \mathcal{S}_{\text{abs}}} P(s' \mid s, a) \cdot V(s')}_{\text{Continuidade no jogo}}$$

Onde:

* $\mathcal{S}_{\text{abs}}$ é o conjunto fechado de estados terminais de eliminação.
* $U(s_{\text{absorvido}}) = \text{Payout}(k)$ para a $k$-ésima posição garantida no momento do colapso do stack.
* $V(s')$ satisfaz a equação de Bellman modificada sem amortização redundante:

$$V(s) = \max_{a \in \mathcal{A}} \left[ \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left( r(s, a, s') + \gamma V(s') \right) \right], \quad \text{com } \gamma = 1 \text{ em horizontes finitos de MTT.}$$

Um `circuit breaker` só é admissível como regra de domínio formalizada e testada, nunca como zeragem automática ou arbitrária de valor.

### 4.5 Sequenciamento de Execução da Bancada de Testes

```text
[FASE 0: Teste de Identidade]
  │   critério: PMev-0 ≡ ICMev (tolerância: |Δ| < 1e-9)
  ▼
[FASE 1: Paridade Multi-Runtime]
  │   critério: Python == TypeScript == WASM em 10.000 cenários de toy games
  ▼
[FASE 2: Protocolo OOS contra Baselines]
  │   critério: Erro quadrático médio contra ChipEV, ICMev e FGS
  ▼
[FASE 3: Calibração de Probabilidade de Ruína]
  │   critério: Avaliação de Brier Score e Log-Loss em 3.804 Hand Histories
  ▼
[FASE 4: Calibração Paramétrica do Modelo Integral]
      estado atual: DADOS INSUFICIENTES — NENHUMA CALIBRAÇÃO PLANEJADA
```

A bancada deve recusar qualquer ajuste de pesos empíricos ou calibração de parâmetros até que a Fase 0 (redução exata a zero dos termos dinâmicos colapsando o modelo no ICM clássico) e a Fase 1 (consistência cruzada de arquiteturas de computação sem divergência de ponto flutuante IEEE 754) estejam matematicamente homologadas.

Os alvos aproximados propostos em discussões preliminares (`98,5%`, `88%`, `96%`, `0,3%`, `0,05`, `<200 ms`) permanecem **hipóteses teóricas sem baseline amostral**. Não constituem critérios de aceite atuais.

Até que exista uma amostra elegível e uma infraestrutura de benchmark homologada, o estado literal e definitivo de calibração é:
**DADOS INSUFICIENTES — NENHUMA CALIBRAÇÃO PLANEJADA**.
