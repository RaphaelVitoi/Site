import Link from 'next/link';

export const metadata = {
    title: 'A Matemática do Vies: Prospect Theory e Monte Carlo ICM | Raphael Vitoi',
    description: 'Aplicações da Teoria de Kahneman & Tversky e Algoritmos Estocásticos O(N) no Poker Moderno.',
};

export default function ProspectTheoryArticle() {
    return (
        <div className="min-h-screen bg-bg-base text-text-main pb-24">
            <header className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto animate-fade-up">
                <div className="font-mono text-[0.7rem] font-bold text-accent-indigo uppercase tracking-[0.15em] mb-6">
                    Whitepaper Científico • Fundamentação Teórica
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-text-bright mb-6 font-heading tracking-tight leading-tight">
                    A Teoria da Perspectiva no Poker:<br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-indigo to-accent-emerald">
                        O Fim da Linearidade do Expected Value
                    </span>
                </h1>
                <p className="text-lg text-text-muted font-body leading-relaxed max-w-2xl mx-auto">
                    A integração dos algoritmos de Monte Carlo e do Prêmio Nobel de Economia (Kahneman & Tversky) no Paradigma VITOI de ICM Pós-Flop.
                </p>
            </header>

            <div className="max-w-4xl mx-auto px-6">
                <div className="glass-panel p-8 md:p-12 prose prose-invert prose-lg max-w-none font-body">

                    <h2 className="text-2xl font-bold text-text-bright font-heading mb-6 border-b border-white/10 pb-4">
                        1. O Paradoxo do Expected Value (EV)
                    </h2>
                    <p>
                        A fundação matemática do poker moderno assume que os jogadores são &quot;maximizadores racionais de utilidade&quot;. Se uma jogada tem um Expected Value (EV) de +$10, o software assume que ela deve ser tomada.
                    </p>
                    <p>
                        No entanto, a <strong>Prospect Theory (Teoria da Perspectiva)</strong>, desenvolvida por Daniel Kahneman e Amos Tversky (Prêmio Nobel em 2002), provou que o cérebro humano não processa risco de forma linear. A dor de perder $1.000 é matematicamente <strong>2.25x mais intensa</strong> do que a alegria de ganhar $1.000.
                    </p>

                    <div className="bg-accent-amber/5 border-l-4 border-accent-amber p-8 my-10 rounded-r-2xl">
                        <h4 className="mt-0 text-accent-amber-light font-bold text-lg mb-4 font-heading">A Value Function (Curva de Utilidade)</h4>
                        <p className="text-text-main leading-relaxed m-0 text-sm">
                            A Teoria da Perspectiva introduz a Função de Valor: ganhos são côncavos (sensibilidade decrescente) e perdas são convexas (aversão à perda severa). No Laboratório VITOI, aplicamos o multiplicador $\lambda$ (Lambda) para simular o estado psicológico real do jogador sob pressão.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-text-bright font-heading mt-12 mb-6 border-b border-white/10 pb-4">
                        2. O Reference Point e a Mente do Jogador
                    </h2>
                    <p>
                        O cálculo estéril de EV ignora o <strong>Status de Referência</strong> do jogador. O simulador SOTA introduziu 4 estados psicológicos baseados na literatura comportamental open source:
                    </p>
                    <ul>
                        <li><strong>Baseline:</strong> O jogador está focado na matemática. Aversão à perda padrão ($\lambda \approx 2.25$).</li>
                        <li><strong>Tilt / Chasing Losses:</strong> Quando o jogador está &quot;stuck&quot; (perdendo), ele busca o risco para recuperar o prejuízo. O EV marginal decai ($\lambda \approx 1.5$, $\beta \approx 0.95$).</li>
                        <li><strong>Protecting Win:</strong> Quando o jogador dobra o stack, ele se torna hiper-conservador para proteger o ganho ($\lambda \approx 3.0$).</li>
                        <li><strong>Bubble Survival:</strong> Na bolha, o valor da ficha perdida é astronômico e paralisa a ação agressiva ($\lambda \approx 4.5$).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-text-bright font-heading mt-12 mb-6 border-b border-white/10 pb-4">
                        3. O Desafio Computacional: A Explosão do Malmuth-Harville
                    </h2>
                    <p>
                        O modelo Independent Chip Model (ICM) padrão utiliza o algoritmo de Malmuth-Harville, que é $O(N!)$ na sua forma nativa e $O(2^N)$ em sua forma de programação dinâmica. Isso significa que, para mais de 10 jogadores, os navegadores web e solvers tradicionais &quot;travam&quot;.
                    </p>
                    <p>
                        Para dar densidade ao nosso motor e permitir a leitura do ecossistema de Multi-Table Tournaments (MTTs), integramos uma aproximação estocástica inspirada em repositórios Open Source de alta performance (como <code>poker-mtt-icm</code> e <code>poker-apprentice</code>).
                    </p>

                    <h3 className="text-xl font-bold text-text-bright font-heading mt-8 mb-4">
                        A Solução: Algoritmo ICM de Monte Carlo
                    </h3>
                    <p>
                        Em vez de calcular todas as permutações possíveis da mesa final (explosão combinatória), o motor SOTA VITOI faz um &quot;Random Walk&quot; em $O(N)$.
                        Simulamos milhares de torneios, sorteando o vencedor com base no peso das fichas (Stack / TotalChips). Removemos o vencedor, recalculamos as proporções e sorteamos o segundo colocado. Ao tirar a média de 20.000 iterações (via Random Walk com Bitmask tracking), alcançamos a Equidade Real com erro insignificante em tempo sub-milisegundo.
                    </p>

                    <div className="bg-black/50 border border-white/10 p-6 rounded-lg font-mono text-sm text-emerald-400 my-8">
                        { `// Fallback Estocástico VITOI
if (n > 10) {
    return calculateIcmMonteCarlo(stacks, prizes, { iterations: 20000 });
}`}
                    </div>

                    <h2 className="text-2xl font-bold text-text-bright font-heading mt-12 mb-6 border-b border-white/10 pb-4">
                        4. Conclusão: A Síntese da Teoria
                    </h2>
                    <p>
                        Solvers de poker mostram o caminho GTO (Game Theory Optimal), mas o GTO assume que você e o oponente são robôs sem aversão a risco e com memória de cálculo infinita.
                    </p>
                    <p>
                        Ao fundir a <strong>Prospect Theory</strong> (para mapear o desvio psicológico humano) e os <strong>Algoritmos de Monte Carlo</strong> (para escalar a física do ICM para além da bolha da mesa final), o Paradigma VITOI não é apenas um estudo abstrato; é um mapa da realidade das mesas.
                    </p>

                    <div className="flex justify-center mt-16">
                        <Link href="/simulador" className="btn-primary pulse-glow px-12 py-5 text-sm font-black tracking-widest uppercase rounded-2xl">
                            Testar a Matemática no Laboratório <i className="fa-solid fa-flask ml-2" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
