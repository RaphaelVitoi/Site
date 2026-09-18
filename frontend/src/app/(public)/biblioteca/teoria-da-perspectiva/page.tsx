/**
 * IDENTITY: Teoria da Perspectiva no Poker & Arcabouço PMev SOTA v8.0 GOLD
 * PATH: src/app/(public)/biblioteca/teoria-da-perspectiva/page.tsx
 * ROLE: Artigo científico fundamentando a Teoria da Perspectiva (Kahneman & Tversky),
 *       a Topologia em 6 Camadas da PMev e o Ledger das 12 Hipóteses Falsificáveis.
 * VERSION: v8.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { PmevRangeViewer } from '@/components/simulator/PmevRangeViewer';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = String.raw`
# Teoria da Perspectiva e a Arquitetura Estratégica PMev

A **Teoria da Perspectiva (Prospect Theory)**, desenvolvida por Daniel Kahneman e Amos Tversky, é a pedra angular da economia comportamental. No Poker Racional, aplicamos seus axiomas para compreender como a distorção cognitiva e a aversão à perda moldam o comportamento dos adversários, integrando essas assimetrias na **Arquitetura Estratégica PMev**.

---

## 1. A Assimetria do Valor (Aversão à Perda)

A função de utilidade empírica não é linear: a dor de perder \$1.000 é psicologicamente duas vezes mais intensa do que o prazer de acumular os mesmos \$1.000. 

No Poker de Torneios (MTT), essa assimetria ganha respaldo físico no ICM:
* **Efeito de Congelamento:** Em spots com payjumps iminentes, o cérebro supervaloriza a sobrevivência (*status quo*) em detrimento do valor esperado positivo (+EV em fichas).
* **Sensibilidade Decrescente:** Quanto maior a quantidade de fichas acumuladas por um Chip Leader, menor o valor marginal que ele atribui a cada unidade adicional, facilitando agressão predatória.
* **Ponderação de Probabilidade:** Humanos superestimam probabilidades diminutas (como bad beats de 2%) e subestimam cenários de alta frequência, abrindo margem para overfolds estruturais.

---

## 2. A Topologia em 6 Camadas da PMev

O arcabouço unificado de Poker e PMev organiza o conhecimento em seis camadas estruturais hierárquicas:

\`\`\`mermaid
flowchart TD
    C1["1. Camada Epistemológica & Axiomática (Tratados e Dossiês)"] --> C2["2. Camada Formal-Matemática (Modelos PMev-0 a PMev-F)"]
    C2 --> C3["3. Camada de Engenharia & Contratos (engine/pmev_spec.py)"]
    C3 --> C4["4. Camada de Solvers & Bancadas (CFR e Benchmarks)"]
    C4 --> C5["5. Camada Pedagógica & Evidência Pós-Flop (Aula 1.2, 97 nós)"]
    C5 --> C6["6. Camada de Dados Brutos (Data Lake e Hand Histories)"]
\`\`\`

---

## 3. A Cadeia Compositiva dos Seis Operadores

A transição da decisão estratégica pura não ocorre em um único salto linear, mas em uma cadeia compositiva de seis operadores observáveis e testáveis:

$$\text{ChipEV} \xrightarrow{f_1} \text{ICMev} \xrightarrow{f_2} \text{Esperança} \xrightarrow{f_3} \text{Expectativa} \xrightarrow{f_4} \text{Perspectiva} \xrightarrow{f_5} \text{PMev}$$

1. **$f_1$ (ChipEV $\rightarrow$ ICMev):** Mapeia fichas para valuation monetário (T\$) via Malmuth-Harville ou Monte Carlo.
2. **$f_2$ (Projeção Temporal):** Integra o FGS e as transições de Markov com o relógio de torneio ($t-3$).
3. **$f_3$ (Política Comportamental):** Modela desvios populacionais e o Fator $\Psi$ via Equilíbrio Quantal (AQRE).
4. **$f_4$ (Absorção Estocástica):** Barreira absorvente de ruína com valor de continuação condicional à sobrevivência.
5. **$f_5$ (Funcional PMev):** Síntese fechada com matriz de covariância propagada $\Sigma_y \approx J_{\text{global}} \Sigma_x J_{\text{global}}^\top$.

### Estabilidade do Jacobiano e Contração
Para que a cadeia seja estável e não amplifique artificialmente a incerteza, mede-se o raio espectral da redistribuição de soma zero ($P = I - \frac{1}{n}\mathbf{1}\mathbf{1}^\top$):

$$\rho_\perp = \rho\left(P \, J_{f_4} J_{f_3} J_{f_2} \, P\right)$$

Na parametrização neutra, $\rho_\perp = 1$ (identidade). No default calibrado, $\rho_\perp \approx 0{,}45$, confirmando que a redistribuição contrai a variância entre os participantes.

---

## 4. O Ledger Mestre das 12 Hipóteses Falsificáveis ($H_1$ a $H_{12}$)

O framework rejeita alegações dogmáticas: cada tese central é formalizada como hipótese falsificável vinculada a um critério estrito e a um módulo de verificação:

| Hipótese | Enunciado | Baseline | Critério de Falsificação | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **$H_1$** | Superioridade Preditiva OOS | $\text{PMev-0}$ / $\text{FGS}$ | $\mathbb{E}[\mathcal{L}_{\text{PMev-D}}^{\text{OOS}}] \ge \mathbb{E}[\mathcal{L}_{\text{ICM}}^{\text{OOS}}]$ | sem evidência |
| **$H_2$** | Mediação do Resíduo de Kim | Modelo Kim (2025) | $\beta_{\text{stack}}$ não atenua com $\mathbf{Z}_{\text{PMev}}$ ($p > 0{,}05$) | sem evidência |
| **$H_3$** | Erosão Temporal ($t-3$) | Solver estático | $\Delta Q(\text{open}) \le 0$ na iminência dos blinds | sem evidência |
| **$H_4$** | Subversão de MDF no River | $\text{MDF} = \frac{P}{P+B}$ | Defesa empírica converge para MDF tradicional | sem evidência |
| **$H_5$** | Amortização de Edge por Stack | Edge Constante | $\Delta \text{ROI}(10\text{bb}) \approx \Delta \text{ROI}(100\text{bb})$ | sem evidência |
| **$H_6$** | Exploitabilidade via AQRE | Nash Inexplorável | Política AQRE apresenta regret superior | sem evidência |
| **$H_7$** | Opcionalidade do SPR $\Omega(s)$ | $\Omega(s) \equiv 0$ | $\Omega(s) \le 0$ para $S_{\text{eff}} \ge 40\text{bb}$ | sem evidência |
| **$H_8$** | Downward Drift de Sizings | Árvores ChipEV | Frequência de apostas $\ge 50\%$ inalterada | transcrita, em validação |
| **$H_9$** | Conservação em Late Reg | Valor Nulo | $\sum \Delta V_i + B_{\text{entry}} \neq 0$ | sem evidência |
| **$H_{10}$** | Pacto Silencioso em FT | ChipEV | Frequência de 3-bet CL vs Vice inalterada | sem evidência |
| **$H_{11}$** | Insolvência de Pot Odds | Decisão Linear | Decisões puras por Odds têm desempenho idêntico | sem evidência |
| **$H_{12}$** | Parcimônia Paramétrica | $\text{PMev-0}$ / $\text{PMev-D}$ | $\text{BIC}(\text{PMev-F}) > \text{BIC}(\text{PMev-D})$ | sem evidência |

---

## 5. Conclusão Soberana

A Teoria da Perspectiva não é uma anomalia a ser eliminada, mas a física fundamental dos tomadores de decisão humanos. O Operador Soberano utiliza a blindagem analítica do solver para governar seu próprio risco e a modelagem comportamental para explorar a inércia e o pânico do adversário.
`;

export default function TeoriaPerspectivaPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright">
			<ContentPageHeader
				title="Teoria da Perspectiva & PMev"
				subtitle="A fundamentação científica de Kahneman & Tversky e o arcabouço formal de 6 camadas da Perspectiva Matemática."
				category="Psicologia Econômica"
				icon="fa-brain"
			/>

			<div className="sota-container py-12 md:py-24">
				<SectionHeader
					step="01"
					label="Fundamentação & Arcabouço"
					title="O Algoritmo da Decisão sob Pressão"
					description="Como o cérebro processa risco e recompensa e a formalização matemática da PMev em 6 camadas."
				/>
				<div className="max-w-5xl mx-auto mb-16">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>

				<SectionHeader
					step="02"
					label="Simulador de Range"
					title="Matriz de Perspectiva (PMev 3.2 vs. DeepSolver GTO)"
					description="Explore o impacto do stack depth, bubble factor e tempo de órbita na modulação dos ranges pré-flop 13x13."
				/>
				<div className="max-w-5xl mx-auto">
					<PmevRangeViewer />
				</div>
			</div>

			<ContentFooter
				shareTitle={`Teoria da Perspectiva & PMev | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.TEORIA_PERSPECTIVA}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
