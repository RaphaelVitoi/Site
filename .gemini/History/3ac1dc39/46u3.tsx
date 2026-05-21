import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import ShareButtons from '@/components/content/ShareButtons';
import Link from 'next/link';

export const metadata = {
    title: 'Entendendo o ICM e suas heurísticas | Poker Racional',
    description: 'Aprofundamento em Risk Premium, Downward Drift e a Perspectiva Matemática de Raphael Vitoi.',
};

const markdownContent = String.raw`
> Aprenda como interpretar o RP e de que maneira podemos usá-lo a nosso favor pós-flop através da Perspectiva Matemática.

Nesta aula magistral, Raphael Vitoi desintegra os modelos convencionais de ICM para revelar a física oculta do jogo pós-flop. Através da união entre Teoria dos Sistemas, Psicologia e Matemática de Colisão, exploramos como o **Risk Premium (RP)** não é apenas uma taxa de sobrevivência, mas um vetor dinâmico que dita a agressão e a abstenção de lucro.

## Antevisão e a Nova Fronteira do Edge

O conhecimento teórico de Poker hoje é uma commodity. Tabelas de push/fold e solvers pré-flop estão disseminados. A verdadeira vantagem competitiva (Edge) migrou para o **ICM Pós-Flop** e para a capacidade de **Antevisão**.

**Antevisão** é a habilidade de projetar o fluxo sistêmico do torneio antes mesmo das cartas serem distribuídas. Isso envolve integrar variáveis que os solvers tradicionais ignoram:
*   **Erosão Antecipada ($t-3$):** Como o salto iminente de blinds degrada o valor do seu fold presente.
*   **Vizinhança Estratégica:** O impacto do perfil psicológico e da stack dos jogadores à sua esquerda (especialmente o BB e o BTN).
*   **Antipoiese do Sistema:** O torneio como um organismo que se auto-organiza em torno das colisões.

## O Axioma do EV do Fold ($EV_{fold} \neq 0$)

A falha fundamental do ensino convencional é tratar o fold como custo zero. Na Perspectiva Matemática de Vitoi, o fold é uma transação:
1.  **Em ChipEV:** $EV_{fold} = -Antes$. Abrir uma mão com EV de -0.05bb é matematicamente superior a aceitar a erosão passiva de -0.125bb.
2.  **Em ICM:** O $EV_{fold}$ torna-se dinâmico. Em situações de bolha ou payjumps iminentes, o fold pode ter **EV Positivo**, pois "passar a vez" potencializa a probabilidade de ganhar um prêmio maior sem risco de colisão.

## Risk Premium: Ida, Volta e o Teto da Impotência

O RP é a "taxa de pedágio" para entrar em um pote. Mas ele é assimétrico:
*   **RP de Ida:** A pressão que o agressor exerce.
*   **RP de Volta:** A barreira defensiva do oponente.

### O Teto do Risk Premium (24%)
Uma descoberta heurística de Vitoi: Acima de 24% de RP, a **MDF (Minimum Defense Frequency)** do defensor colapsa. Ele entra em estado de **Impotência Teorica**, onde o agressor pode blefar com frequência excessiva e o fold ainda assim permanece como a decisão ótima.

---

## TOY GAMES: Visualizando a Distorção de Ranges

Utilizamos Toy Games (modelos simplificados) para isolar o efeito do RP na árvore de decisões.

### Fase I: Agressão Posicional (IP vs OOP)

**Cenário Base (ChipEV):** O pote é 100, a aposta é 100. OOP checka sempre com KK. IP ataca com AA (valor) ou QQ/JJ (blefe).
![Range IP (Toy Game 1 - Chip EV)](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image1.png)
*OOP deve pagar 50% para neutralizar blefes.*

**Toy Game 5 (RP IP 3% vs OOP 24%):**
![Toy Game 5 - O Colapso da MDF](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image6.png)
*Com o OOP atingindo o teto de 24%, o IP expande blefes massivamente. O defensor é forçado a um overfold sistêmico para proteger seu valuation.*

### Fase II: Inversão de Risco e a Armadilha das Pot Odds

Quando o agressor (IP) possui o maior risco (ex: CL agredindo outro Big Stack), a dinâmica muda drasticamente.
![Inversão de RP 21% vs 3%](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image17.png)
*Mesmo com Pot Odds atraentes, o defensor com baixo RP folda 80% das vezes. Por quê? Para manter o oponente sob pressão de ICM, evitando "dar vida" a quem o sistema já condenou.*

## A Amortização da Edge e o Colapso da Árvore

A Edge não é constante; ela é condicionada às **ferramentas disponíveis**.
*   **Deep Stacks (100bb):** Árvore fractal, alta oportunidade de erro ($O_e$). A Edge é soberana.
*   **Short Stacks (10bb):** Árvore podada para escolhas binárias (Push/Fold). A Edge sofre amortização pela variância e pelo showdown equity do oponente.

**O Erro do Chipleader:** Pagar um shove de 10bb marginal na bolha não é apenas um erro matemático; é um erro de **Antipoiese**. Ao dobrar o Short, você devolve a ele as ferramentas de edge que a stack curta havia retirado, degradando sua própria dominância futura na mesa.

## Conclusão: O Coeficiente de Insolvência ($C_i$)

As Pot Odds são uma métrica de baixa resolução. Na Perspectiva Matemática, usamos o $C_i$:
$$C_i = \frac{Perspectiva}{Pot\_Odds}$$
Se $C_i < 1$, as pot odds são mentirosas. Elas te incentivam a entrar em um pote cujas **Reverse Implied Odds (RIO)** e pressões de ICM tornam o investimento insolvente no longo prazo.

---
### Setup do Experimento (Aula 1.2)
*   **BTN (38bb) vs BB (53bb)**
*   **Risk Advantage: +8.5% favor BTN**
*   **Downward Drift:** Observamos a migração massiva de sizings grandes para **Small Sizings (B20/B33)** no ICMev, visando manter a pressão sem expor o valuation à variância desnecessária.
`;

export default function EntendendoIcmPage () {
    const wordCount = markdownContent.split( /\s+/ ).length;
    const readTime = Math.max( 1, Math.ceil( wordCount / 200 ) );

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-50 py-20 px-6">
            <article className="max-w-4xl mx-auto relative">

                <Link href="/biblioteca" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 hover:text-indigo-400 transition-colors uppercase mb-12">
                    <i className="fa-solid fa-arrow-left"></i> Voltar para o Acervo
                </Link>

                <header className="mb-14 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-3 py-1.5 rounded border border-indigo-500/20">
                            <i className="fa-solid fa-book-journal-whills mr-1.5"></i> biblioteca
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            <i className="fa-regular fa-clock"></i> { readTime } min de leitura
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-indigo-400 mb-6 leading-tight">
                        Entendendo o ICM e suas heurísticas
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed border-l-2 border-indigo-500/30 pl-4">A Perspectiva Matemática: Risk Premium, Amortização de Edge e Downward Drift.</p>
                </header>

                <div className="p-8 md:p-12 bg-[#0a0f1d] border border-slate-800/80 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] prose prose-invert prose-slate prose-lg max-w-none prose-headings:text-slate-100 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-img:rounded-xl prose-img:border prose-img:border-slate-800 prose-hr:border-slate-800/80 relative z-10">
                    <MarkdownRenderer content={ markdownContent } />
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800/80 flex justify-between items-center relative z-10">
                    <ShareButtons title="Entendendo o ICM e suas heurísticas" url={ `https://pokerracional.com/biblioteca/entendendo-o-icm-e-suas-heuristicas` } />
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </article>
        </main>
    );
}
