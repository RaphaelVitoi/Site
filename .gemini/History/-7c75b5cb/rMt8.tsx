import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import ShareButtons from '@/components/content/ShareButtons';
import Link from 'next/link';

export const metadata = {
    title: 'Teoria da Perspectiva Matemática | Poker Racional',
    description: 'O framework definitivo SOTA v3.2: Expectativa, Perspectiva, Esperança e a mecânica oculta do ICM Pós-Flop.',
};

const markdownContent = String.raw`
> **Síntese:** Um framework de alta resolução que desloca a análise do Poker de um modelo de "estado" estático ($ICM_{ev}$) para uma análise de "fluxo" dinâmica, integrando Teoria dos Sistemas, Lógica Bayesiana e Psicologia.

---

## 1. O Ponto de Partida: Risk Premium vs. Bubble Factor

Antes de mergulhar na Perspectiva, é essencial calibrar as réguas de medição de pressão do torneio. É fundamental distinguir entre **Ruído de Simulação** (comum em modelos simplificados como GTO Wizard pós-flop) e a **Influência Real do ICM**. No SOTA v3.2, calibramos o motor contra os 93 nodes do HRC para garantir que os desvios observados sejam fruto da matemática de colisão, e não de imprecisões algorítmicas (e-Nash).

*   **Bubble Factor (BF):** A razão matemática entre o que se PERDE em ICM equity ao perder um pote vs o que se GANHA ao vencê-lo ($BF = Loss / Gain$). O BF cresce assintoticamente (ex: 1.27x, 2.5x, 15x), o que obscurece a percepção da magnitude real da pressão.
*   **Risk Premium (RP):** É a equity adicional, acima das pot odds puras, necessária para justificar um call. O motor SOTA adota o RP como padrão pois ele opera em uma **escala percentual intuitiva** (0% a 60%).
*   **A Relação:** $RP = \frac{100 \times (BF - 1)}{BF}$

*Por que usar $\Delta RP$ (Risk Advantage)?* Subtrair RPs (Ida - Volta) gera um delta percentual linear que dita diretamente a proporção de agressividade permitida em um cenário. O BF não permite essa extração de forma natural.

---

## 2. A Hierarquia Cognitiva da Decisão (Paradigma VITOI)

A falha fundamental do ensino convencional é tratar o $ICM_{ev}$ isolado como a resposta final. A tomada de decisão de elite não é plana; ela evolui em camadas contínuas:

### Camada 1: O Axioma do EV do Fold e o $ICM_{ev}$ Estático
A premissa comercial de que "foldar tem EV zero" é uma simplificação que oculta o custo de oportunidade. O fold é uma transação de capital.
*   **ChipEV:** $EV_{fold} = -antes$. O piso é negativo. Para uma ação ser coerente, ela não precisa ter EV positivo, basta superar o abismo do fold.
*   **O Paradoxo do ICM:** Em bolhas ou payjumps, o $EV_{fold}$ pode ser **Positivo** ("passar a vez" gera valor passivo). No pós-flop, o **Pot Entrapment** torna o $EV_{fold}$ violentamente negativo (desistir do pote custa exponencialmente mais em valuation do que o risco residual). O $ICM_{ev}$ calcula isso como um "snapshot" (como se o torneio acabasse na mão atual).

### Camada 2: Expectativa Matemática
Não é "qual o EV deste pote", mas "dentro do meu referencial estrutural (payouts, stacks da mesa), qual é a expectativa matematicamente fundamentada para esta ação?". É o referencial decisório projetado sobre o *Future Game Simulation* (FGS) e a **Antevisão** (ex: o salto iminente de blinds em $t-3$ degrada a utilidade do seu stack, alterando a urgência da Expectativa).

### Camada 3: Perspectiva Matemática
A distribuição de probabilidade sobre os outcomes possíveis (1º, 2º, ... Nº) dado o estado **dinâmico** da mesa. Minha Perspectiva aumenta quando a dos outros cai. É uma função contínua, não um snapshot estático.

### Camada 4: Esperança Matemática
O ganho esperado em Perspectiva de uma ação específica.
$$Esperança = [P(win) \times \Delta Perspectiva_{ganho}] + [P(lose) \times \Delta Perspectiva_{perda}]$$
**A decisão ótima é aquela que maximiza a Esperança, não o ICM EV do pote isolado.**

---

## 3. Dinâmica Oculta: A Extensão do ICM EV Puro

O framework de Perspectiva/Esperança explica fenômenos que o ICM clássico não consegue justificar:

**1. O Paradoxo do Chip Leader (Economia de Perspectiva vs Fichas):**
O ICM puro dita que fichas perdidas valem mais que fichas ganhas, sugerindo passividade ao CL. A realidade: o CL é hiperagressivo. Por quê? **O CL não briga por fichas, briga por perspectiva matemática.** Ele aposta para negar a perspectiva alheia. Agressividade mantém os mid-stacks sob o limiar de ameaça.

**2. O Fator $\Psi$ (A Taxa de Maluquice Humana):**
Se a probabilidade de o oponente ter nuts é de 4%, mas a taxa estatística de *"Bobagem Humana"* (tilt, erro cognitivo) no spot é de 10%, a Esperança Matemática exige o call, ignorando o conservadorismo GTO.

**3. O Veneno das RIO e a Falácia das Pot Odds:**
Pot Odds são uma heurística engessada de finanças básicas. Elas mascaram as **Reverse Implied Odds (RIO)**. Pagar pelas odds atrai a especulação, prendendo o jogador a um passivo estrutural onde ele acerta a mão marginal e perde um pote gigantesco. Na Perspectiva, um $EV_{fold}$ negativo é superior a um investimento barato insolvente.

---

## 4. Conceitos Originais: O Motor SOTA (Raphael Vitoi)

Estes axiomas compõem a física do motor SOTA v3.2:

*   **O Teto do RP (24%):** O limite mecânico de defesa. O OOP não defende pelo MDF clássico, mas até onde o RP permite. Acima de 24%, ocorre a "Impotência Teórica" — o OOP mantém o *fold estrutural* máximo mesmo se o IP expandir blefes infinitamente.
*   **Vantagem de Risco (Risk Advantage):** Subtração de $RP_{ida} - RP_{volta}$. A agressividade permitida é quase a proporção exata dessa métrica.
*   **Especulação Assimétrica:** Mid-stacks entram no pote por *implied odds* de ICM, não pot odds. Investem pouco, absorvem pressão, e se acertam, a Expectativa explode. O inverso de "tighten up".
*   **Fold Estrutural:** Foldar 75% contra o CL não é "overfold" (vício de linguagem do ChipEV). É o equilíbrio GTO estrutural sob ICM extremo.
*   **Inversão de Extremos:** Quando a Vantagem de Risco é imensa, o ICM torna-se **MAIS agressivo** que o ChipEV, rompendo o teto de bluff do solver clássico.
*   **Efeito Irradiação:** Um micro-stack não precisa jogar uma mão para alterar o Nash de todos. Sua existência altera as funções de utilidade. A variável sobrevivência suplanta a equidade das cartas.
*   **Donk Bet "Ataque Defensivo":** O ICM algema o IP (forçando check-backs). O OOP cria um "ataque defensivo" liderando pequeno (10%) para proteger a equidade, pois o IP não pode punir com raise sem violar seu próprio incentivo ICM.
*   **Faixas Ponderadas:** O RP é uma abstração, não um número fixo. O motor SOTA emite distribuições com centro de gravidade (matemática pura) e limites de abstração (edge humana, histórico). *"Honesto é melhor que falso-preciso."*

---

## 5. Atribuição Fundamental: O Downward Drift

O conceito de **Downward Drift** — a heurística de que sob pressão ICM as ações migram um degrau para baixo na escala de agressividade (grandes apostas viram médias, pequenas viram checks) — é atribuído à literatura de **Dara O'Kearney & Barry Carter**.

**A Contribuição Vitoi (SOTA):** A formalização e quantificação do mecanismo qualitativo de O'Kearney em uma equação de coeficientes dinâmicos baseada em dissipação de RP por street e calibração matricial (Opção B do Motor SOTA).
`;

export default function TeoriaICMPage () {
    const wordCount = markdownContent.split( /\s+/ ).length;
    const readTime = Math.max( 1, Math.ceil( wordCount / 200 ) );

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-50 py-20 px-6">
            <article className="max-w-4xl mx-auto relative">

                {/* Botao Voltar */ }
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 hover:text-indigo-400 transition-colors uppercase mb-12">
                    <i className="fa-solid fa-arrow-left"></i> Voltar ao Início
                </Link>

                {/* Header do Documento */ }
                <header className="mb-14 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded border border-emerald-500/20 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                            { ' ' }Documentação SOTA v3.2
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            <i className="fa-regular fa-clock"></i> { readTime } min de leitura
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-indigo-400 mb-6 leading-tight">
                        Teoria da Perspectiva Matemática
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed border-l-2 border-indigo-500/30 pl-4">A arquitetura algorítmica e conceitual do motor de decisões SOTA v3.2.</p>
                </header>

                {/* Corpo do Documento */ }
                <div className="p-8 md:p-12 bg-[#0a0f1d] border border-slate-800/80 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] prose prose-invert prose-slate prose-lg max-w-none prose-headings:text-slate-100 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-hr:border-slate-800/80 relative z-10">
                    <MarkdownRenderer content={ markdownContent } />
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800/80 flex justify-between items-center relative z-10">
                    <ShareButtons title="Teoria da Perspectiva Matemática (Paradigma VITOI)" url={ `https://pokerracional.com/aulas/leitura-icm` } />
                </div>

                {/* Glow de Fundo */ }
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </article>
        </main>
    );
}
