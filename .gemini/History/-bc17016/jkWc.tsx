'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './masterpiece.module.css';

// --- DATA STORE (O Cortex Analítico) ---
const DATABASE = [
    {
        id: "paradoxo",
        title: "O Paradoxo do Valuation",
        env: "Estrutura Padrão (Mid vs Big)",
        icon: "⚖️",
        verdict: { label: "Agressão Estrangulada", class: "text-rose-400 border-rose-500/30" },
        ip: { pos: "BTN", stack: "40 bb", rp: 21.4, morph: "Inelástico (Valor Estrito)" },
        oop: { pos: "BB (CL)", stack: "55 bb", rp: 12.9, morph: "Defensivo Condensado" },
        theory: `
            <h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Instinto Traído pela Matemática</h3>
            <p class="text-slate-300 leading-relaxed mb-4 text-[15px]">O senso comum dita que o BTN com 40bb possui conforto suficiente para oprimir a mesa. Contudo, o HRC revela o pesadelo: o "RP de ida" do BTN é quase o dobro do "RP de volta" do BB.</p>
            <p class="text-slate-300 leading-relaxed mb-6 text-[15px]"><strong>Porquê?</strong> O BB sobrevive a um <em>all-in</em>. Já o BTN, se errar um <em>hero-bluff</em>, é aniquilado para o pó absoluto, perdendo instantaneamente o <em>laddering</em> contra todos os <em>shorts</em> da mesa. A capacidade do BTN de blefar é <strong>estrangulada</strong> pela necessidade da Esperança Matemática.</p>
        `,
        exploit: `
            <h3 class="text-indigo-400 font-bold text-xl mb-4 tracking-tight">A Falsa Liberdade</h3>
            <p class="text-slate-300 leading-relaxed mb-5 text-[15px]">Se você é o BTN, a sua "Desvantagem de Risco" é a sua algema. Tentar usar força bruta contra a única stack capaz de o eliminar é rasgar <em>EV</em>.</p>
            <ul class="space-y-4">
                <li class="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span class="text-indigo-500 text-lg mt-0.5"><i class="fa-solid fa-lock"></i></span>
                    <div>
                        <strong class="text-white block mb-1">Puxar o Freio de Mão</strong>
                        <span class="text-sm text-slate-400">Contraia severamente os seus bluffs. Aceite que a equidade natural exigida para engajar num pote deste calibre é altíssima.</span>
                    </div>
                </li>
            </ul>
        `,
        quiz: {
            q: "Por que o BTN (40bb), tendo uma stack gigante, sofre uma punição utilitária (RP) muito maior que o BB (55bb)?",
            opts: [
                { isCorrect: true, text: "Porque perder o all-in destrói o BTN, retirando sua alavancagem e garantias de payjump. O BB, porém, sobrevive ao golpe." },
                { isCorrect: false, text: "Porque estar em posição (IP) gera uma penalidade padrão no solver para compensar a realização de equidade pós-flop." },
                { isCorrect: false, text: "A premissa está errada. O BTN tem um RP menor porque ele domina o range do BB." }
            ],
            exp: "A Assimetria de Dor: O BTN põe em risco a sua sobrevivência. O BB arrisca apenas a liderança."
        }
    },
    {
        id: "pacto",
        title: "O Pacto Silencioso",
        env: "Colisão de Gigantes",
        icon: "🤝",
        verdict: { label: "Evitação de Ruína", class: "text-indigo-400 border-indigo-500/30" },
        ip: { pos: "Vice CL", stack: "65 bb", rp: 24.5, morph: "Linear Especulativo" },
        oop: { pos: "CL", stack: "70 bb", rp: 23.5, morph: "Flat Call Massivo" },
        theory: `
            <h3 class="text-white font-bold text-xl mb-4 tracking-tight">A Mútua Destruição Assegurada</h3>
            <p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Dois gigantes colidem. É essencial notar que esta dinâmica ocorre <strong>quase estritamente entre os dois CLs ou duas stacks grandes e similares</strong>. A destruição mútua é o pior cenário possível. As fichas perdidas viram <em>payjumps</em> grátis aos inativos.</p>
            <p class="text-slate-300 leading-relaxed mb-6 text-[15px]">Ocorre um <strong>Pacto Silencioso</strong>. A agressão letal (3-bet) colapsa. Os <em>ranges</em> de <em>flat call</em> inflam absurdamente, incluindo o topo. O objetivo é avaliar <em>implied odds</em> no pós-flop sem o risco de um suicídio pré-flop.</p>
        `,
        exploit: `
            <h3 class="text-indigo-400 font-bold text-xl mb-4 tracking-tight">Punindo o Ego Alheio</h3>
            <p class="text-slate-300 leading-relaxed mb-5 text-[15px]">O GTO dita passividade. Contudo, se o seu adversário sente que deve "mandar na mesa" e opta por inflacionar o pote pré-flop com mãos marginais, ele comete um erro de ICM letal.</p>
            <ul class="space-y-4">
                <li class="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span class="text-indigo-500 text-lg mt-0.5"><i class="fa-solid fa-shield-cat"></i></span>
                    <div>
                        <strong class="text-white block mb-1">Negação de Ação Barata</strong>
                        <span class="text-sm text-slate-400">Jogue impiedosamente polarizado. Negue a ele o showdown pacífico pós-agressão. Se for para o chão, vá com o topo.</span>
                    </div>
                </li>
            </ul>
        `,
        quiz: {
            q: "Como as frequências reconfiguram o jogo pré-flop num 'Pacto Silencioso'?",
            opts: [
                { isCorrect: true, text: "A 3-bet encolhe a um mínimo polarizado, e o flat call infla massivamente para especular sem explodir o SPR." },
                { isCorrect: false, text: "Eles entram em modo push/fold agressivo para submeter psicologicamente a mesa." },
                { isCorrect: false, text: "Eles foldam quase 100% das mãos um contra o outro." }
            ],
            exp: "O choque direto aniquila a Esperança Matemática. Transfere-se a decisão para o pós-flop onde o risco inicial é menor."
        }
    },
    {
        id: "batata",
        title: "O Efeito Batata Quente",
        env: "A Dinâmica do Shove",
        icon: "🔥",
        verdict: { label: "Transferência de Fardo", class: "text-amber-400 border-amber-500/30" },
        ip: { pos: "UTG (Shove)", stack: "25 bb", rp: 15.0, morph: "Polar Máximo" },
        oop: { pos: "BB (Call)", stack: "20 bb", rp: 19.5, morph: "Bluffcatcher Rígido" },
        theory: `
            <h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Peso de Agir Primeiro</h3>
            <p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Quando o UTG faz um <em>open-shove</em> direto, ele altera organicamente a utilidade da mão. Ele atirou a "Batata Quente" do ICM para o colo da mesa.</p>
            <p class="text-slate-300 leading-relaxed mb-6 text-[15px]">O agressor não só impõe o seu Risk Premium, como acopla a ele a <strong>Fold Equity</strong>. O BB já não tem como "devolver" essa pressão (re-shovar). Com um <em>range</em> defensivo condensado, o BB atinge o seu limite de dor e é forçado a um <em>overfold</em> drástico.</p>
        `,
        exploit: `
            <h3 class="text-indigo-400 font-bold text-xl mb-4 tracking-tight">Abusar da Paralisia</h3>
            <p class="text-slate-300 leading-relaxed mb-5 text-[15px]">Se você é o Agressor, a arma primária é entender que o "Efeito Batata Quente" impede que stacks médios reajam com a cadência exigida pelo ChipEV.</p>
            <ul class="space-y-4">
                <li class="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span class="text-indigo-500 text-lg mt-0.5"><i class="fa-solid fa-fire-flame-curved"></i></span>
                    <div>
                        <strong class="text-white block mb-1">Expandir Zonas de Shove</strong>
                        <span class="text-sm text-slate-400">Contra adversários aterrorizados pela bolha, alargue os shoves (aumente o Alpha) nos spots onde a transferência da pressão é letal para eles.</span>
                    </div>
                </li>
            </ul>
        `,
        quiz: {
            q: "O que caracteriza o 'Efeito Batata Quente' na aplicação de um shove em ICM?",
            opts: [
                { isCorrect: true, text: "O agressor impõe o seu RP somado à Fold Equity, removendo do defensor a capacidade de reagir e forçando a dor letal de um call definitivo." },
                { isCorrect: false, text: "É a situação em que os blinds rodam muito rápido na mesa, forçando a ação." },
                { isCorrect: false, text: "Ocorre quando o pote sofre re-shoves múltiplos, ignorando as odds." }
            ],
            exp: "O agressor transfere a totalidade do fardo da decisão para o oponente, negando a realização de equidade pós-flop."
        }
    },
    {
        id: "agonia",
        title: "Agonia do Bluffcatcher",
        env: "Teto do MDF (Condensado vs Polar)",
        icon: "💔",
        verdict: { label: "MDF Quebrado", class: "text-sky-400 border-sky-500/30" },
        ip: { pos: "CL (Pot Bet)", stack: "80 bb", rp: 4.5, morph: "Polar Extremado" },
        oop: { pos: "Mid (Call)", stack: "30 bb", rp: 22.0, morph: "Condensado Sangrante" },
        theory: `
            <h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Colapso do MDF</h3>
            <p class="text-slate-300 leading-relaxed mb-4 text-[15px]">A ilusão do MDF (Minimum Defense Frequency) morre aqui. O CL faz uma aposta Pot-Size. O Mid-stack tem um <em>bluffcatcher</em> puro. Em ChipEV, defenderia metade das vezes.</p>
            <p class="text-slate-300 leading-relaxed mb-6 text-[15px]">No ICM, um range estritamente condensado contra um range polar com <strong>Vantagem de Risco</strong> gera dissipação de equidade absurda. A pressão de 22% obriga o Mid a "quebrar" a matemática e foldar mãos médias mecanicamente (Teto do RP).</p>
        `,
        exploit: `
            <h3 class="text-indigo-400 font-bold text-xl mb-4 tracking-tight">O Massacre Pós-Flop</h3>
            <p class="text-slate-300 leading-relaxed mb-5 text-[15px]">O solver não só autoriza, como exige que o CL abuse dessa falha estrutural do range defensivo.</p>
            <ul class="space-y-4">
                <li class="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span class="text-indigo-500 text-lg mt-0.5"><i class="fa-solid fa-skull"></i></span>
                    <div>
                        <strong class="text-white block mb-1">Overbluff Sistemático</strong>
                        <span class="text-sm text-slate-400">Sabendo que o <em>bluffcatcher</em> não suporta o peso financeiro da eliminação contínua nas streets, expanda os bluffs e aplique <em>triple barrels</em> levianos.</span>
                    </div>
                </li>
            </ul>
        `,
        quiz: {
            q: "Por que o jogador com alto RP não consegue defender a sua porção de MDF teórica num post-flop contra o CL?",
            opts: [
                { isCorrect: true, text: "Porque um range condensado (mãos médias) não consegue reter equidade suficiente ao longo das streets para cobrir o altíssimo custo (RP) de eliminação." },
                { isCorrect: false, text: "Porque os bluffcatchers perdem equidade bruta nas mesas finais." },
                { isCorrect: false, text: "Porque o agressor sempre terá a melhor mão no longo prazo em dinâmicas de ICM." }
            ],
            exp: "A relação de recompensa não fecha. A dor financeira suplanta largamente o lucro teórico de apanhar o blefe."
        }
    },
    {
        id: "lama",
        title: "Guerra na Lama",
        env: "Micro vs Micro (Escada)",
        icon: "⚔️",
        verdict: { label: "Fome de Laddering", class: "text-emerald-400 border-emerald-500/30" },
        ip: { pos: "Micro", stack: "12 bb", rp: 8.5, morph: "Push Estendido" },
        oop: { pos: "Micro", stack: "10 bb", rp: 7.5, morph: "Call Seletivo" },
        theory: `
            <h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Minitorneio de Sobrevivência</h3>
            <p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Com gigantes monopolizando as fichas, os <em>shorts</em> jogam na lama. A probabilidade matemática de qualquer um deles cravar o torneio é nula.</p>
            <p class="text-slate-300 leading-relaxed mb-6 text-[15px]">O instinto grita "ChipEV puro!". Falso. A abundância de outros shorts eleva drasticamente o <strong>EV do Fold</strong>. Cruzar os braços garante <em>laddering</em> à medida que os outros caem. A sobrevida passiva vale dólares, exigindo um prêmio de risco moderado (~8%) para justificar a abdicação dessa garantia.</p>
        `,
        exploit: `
            <h3 class="text-indigo-400 font-bold text-xl mb-4 tracking-tight">Quebrando a Paralisia</h3>
            <p class="text-slate-300 leading-relaxed mb-5 text-[15px]">Muitos amadores entram em "paralisia de ICM", foldando mãos sólidas à espera de saltos de premiação.</p>
            <ul class="space-y-4">
                <li class="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span class="text-indigo-500 text-lg mt-0.5"><i class="fa-solid fa-angles-up"></i></span>
                    <div>
                        <strong class="text-white block mb-1">Aumente a Variância</strong>
                        <span class="text-sm text-slate-400">Se o vilão sofre de aversão cega ao risco para garantir um payjump (overfold), a matemática exige que você roube os blinds para construir uma base para o pódio real.</span>
                    </div>
                </li>
            </ul>
        `,
        quiz: {
            q: "Por que o Risk Premium entre dois micro-stacks não desce para o zero absoluto (ChipEV)?",
            opts: [
                { isCorrect: true, text: "Porque o EV de não fazer nada (fold) é positivo. A chance de 'laddering' garantida pela morte alheia requer que a sua agressão compense essa diferença financeira." },
                { isCorrect: false, text: "Porque os líderes forçam uma bolha secundária que dobra o RP de toda a mesa." },
                { isCorrect: false, text: "Micro-stacks não sofrem ICM, o RP é sempre nulo. A afirmação é inválida." }
            ],
            exp: "Cada vizinho à beira da morte é um payjump virtual garantido no seu bolso. Renunciar a esse assento seguro exige um prémio matemático."
        }
    },
    {
        id: "ameaca",
        title: "A Ameaça Orgânica",
        env: "Dominância Absoluta (God Mode)",
        icon: "👑",
        verdict: { label: "Criação de Monstros", class: "text-fuchsia-400 border-fuchsia-500/30" },
        ip: { pos: "God Mode (CL)", stack: "90 bb", rp: 12.0, morph: "Polar Controlado" },
        oop: { pos: "Vice", stack: "25 bb", rp: 21.0, morph: "Inelástico Defensivo" },
        theory: `
            <h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Limite do God Mode</h3>
            <p class="text-slate-300 leading-relaxed mb-4 text-[15px]">O CL (90bb) ataca o Vice (25bb). O CL é imune à eliminação; a teoria linear diria que ele tem RP 0% e pode esmagar o *board*.</p>
            <p class="text-slate-300 leading-relaxed mb-6 text-[15px]">Mas o torneio é orgânico. A <strong>Elasticidade do Bubble Factor</strong> intervém. Se o CL aplicar <em>hero-bluffs</em> arrogantes e dobrar o Vice, este salta para 50bb+. <strong>O CL acaba de armar o único rival capaz de usurpar o seu império.</strong> O solver impõe ~12% de RP à liderança, blindando o jogador contra o erro de criar o próprio carrasco.</p>
        `,
        exploit: `
            <h3 class="text-indigo-400 font-bold text-xl mb-4 tracking-tight">Abater o Inelástico</h3>
            <p class="text-slate-300 leading-relaxed mb-5 text-[15px]">O Vice (OOP) sofre uma pressão letal de 21%. O seu range de reação deveria ser cirúrgico. Se ele for um jogador *inelástico* que não entende o perigo...</p>
            <ul class="space-y-4">
                <li class="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span class="text-indigo-500 text-lg mt-0.5"><i class="fa-solid fa-ban"></i></span>
                    <div>
                        <strong class="text-white block mb-1">Morte da Fold Equity</strong>
                        <span class="text-sm text-slate-400">Expurgue os overbluffs. A fold equity não atua sobre quem joga puramente pelas cartas ignorando a morte. Mude a marcha inteiramente para Thin Value.</span>
                    </div>
                </li>
            </ul>
        `,
        quiz: {
            q: "Sendo imune à eliminação direta, por que o Chip Leader colossal sofre uma punição utilitária considerável contra o 2º classificado?",
            opts: [
                { isCorrect: true, text: "Para defender a Hegemonia. Dobrar o Vice cria uma ameaça orgânica à liderança, mudando o balanço de poder da mesa inteira." },
                { isCorrect: false, text: "Porque o HRC impõe que stacks acima de 80bb tenham taxação de risco extra para simular o rake." },
                { isCorrect: false, text: "Para evitar collusion explícito na plataforma." }
            ],
            exp: "O ICM não dita apenas a morte, dita a 'Esperança Matemática' global de chegar à vitória. Dobrar o seu maior rival destrói ativamente a sua maior vantagem no jogo."
        }
    },
    {
        id: "chipev",
        title: "O Vácuo Matemático",
        env: "Sem Payjumps (ChipEV Puro)",
        icon: "⚙️",
        verdict: { label: "MDF Perfeito", class: "text-slate-400 border-slate-500/30" },
        ip: { pos: "Qualquer IP", stack: "100 bb", rp: 0.0, morph: "Polar Perfeito" },
        oop: { pos: "Qualquer OOP", stack: "100 bb", rp: 0.0, morph: "Defesa Base" },
        theory: `
            <h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Equilíbrio Linear</h3>
            <p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Início de torneio ou Cash Game. Não há ICM. A utilidade das fichas é estritamente linear: 1 ficha vale 1 ficha.</p>
            <p class="text-slate-300 leading-relaxed mb-6 text-[15px]">O Nash Equilibrium atua como um relógio suíço. Contra uma aposta do tamanho do pote, o <strong>Alpha</strong> dita exatos 33.3% de bluffs. O <strong>MDF</strong> repousa em perfeitos 50.0%. A matemática não sofre deformações emocionais ou utilitárias.</p>
        `,
        exploit: `
            <h3 class="text-indigo-400 font-bold text-xl mb-4 tracking-tight">O Jogo Mecânico</h3>
            <p class="text-slate-300 leading-relaxed mb-5 text-[15px]">Sem a proteção (ou o freio) das bolhas de prémios, a exploração baseia-se em punir desvios de frequência estritos.</p>
            <ul class="space-y-4">
                <li class="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <span class="text-indigo-500 text-lg mt-0.5"><i class="fa-solid fa-bullseye"></i></span>
                    <div>
                        <strong class="text-white block mb-1">Punição Imediata</strong>
                        <span class="text-sm text-slate-400">Se o oponente folda acima dos 50%, overbluff imprime dinheiro. Se ele paga mais do que deve, limite os bluffs a 0 e expanda as apostas de valor thin. A punição é direta.</span>
                    </div>
                </li>
            </ul>
        `,
        quiz: {
            q: "Por que num vácuo matemático (ChipEV) o desvio da frequência de bluff (Alpha) é punido imediatamente por um GTO perfeito?",
            opts: [
                { isCorrect: true, text: "Porque sem a âncora letal do ICM a forçar o 'overfold', a defesa pagará exatamente conforme as pot odds. Blefar além cede EV automático." },
                { isCorrect: false, text: "Porque o GTO sempre descobre as nossas cartas com base em padrões de sizes." },
                { isCorrect: false, text: "Porque a agressão em ChipEV só é rentável com underbets." }
            ],
            exp: "Sem a dor assimétrica de um torneio, as odds matemáticas governam absolutas. Tudo o que fuja da linha é capturado pela mecânica do Defensor."
        }
    }
];

// --- LOGIC & HELPERS ---
function solveNashDynamics(ip_rp: number, oop_rp: number) {
    let defense = 50.0 - (oop_rp * 1.4) + (ip_rp * 0.3);
    let bluff = 33.3 + (oop_rp * 1.1) - (ip_rp * 0.8);
    defense = Math.max(0, Math.min(100, defense));
    bluff = Math.max(0, Math.min(100, bluff));
    if (ip_rp === 0 && oop_rp === 0) { bluff = 33.3; defense = 50.0; }
    return { bluff, defense };
}

// Componente para interpolar números graciosamente (React-way)
function AnimatedNumber({ value, formatStr = "%", duration = 800, precision = 1 }: { value: number, formatStr?: string, duration?: number, precision?: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let startTimestamp: number | null = null;
        let startValue = display;
        let animationFrame: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplay(startValue + (value - startValue) * ease);
            if (progress < 1) animationFrame = window.requestAnimationFrame(step);
            else setDisplay(value);
        };
        animationFrame = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(animationFrame);
    }, [value]);
    return <>{display.toFixed(precision)}{formatStr}</>;
}

// --- MAIN COMPONENT ---
export default function RiskGeometryMasterclass() {
    const [currentId, setCurrentId] = useState(DATABASE[0].id);
    const [activeTab, setActiveTab] = useState('theory');
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const [quizOptions, setQuizOptions] = useState<any[]>([]);

    const currentData = useMemo(() => DATABASE.find(s => s.id === currentId)!, [currentId]);
    const { bluff, defense } = useMemo(() => solveNashDynamics(currentData.ip.rp, currentData.oop.rp), [currentData]);

    useEffect(() => {
        // Shuffle quiz options on scenario change
        const opts = [...currentData.quiz.opts];
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        setQuizOptions(opts);
        setQuizAnswered(false);
        setSelectedOpt(null);
    }, [currentData]);

    return (
        <div className="min-h-screen pb-20 pt-10 font-inter selection:bg-indigo-500/30">
            {/* Axiom Ticker */}
            <div className={`${styles.tickerWrap} fixed top-0 left-0 z-50`}>
                <div className={styles.ticker}>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> A responsabilidade na FT é realizar o EV monetário, não provar coragem.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> A diferença de RP entre jogadores é a sua Vantagem ou Desvantagem de Risco.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> O pós-flop no ICM foca-se em extração cirúrgica sem pulverizar alavancagem.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> Acumular fichas nunca é negativo, o problema é arriscá-las sem recompensa.</span>
                </div>
            </div>

            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 mt-16 px-4 md:px-8">
                <header className="text-center pt-4 mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <div className={`w-2 h-2 rounded-full bg-indigo-400 ${styles.pulseGlow}`}></div>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Motor de Inferência Ativo</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-3">
                        A Geometria do <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-500 drop-shadow-md">Risco</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">Masterclass de Teoria dos Jogos | Arquitetura V48</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT MENU */}
                    <aside className="lg:col-span-4 flex flex-col gap-6">
                        <div className={`${styles.glassPanel} p-6 max-h-[850px] flex flex-col`}>
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Matrizes Clínicas</h2>
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-bold">{DATABASE.length} Cenários</span>
                            </div>
                            <div className="space-y-3 overflow-y-auto pr-2 pb-4" style={{ maxHeight: '650px' }}>
                                {DATABASE.map(sc => {
                                    const isActive = sc.id === currentId;
                                    return (
                                        <button key={sc.id} onClick={() => setCurrentId(sc.id)} className={`${styles.scenarioBtn} ${isActive ? styles.active : ''}`}>
                                            <div className={`${styles.iconBox} shadow-md`}>{sc.icon}</div>
                                            <div className="flex flex-col pr-2 z-10 w-full text-left">
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{sc.env}</span>
                                                <span className="text-[13px] font-bold text-white tracking-wide">{sc.title}</span>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-slate-600 opacity-50 text-xs ml-auto"></i>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT STAGE */}
                    <main className="lg:col-span-8 flex flex-col gap-6">
                        {/* THE STAGE */}
                        <div className={`${styles.glassPanel} p-8 md:p-10 relative`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>

                            <div className="flex justify-between items-start border-b border-slate-800 pb-6 mb-8 relative z-10">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-md uppercase tracking-widest border border-slate-700/50">{currentData.env}</span>
                                    <h2 className={`text-3xl md:text-4xl font-black text-white mt-4 tracking-tight ${styles.gradientText}`}>{currentData.title}</h2>
                                </div>
                                <div className="text-right hidden sm:flex flex-col items-end">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Veredito do Solver</span>
                                    <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all duration-500 bg-slate-900 ${currentData.verdict.class}`}>
                                        {currentData.verdict.label}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 md:px-12 relative z-10">
                                {/* Agressor (IP) */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="text-center mb-4">
                                        <span className="text-[11px] font-black text-sky-400 uppercase tracking-widest block mb-2">Agressor (Ida)</span>
                                        <span className="text-2xl font-black text-white block mb-1">{currentData.ip.pos}</span>
                                        <span className={`${styles.dataMono} text-sm text-slate-400 font-medium bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800`}>{currentData.ip.stack}</span>
                                    </div>
                                    <div className="relative w-28 h-28 md:w-36 md:h-36">
                                        <svg viewBox="0 0 36 36" className={styles.circularChart}>
                                            <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className={`${styles.circle} ${styles.sky}`} style={{ strokeDasharray: `${Math.min(100, (currentData.ip.rp / 26) * 100)}, 100` }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`${styles.dataMono} text-2xl md:text-3xl font-black text-white`}><AnimatedNumber value={currentData.ip.rp} /></span>
                                            <span className="text-[8px] md:text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-1">R. Premium</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Morfologia de Range</p>
                                        <span className="text-xs font-bold text-sky-300 bg-sky-950/30 px-3 py-1.5 rounded-lg border border-sky-500/20 block">{currentData.ip.morph}</span>
                                    </div>
                                </div>

                                {/* VS */}
                                <div className="flex-shrink-0 px-4 md:px-6 flex flex-col items-center">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 font-black italic text-lg md:text-xl shadow-lg">VS</div>
                                    <div className="w-[1px] h-20 md:h-24 bg-gradient-to-b from-slate-700 to-transparent mt-4"></div>
                                </div>

                                {/* Defensor (OOP) */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="text-center mb-4">
                                        <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest block mb-2">Defensor (Volta)</span>
                                        <span className="text-2xl font-black text-white block mb-1">{currentData.oop.pos}</span>
                                        <span className={`${styles.dataMono} text-sm text-slate-400 font-medium bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800`}>{currentData.oop.stack}</span>
                                    </div>
                                    <div className="relative w-28 h-28 md:w-36 md:h-36">
                                        <svg viewBox="0 0 36 36" className={styles.circularChart}>
                                            <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className={`${styles.circle} ${styles.rose}`} style={{ strokeDasharray: `${Math.min(100, (currentData.oop.rp / 26) * 100)}, 100` }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`${styles.dataMono} text-2xl md:text-3xl font-black text-white`}><AnimatedNumber value={currentData.oop.rp} /></span>
                                            <span className="text-[8px] md:text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-1">R. Premium</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Morfologia de Range</p>
                                        <span className="text-xs font-bold text-rose-300 bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-500/20 block">{currentData.oop.morph}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DYNAMIC FREQUENCIES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`${styles.glassPanel} p-6 border-t-4 border-t-sky-500 hover:border-t-sky-400 transition-colors`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Teto de Agressão</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Frequência Ótima de Bluff</p>
                                    </div>
                                    <span className={`${styles.dataMono} text-xs font-bold px-2 py-1 rounded border ${(bluff - 33.3) > 0 ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : ((bluff - 33.3) < 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'bg-slate-800 border-slate-700 text-slate-400')}`}>
                                        {bluff - 33.3 > 0 ? '+' : ''}{(bluff - 33.3).toFixed(1)}% vs cEV
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className={`${styles.dataMono} text-5xl font-black text-white tracking-tighter`}><AnimatedNumber value={bluff} /></span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4 shadow-inner">
                                        <div className={`h-full bg-sky-500 ${styles.barTransition}`} style={{ width: `${bluff}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.glassPanel} p-6 border-t-4 border-t-rose-500 hover:border-t-rose-400 transition-colors`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ponto de Ruptura</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Limiar de Indiferença (Call)</p>
                                    </div>
                                    <span className={`${styles.dataMono} text-xs font-bold px-2 py-1 rounded border ${(defense - 50.0) > 0 ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : ((defense - 50.0) < 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'bg-slate-800 border-slate-700 text-slate-400')}`}>
                                        {defense - 50.0 > 0 ? '+' : ''}{(defense - 50.0).toFixed(1)}% vs cEV
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className={`${styles.dataMono} text-5xl font-black text-white tracking-tighter`}><AnimatedNumber value={defense} /></span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4 shadow-inner">
                                        <div className={`h-full bg-rose-500 ${styles.barTransition}`} style={{ width: `${defense}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* INTERACTIVE PANELS */}
                        <div className={`${styles.glassPanel} flex flex-col min-h-[400px]`}>
                            <div className={`flex border-b border-slate-800 overflow-x-auto ${styles.hideScroll}`}>
                                {[
                                    { id: 'theory', icon: 'fa-book-open', label: 'Fundamento Teórico', target: 'theory' },
                                    { id: 'dilution', icon: 'fa-water', label: 'Diluição SPR', target: 'dilution' },
                                    { id: 'exploit', icon: 'fa-crosshairs', label: 'Vetor de Exploit', target: 'exploit' },
                                    { id: 'quiz', icon: 'fa-brain', label: 'Prova Analítica', target: 'quiz' }
                                ].map(tab => (
                                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} data-target={tab.target} className={`${styles.actionTab} ${activeTab === tab.id ? styles.active : ''}`}>
                                        <i className={`fa-solid ${tab.icon} mr-2 opacity-70`}></i> {tab.label}
                                    </div>
                                ))}
                            </div>

                            <div className={`p-8 ${styles.animateFadeUp}`} key={activeTab + currentId}>
                                {activeTab === 'theory' && <div className="space-y-4" dangerouslySetInnerHTML={{ __html: currentData.theory }} />}
                                {activeTab === 'exploit' && <div className="space-y-4" dangerouslySetInnerHTML={{ __html: currentData.exploit }} />}

                                {activeTab === 'dilution' && (
                                    <div>
                                        <h3 className="text-white font-bold text-xl mb-2 tracking-tight">O Motor de Diluição (Elasticidade Pós-Flop)</h3>
                                        <p className="text-slate-400 text-[14px] leading-relaxed mb-8">O maior erro na análise de ICM é aplicar o Risk Premium do Pré-Flop (All-in Direto) nas <em>streets</em> subsequentes. À medida que o pote cresce e a sua stack remanescente diminui, o <strong>Custo Utilitário</strong> altera-se. A aversão ao risco cai porque você já está financeiramente comprometido na mão.</p>

                                        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl relative">
                                            <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-6 absolute top-4 left-6">Vazamento de Risk Premium (Defensor)</h4>

                                            <div className={`${styles.pipeline} mt-4`}>
                                                {[
                                                    { label: 'PRE', val: currentData.oop.rp, active: true, o: '' },
                                                    { label: 'FLOP', val: Math.max(0, currentData.oop.rp * 0.7), active: false, o: 'opacity-70' },
                                                    { label: 'TURN', val: Math.max(0, currentData.oop.rp * 0.4), active: false, o: 'opacity-50' },
                                                    { label: 'RIVER', val: Math.max(0, currentData.oop.rp * 0.15), active: false, o: 'opacity-30' },
                                                ].map(node => (
                                                    <div key={node.label} className={`${styles.pipelineNode} ${node.active ? styles.active : ''}`}>
                                                        <span className={`text-xs font-bold ${node.active ? 'text-slate-300' : 'text-slate-500'} mb-1`}>{node.label}</span>
                                                        <span className={`${styles.dataMono} text-xs font-black text-rose-400 ${node.o}`}><AnimatedNumber value={node.val} /></span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium text-center italic mt-6 border-t border-slate-800 pt-4">
                                                "Ao chegar no river com SPR menor que 1, a matemática força o jogador a reverter grande parte da sua decisão para ChipEV clássico."
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'quiz' && (
                                    <div>
                                        <p className="text-slate-200 font-medium text-lg leading-relaxed mb-6">{currentData.quiz.q}</p>
                                        <div className="space-y-4">
                                            {quizOptions.map((opt, idx) => {
                                                const isSelected = selectedOpt === idx;
                                                const showSuccess = quizAnswered && opt.isCorrect;
                                                const showFail = quizAnswered && isSelected && !opt.isCorrect;
                                                const isDisabled = quizAnswered && !isSelected && !opt.isCorrect;

                                                let stateClass = '';
                                                if (showSuccess) stateClass = 'correct';
                                                else if (showFail) stateClass = 'wrong';
                                                else if (isDisabled) stateClass = 'disabled';

                                                return (
                                                    <div key={idx} onClick={() => { if (!quizAnswered) { setSelectedOpt(idx); setQuizAnswered(true); } }}
                                                        className={`${styles.quizOption} ${stateClass ? styles[stateClass] : ''}`}
                                                    >
                                                        <div className={`w-6 h-6 shrink-0 rounded border border-slate-600 flex items-center justify-center mt-0.5 ${styles.iconBox} text-xs bg-slate-900 shadow-inner`}>
                                                            {showSuccess && <i className="fa-solid fa-check text-emerald-400"></i>}
                                                            {showFail && <i className="fa-solid fa-xmark text-rose-400"></i>}
                                                        </div>
                                                        <span className="text-slate-300 text-[15px] font-medium leading-relaxed">{opt.text}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {quizAnswered && (
                                            <div className={`mt-8 bg-indigo-950/40 border border-indigo-500/30 p-6 rounded-xl relative overflow-hidden ${styles.animateFadeUp}`}>
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                                <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-3">Auditoria Lógica</h4>
                                                <p className="text-slate-300 text-[15px] leading-relaxed">{currentData.quiz.exp}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>

                <footer className="text-center pb-12 pt-8 flex flex-col items-center">
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mb-6"></div>
                    <div className={styles.signatureText}>Raphael Vitoi</div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Architecture & Theory</p>
                </footer>
            </div>
        </div>
    );
}