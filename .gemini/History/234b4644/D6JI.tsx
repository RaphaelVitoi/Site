import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Guia Definitivo: Motor ICM | Raphael Vitoi',
    description: 'Aprenda a dominar o Simulador Mestre de ICM e entender o Risk Premium no Poker de alta pressão.',
};

export default function ManualIcmPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 py-12 px-6 sm:px-12 font-sans selection:bg-indigo-500/30">
            <div className="max-w-3xl mx-auto">

                {/* Navegação de Retorno */}
                <div className="mb-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-xs font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 hover:bg-indigo-900/40"
                    >
                        <i className="fa-solid fa-arrow-left"></i> Voltar ao Simulador
                    </Link>
                </div>

                {/* Conteúdo (Prose Invertido) */}
                <article className="prose prose-invert prose-indigo lg:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-400 prose-strong:text-slate-200">

                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 text-4xl sm:text-5xl">
                        🧭 Guia Definitivo: Como Dominar o Motor ICM
                    </h1>

                    <blockquote className="border-l-4 border-indigo-500 bg-indigo-950/10 p-6 rounded-r-lg text-lg text-slate-400 italic mb-10 shadow-inner">
                        "O poker é uma ciência de informação incompleta jogada por humanos falhos. Acreditamos dominar a matemática, mas frequentemente somos traídos por aplicar a equação certa no universo errado."
                        <span className="block mt-2 text-sm text-indigo-400 font-semibold not-italic">— Raphael Vitoi</span>
                    </blockquote>

                    <p className="text-lg leading-relaxed mb-10">
                        Bem-vindo ao <strong>Motor ICM</strong>. Este não é um simples visualizador de tabelas pré-flop. É um laboratório imersivo de Teoria dos Jogos desenhado para destruir a sua intuição baseada em ChipEV (Cash Game) e reconstruí-la para o ambiente de alta pressão dos Torneios (Mesa Final, Bolha e Retas Finais).
                    </p>

                    <hr className="border-slate-800 my-10" />

                    <h2 className="text-2xl text-white mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-microscope text-indigo-500"></i> 1. A Filosofia da Ferramenta
                    </h2>
                    <p>
                        Em fases agudas de torneios, 1 ficha ganha <strong>nunca</strong> tem o mesmo valor de 1 ficha perdida. O Motor ICM materializa essa dor financeira invisível através de duas métricas absolutas:
                    </p>
                    <ul className="space-y-3 mb-10">
                        <li>
                            <strong className="text-rose-400">Bubble Factor (BF):</strong> O multiplicador da dor. Se o seu BF é 1.5, significa que você arrisca $1.50 para ganhar $1.00.
                        </li>
                        <li>
                            <strong className="text-emerald-400">Risk Premium (RP):</strong> A tradução do BF em equidade. É a "taxa extra" de vitória matemática que você precisa ter para justificar colocar o seu torneio em risco.
                        </li>
                    </ul>
                    <p className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg text-sm text-center font-medium">
                        Seu objetivo no simulador é entender quem possui a <strong className="text-emerald-400">Vantagem de Risco (Predador)</strong> e quem sofre a <strong className="text-rose-400">Desvantagem de Risco (Presa)</strong>.
                    </p>

                    <hr className="border-slate-800 my-10" />

                    <h2 className="text-2xl text-white mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-layer-group text-indigo-500"></i> 2. Navegando pela Interface
                    </h2>

                    <h3 className="text-xl text-slate-200 mt-8 mb-4">🎭 O Seletor de Cenários Clínicos</h3>
                    <p>No menu lateral, você encontrará nossos laboratórios isolados. Eles provam como a teoria "quebra" na prática:</p>
                    <ol className="space-y-2 mb-8 marker:text-indigo-500 marker:font-bold">
                        <li><strong>O Paradoxo do Valuation:</strong> Aprenda por que o agressor com stack confortável (BTN) tem sua agressão estrangulada contra o BB que o cobre.</li>
                        <li><strong>O Pacto Silencioso:</strong> Entenda como dois gigantes (CLs) paralisam a agressão pré-flop (evitação mútua de ruína).</li>
                        <li><strong>O Efeito Batata Quente:</strong> Veja como a <em>Fold Equity</em> de um Shove transfere toda a dor do ICM para a defesa.</li>
                        <li><strong>A Ameaça Orgânica (God Mode):</strong> Descubra por que o CL isolado não pode ser agressivo 100% das vezes contra o Vice.</li>
                    </ol>

                    <h3 className="text-xl text-slate-200 mt-8 mb-4">📊 Painel de Teoria & Ranges (13x13)</h3>
                    <p>Dentro do cenário ativo, desça até o painel inferior e explore as abas:</p>
                    <ul className="space-y-2 mb-10">
                        <li><strong>Fundamento:</strong> A teoria por trás daquele spot específico.</li>
                        <li>
                            <strong>Ranges (13x13):</strong> O colapso visual do Poker. Note como as células mudam de cor conforme a pressão:
                            <ul className="mt-2 space-y-1">
                                <li><span className="inline-block w-3 h-3 bg-emerald-500 rounded-sm mr-2"></span> <strong>Core (Verde):</strong> Call/Shove obrigatório.</li>
                                <li><span className="inline-block w-3 h-3 bg-indigo-500 rounded-sm mr-2"></span> <strong>Bluff/Float (Índigo):</strong> Bloqueadores e agressão tática.</li>
                                <li><span className="inline-block w-3 h-3 bg-rose-500 rounded-sm mr-2"></span> <strong>Death Zone (Vermelho):</strong> Suicídio financeiro (Fold forçado).</li>
                            </ul>
                            <em className="text-xs text-slate-400 block mt-2">*Dica: Você pode clicar nas células para forçar estados e testar a sua própria estratégia.</em>
                        </li>
                        <li><strong>Bubble Factor:</strong> Visualize as barras de "Custo vs Recompensa" de cada jogador.</li>
                    </ul>

                    <hr className="border-slate-800 my-10" />

                    <h2 className="text-2xl text-white mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-robot text-indigo-500"></i> 3. Circuito AI (O Seu Coach Particular)
                    </h2>
                    <p>Se você não entendeu um cálculo ou a lógica de uma mão, clique na aba superior <strong>Oráculo AI</strong>. Nosso assistente compreende exatamente o cenário na sua tela.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 not-prose">
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <div className="text-[#a855f7] font-bold uppercase text-xs tracking-wider mb-2"><i className="fa-solid fa-crystal-ball mr-2"></i> Oráculo AI</div>
                            <p className="text-sm text-slate-400">Responde de forma direta, analítica e matemática sobre o ICM do spot.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <div className="text-[#fb7185] font-bold uppercase text-xs tracking-wider mb-2"><i className="fa-solid fa-mask mr-2"></i> Vilão</div>
                            <p className="text-sm text-slate-400">Simula provocações e pensamentos do seu oponente na mesa.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <div className="text-[#34d399] font-bold uppercase text-xs tracking-wider mb-2"><i className="fa-solid fa-cards mr-2"></i> Simulador</div>
                            <p className="text-sm text-slate-400">O "Dealer" cria um board aleatório e explica a textura vs Risk Premium.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <div className="text-[#0ea5e9] font-bold uppercase text-xs tracking-wider mb-2"><i className="fa-solid fa-brain mr-2"></i> Psicólogo</div>
                            <p className="text-sm text-slate-400">Analisa pelo custo mental, diagnosticando fadiga e risco de Tilt na Death Zone.</p>
                        </div>
                    </div>

                    <hr className="border-slate-800 my-10" />

                    <h2 className="text-2xl text-white mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-rocket text-indigo-500"></i> 4. Passo a Passo do Estudo Diário
                    </h2>
                    <p>Para integrar o simulador na sua rotina (Protocolo Smart Sniper), siga este ciclo:</p>
                    <ol className="space-y-3 mb-10 marker:text-indigo-500 marker:font-bold">
                        <li><strong>Identifique a Fraqueza:</strong> Sofreu numa reta final no domingo? Abra o simulador na segunda-feira.</li>
                        <li><strong>Isole o Spot:</strong> Escolha o Cenário que mais se assemelha ao que você viveu.</li>
                        <li><strong>Estude a Dor:</strong> Abra a aba de Bubble Factor. Quem estava pagando mais caro para jogar aquela mão?</li>
                        <li><strong>Valide o Range:</strong> Vá na matriz 13x13. A sua mão era Core ou você cometeu suicídio pagando na Death Zone?</li>
                        <li><strong>Teste-se:</strong> Vá na aba Quiz. Se errar, invoque o Oráculo AI para mastigar o conceito para você.</li>
                    </ol>

                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-xl relative overflow-hidden mt-12">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <h4 className="text-emerald-400 font-black tracking-widest uppercase text-xs mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-lightbulb"></i> Dica de Mestre
                        </h4>
                        <p className="text-slate-300 font-medium text-sm m-0 italic">
                            "Não decore as cores da matriz de forma robótica. Entenda a gravidade da mesa. A responsabilidade na FT é realizar o EV financeiro da sua stack, não provar coragem contra o Chip Leader."
                        </p>
                    </div>

                </article>
            </div>
        </div>
    );
}