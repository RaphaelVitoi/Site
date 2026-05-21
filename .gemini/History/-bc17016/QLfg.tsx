'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './masterpiece.module.css';
import SettingsModal from './SettingsModal'; // Ajuste o path caso mova o arquivo
import { useAIPreferences } from '@/store/ai-preferences'; // Ajuste o path caso mova o arquivo

// --- DATA STORE (O Cortex Analítico) ---
const INITIAL_DATABASE = [
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

const PAYOUTS = [
    { pos: "1º Lugar", val: "$355,000" },
    { pos: "2º Lugar", val: "$279,000" },
    { pos: "3º Lugar", val: "$219,000" },
    { pos: "4º Lugar", val: "$171,000" },
    { pos: "5º Lugar", val: "$134,000" },
    { pos: "6º Lugar", val: "$105,000" },
    { pos: "7º Lugar", val: "$83,000" },
    { pos: "8º Lugar", val: "$65,000" },
    { pos: "9º Lugar", val: "$51,000" }
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

// Transcodificador de PCM para WAV (Para o TTS da API)
function pcmToWav(base64: string, sampleRate: number = 24000) {
    const binary_string = window.atob(base64);
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) { bytes[i] = binary_string.charCodeAt(i); }
    const pcmBuffer = bytes.buffer;
    const blockAlign = 2; const byteRate = sampleRate * blockAlign; const dataSize = pcmBuffer.byteLength;
    const buffer = new ArrayBuffer(44 + dataSize); const view = new DataView(buffer);
    const writeString = (v: DataView, o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true); writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    new Uint8Array(buffer, 44).set(new Uint8Array(pcmBuffer));
    return new Blob([buffer], { type: 'audio/wav' });
}

// --- MAIN COMPONENT ---
export default function RiskGeometryMasterclass() {
    const [scenarios, setScenarios] = useState<any[]>(INITIAL_DATABASE);
    const [currentId, setCurrentId] = useState(INITIAL_DATABASE[0].id);
    const [activeTab, setActiveTab] = useState('theory');
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const [quizOptions, setQuizOptions] = useState<any[]>([]);

    // --- AI State ---
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [chatMode, setChatMode] = useState<'coach' | 'villain' | 'simulator'>('coach');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiChatHistory, setAiChatHistory] = useState<{ speaker: string, text: string, type: 'user' | 'ai' | 'system', imageBase64?: string }[]>([
        { speaker: 'Oráculo AI ✨', text: 'A interface neural está pronta. O que deseja dissecar sobre este cenário?', type: 'ai' }
    ]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const [isNarrating, setIsNarrating] = useState<'theory' | 'exploit' | null>(null);
    const [isScenarioGenOpen, setIsScenarioGenOpen] = useState(false);
    const [scenarioPrompt, setScenarioPrompt] = useState('');
    const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

    const aiPrefs = useAIPreferences();
    const currentData = useMemo(() => scenarios.find(s => s.id === currentId) || scenarios[0], [currentId, scenarios]);
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

    const changeChatMode = (mode: 'coach' | 'villain' | 'simulator') => {
        setChatMode(mode);
        let welcomeMsg = "";
        let defaultPrompt = "";

        if (mode === 'villain') {
            welcomeMsg = "🎭 Modo RPG Ativado: O Vilão sentou-se à mesa. Mande uma mensagem para iniciar o 'trash talk' ou testá-lo.";
            defaultPrompt = "Senta-te na mesa. O que tens a dizer sobre a nossa situação de ICM?";
        } else if (mode === 'simulator') {
            welcomeMsg = "🌪️ Simulador Pós-Flop Ativado: O Dealer vai criar uma board e a ação do Vilão sob pressão de ICM.";
            defaultPrompt = "Dá as cartas. Cria uma textura de Flop e diz-me a ação do vilão.";
        } else {
            welcomeMsg = "Consultoria ICM Dinâmica restabelecida. Como posso ajudar?";
            defaultPrompt = "";
        }

        setAiChatHistory(prev => [...prev, { speaker: 'Sistema ⚙️', text: welcomeMsg, type: 'system' }]);
        setAiPrompt(defaultPrompt);
    };

    const handleAskAI = async (overridePrompt?: string) => {
        const promptText = overridePrompt || aiPrompt;
        if (!promptText.trim()) return;

        const newHistory = [...aiChatHistory, { speaker: 'Você', text: promptText, type: 'user' as const }];
        setAiChatHistory(newHistory);
        setAiPrompt('');
        setIsAiLoading(true);

        try {
            let systemInstruction = `Você é Raphael Vitoi, especialista em ICM e Teoria dos Jogos. Contexto: O cenário atual é "${currentData.title}". Agressor tem RP de ${currentData.ip.rp}% e Defensor tem RP de ${currentData.oop.rp}%. Responda de forma analítica e incisiva em português de Portugal.`;

            if (chatMode === 'villain') {
                systemInstruction = `Você é o adversário (o Vilão) neste cenário de poker. Assuma uma persona característica. Use as stacks e a pressão do ICM para provocar o Herói, fazer 'trash talk' ou sugerir um pacto silencioso. Responda APENAS como o Vilão, em português de Portugal. Seja conciso (1 parágrafo). Cenário: ${currentData.title}. Herói: ${currentData.ip.stack} (RP: ${currentData.ip.rp}%). Vilão: ${currentData.oop.stack} (RP: ${currentData.oop.rp}%). Dinâmica: ${currentData.theory.replace(/<[^>]*>?/gm, '')}`;
            } else if (chatMode === 'simulator') {
                systemInstruction = `Você é um simulador (Dealer/Coach) de cenários de poker para treino de ICM. Baseado no cenário atual, gere dinamicamente uma textura de Flop (cartas), defina uma ação plausível do Vilão (ex: aposta, check ou shova), e pergunte ao Herói o que ele faz. Avalie o EV. Responda em português de Portugal. Cenário: ${currentData.title}. Herói: ${currentData.ip.stack} (RP: ${currentData.ip.rp}%). Vilão: ${currentData.oop.stack} (RP: ${currentData.oop.rp}%). Dinâmica: ${currentData.theory.replace(/<[^>]*>?/gm, '')}`;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptText,
                    systemInstruction,
                    provider: aiPrefs.textProvider,
                    customApiKey: aiPrefs.customApiKey,
                    customBaseUrl: aiPrefs.customBaseUrl,
                    customModelName: aiPrefs.customModelName
                })
            });

            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.error || 'Erro na resposta do provedor.');

            let aiName = 'Oráculo AI ✨';
            if (chatMode === 'villain') aiName = 'O Vilão 🎭';
            if (chatMode === 'simulator') aiName = 'Dealer 🌪️';

            setAiChatHistory([...newHistory, { speaker: aiName, text: data.text, type: 'ai' }]);
        } catch (err: any) {
            setAiChatHistory([...newHistory, { speaker: 'Sistema ⚠️', text: err.message || 'Erro na conexão neural. Verifique suas configurações BYOK.', type: 'system' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleGenerateAvatar = async () => {
        const promptText = aiPrompt.trim();
        if (!promptText) {
            setAiChatHistory(prev => [...prev, { speaker: 'Sistema ⚠️', text: 'Por favor, descreva o vilão na caixa de texto abaixo antes de clicar em Gerar Vilão. (Exemplo: "Um jogador agressivo com óculos escuros.")', type: 'system' }]);
            return;
        }

        const newHistory = [...aiChatHistory, { speaker: 'Você', text: `🎨 Gerar retrato do vilão: ${promptText}`, type: 'user' as const }];
        setAiChatHistory(newHistory);
        setAiPrompt('');
        setIsAiLoading(true);

        try {
            const response = await fetch('/api/imagen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText })
            });

            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.error || 'Erro na resposta do provedor de imagens.');

            setAiChatHistory([...newHistory, { speaker: 'Oráculo AI ✨', text: 'O perfil psicológico e visual do teu adversário foi criado com sucesso. Eis o aspeto da ameaça:', type: 'ai', imageBase64: data.base64 }]);
        } catch (err: any) {
            setAiChatHistory([...newHistory, { speaker: 'Sistema ⚠️', text: err.message || 'Erro ao gerar o avatar. O servidor pode estar indisponível.', type: 'system' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleNarrate = async (type: 'theory' | 'exploit') => {
        if (isNarrating) {
            window.speechSynthesis.cancel();
            setIsNarrating(null);
            return;
        }
        setIsNarrating(type);
        const textToSpeak = currentData[type].replace(/<[^>]*>?/gm, '');

        if (aiPrefs.audioProvider === 'browser-native') {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'pt-PT';
            utterance.rate = 1.05;
            utterance.onend = () => setIsNarrating(null);
            window.speechSynthesis.speak(utterance);
        } else {
            try {
                const res = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textToSpeak })
                });
                if (!res.ok) throw new Error('Falha no motor de voz neural.');
                const data = await res.json();
                const wavBlob = pcmToWav(data.base64);
                const audio = new Audio(URL.createObjectURL(wavBlob));
                audio.onended = () => setIsNarrating(null);
                audio.play();
            } catch (err) {
                console.error(err);
                setIsNarrating(null);
            }
        }
    };

    const handleGenerateScenario = async () => {
        if (!scenarioPrompt.trim()) return;
        setIsGeneratingScenario(true);
        try {
            const res = await fetch('/api/generate-scenario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: scenarioPrompt, ...aiPrefs })
            });
            if (!res.ok) throw new Error('Erro do provedor ao gerar a matriz.');
            const newScenario = await res.json();
            setScenarios(prev => [newScenario, ...prev]); // Injeta no topo da lista
            setCurrentId(newScenario.id);
            setIsScenarioGenOpen(false);
            setScenarioPrompt('');
        } catch (err: any) {
            alert(err.message || "Erro na geração do cenário AI.");
        } finally {
            setIsGeneratingScenario(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 pt-6 font-inter selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Axiom Ticker */}
            <div className={`${styles.tickerWrap} relative w-full`}>
                <div className={styles.ticker}>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> A responsabilidade na FT é realizar o EV monetário, não provar coragem.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> A diferença de RP entre jogadores é a sua Vantagem ou Desvantagem de Risco.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> O pós-flop no ICM foca-se em extração cirúrgica sem pulverizar alavancagem.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt mr-2"></i> Acumular fichas nunca é negativo, o problema é arriscá-las sem recompensa.</span>
                </div>
            </div>

            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-8 mt-8 px-4 md:px-8">
                <header className="text-center pt-4 mb-4 relative">
                    <div className="absolute right-0 top-4">
                        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-indigo-600 transition-all shadow-lg" title="Configurações Neurais">
                            <i className="fa-solid fa-gear"></i>
                        </button>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <div className={`w-2 h-2 rounded-full bg-indigo-400 ${styles.pulseGlow}`}></div>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Motor de Risk Premium Ativo</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3">
                        Motor de <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-500 drop-shadow-md">Risk Premium</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">Teoria dos Jogos Aplicada | Arquitetura V48</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden">
                    {/* LEFT MENU */}
                    <aside className="lg:col-span-4 flex flex-col gap-6 min-w-0">
                        <div className={`${styles.glassPanel} p-5 max-h-[850px] flex flex-col`}>
                            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
                                <div>
                                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Matrizes Clínicas</h2>
                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">{scenarios.length} Cenários</span>
                                </div>
                                <button onClick={() => setIsScenarioGenOpen(true)} className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-indigo-500/40 transition-colors flex items-center gap-2 shadow-lg">
                                    <i className="fa-solid fa-plus"></i> Gerar IA ✨
                                </button>
                            </div>
                            <div className="space-y-3 overflow-y-auto pr-2 pb-4" style={{ maxHeight: '650px' }}>
                                {scenarios.map(sc => {
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
                    <main className="lg:col-span-8 flex flex-col gap-6 min-w-0 overflow-hidden">
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
                                    { id: 'quiz', icon: 'fa-brain', label: 'Prova Analítica', target: 'quiz' },
                                    { id: 'payouts', icon: 'fa-sack-dollar', label: 'Estrutura', target: 'payouts' },
                                    { id: 'ai-coach', icon: 'fa-wand-magic-sparkles', label: 'Assistente AI', target: 'ai-coach' }
                                ].map(tab => (
                                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} data-target={tab.target} className={`${styles.actionTab} ${activeTab === tab.id ? styles.active : ''}`}>
                                        <i className={`fa-solid ${tab.icon} mr-2 opacity-70`}></i> {tab.label}
                                    </div>
                                ))}
                            </div>

                            <div className={`p-8 ${styles.animateFadeUp}`} key={activeTab + currentId}>
                                {activeTab === 'theory' && (
                                    <div className="flex flex-col h-full">
                                        <div className="space-y-4 flex-1" dangerouslySetInnerHTML={{ __html: currentData.theory }} />
                                        <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center">
                                            <button onClick={() => handleNarrate('theory')} className="bg-sky-500/10 text-sky-300 border border-sky-500/30 px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-sky-500/20 transition-all flex items-center justify-center gap-3 shadow-md w-full sm:w-auto">
                                                <i className={`fa-solid ${isNarrating === 'theory' ? 'fa-stop' : 'fa-volume-high'} text-lg`}></i> {isNarrating === 'theory' ? 'Parar Áudio' : 'Ouvir Explicação do Coach ✨'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'exploit' && (
                                    <div className="flex flex-col h-full">
                                        <div className="space-y-4 flex-1" dangerouslySetInnerHTML={{ __html: currentData.exploit }} />
                                        <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center">
                                            <button onClick={() => handleNarrate('exploit')} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-3 shadow-md w-full sm:w-auto">
                                                <i className={`fa-solid ${isNarrating === 'exploit' ? 'fa-stop' : 'fa-volume-high'} text-lg`}></i> {isNarrating === 'exploit' ? 'Parar Áudio' : 'Ouvir Exploit Tático ✨'}
                                            </button>
                                        </div>
                                    </div>
                                )}

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

                                {activeTab === 'payouts' && (
                                    <div className="animate-fade-up">
                                        <h3 className="text-white font-bold text-xl mb-2 tracking-tight">Estrutura de Premiação (10k BI)</h3>
                                        <p className="text-slate-400 text-[14px] mb-6 leading-relaxed">Esta é a grelha financeira que corrompe as equações de ChipEV. A utilidade do pote é ditada por estes saltos verticais, forçando a preservação do <em>Expected Value</em> e gerando a dor matemática (Risk Premiums).</p>
                                        <div className="overflow-x-auto bg-slate-900/60 rounded-xl border border-slate-800 shadow-inner">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr>
                                                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800">Posição Final</th>
                                                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 text-right">Retorno (Payout)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {PAYOUTS.map((p, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="py-4 px-6 text-sm font-semibold text-slate-300 border-b border-slate-800/50">{p.pos}</td>
                                                            <td className={`py-4 px-6 text-sm font-bold text-emerald-400 text-right border-b border-slate-800/50 ${styles.dataMono}`}>{p.val}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ai-coach' && (
                                    <div className="flex flex-col h-full animate-fade-up">
                                        <div className="mb-4 shrink-0">
                                            <h3 className="text-white font-bold text-xl mb-1 tracking-tight">Consultoria Dinâmica ✨</h3>
                                            <p className="text-slate-400 text-[13px]">Disseque as heurísticas, o MDF e o Risk Premium deste cenário com o Motor Neural.</p>
                                        </div>

                                        {/* Quick Prompts Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 shrink-0">
                                            <button onClick={() => { setChatMode('coach'); handleAskAI('Explique a matemática deste cenário de forma muito didática.'); }} className="bg-sky-500/10 text-sky-300 border border-sky-500/30 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500/20 transition-all flex items-center justify-center gap-2"><i className="fa-solid fa-graduation-cap"></i> Simplificar</button>
                                            <button onClick={() => { setChatMode('coach'); handleAskAI('Crie 3 perguntas de flashcard difíceis sobre as falhas que cometem neste cenário.'); }} className="bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-fuchsia-500/20 transition-all flex items-center justify-center gap-2"><i className="fa-solid fa-layer-group"></i> Flashcards</button>
                                            <button onClick={() => { setChatMode('coach'); handleAskAI('O vilão é um amador que ignora a bolha. Qual a exata adaptação do meu range?'); }} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"><i className="fa-solid fa-bullseye"></i> Modo Exploit</button>

                                            <button onClick={() => changeChatMode('villain')} className={`bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${chatMode === 'villain' ? 'ring-2 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'hover:bg-rose-500/20'}`}>🎭 Modo Vilão</button>
                                            <button onClick={() => changeChatMode('simulator')} className={`bg-teal-500/10 text-teal-300 border border-teal-500/30 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${chatMode === 'simulator' ? 'ring-2 ring-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'hover:bg-teal-500/20'}`}>🌪️ Simulador SPR</button>
                                            <button onClick={() => { setChatMode('coach'); handleAskAI('Tenho [INSERE AQUI]. Devo ir a all-in neste cenário?'); }} className="bg-violet-500/10 text-violet-300 border border-violet-500/30 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-violet-500/20 transition-all flex items-center justify-center gap-2">🃏 Analisar Mão</button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 border border-slate-800/50 bg-slate-900/30 rounded-xl p-4 shadow-inner max-h-[350px] custom-scrollbar">
                                            {aiChatHistory.map((msg, i) => (
                                                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`p-4 max-w-[85%] rounded-2xl shadow-md ${msg.type === 'user' ? 'bg-indigo-600/30 border border-indigo-500/40 rounded-tr-none' : msg.type === 'ai' ? 'bg-slate-800 border border-slate-700 rounded-tl-none' : 'bg-slate-950/80 border border-slate-800 rounded-full text-center mx-auto shadow-inner'}`}>
                                                        <p className="text-[13.5px] text-slate-200 leading-relaxed">
                                                            {msg.type !== 'user' && msg.type !== 'system' && <strong className={`block mb-1 text-xs ${chatMode === 'villain' ? 'text-rose-400' : chatMode === 'simulator' ? 'text-teal-400' : 'text-fuchsia-400'}`}>{msg.speaker}</strong>}
                                                            {msg.text}
                                                        </p>
                                                        {msg.imageBase64 && (
                                                            <img src={`data:image/png;base64,${msg.imageBase64}`} className="w-full max-w-[280px] h-auto rounded-xl mt-3 border-2 border-slate-700 shadow-2xl" alt="Avatar do Vilão" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {isAiLoading && (
                                                <div className="flex justify-start">
                                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 shadow-md flex items-center gap-3">
                                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest animate-pulse">A computar...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="shrink-0 bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col focus-within:border-indigo-500/50 transition-all">
                                            <textarea rows={2} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAskAI(); } }} className="w-full bg-transparent p-4 pb-2 text-sm text-white outline-none resize-none" placeholder="Faça uma pergunta tática..."></textarea>
                                            <div className="bg-slate-800/40 px-4 py-3 border-t border-slate-700/50 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Motor: {aiPrefs.textProvider}</span>
                                                <div className="flex gap-3 ml-auto">
                                                    <button onClick={handleGenerateAvatar} disabled={isAiLoading || !aiPrompt.trim()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600/50 px-3.5 py-2 rounded-lg transition-all shadow-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-50" title="Desenhar Retrato do Vilão">
                                                        <i className="fa-solid fa-image text-sm"></i> <span className="hidden sm:inline">Gerar Vilão</span>
                                                    </button>
                                                    <button onClick={() => handleAskAI()} disabled={isAiLoading || !aiPrompt.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50">
                                                        Enviar <i className="fa-solid fa-paper-plane ml-1"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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

                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

                {/* Modal Gerador de Cenários */}
                {isScenarioGenOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
                        <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl p-8 relative animate-fade-up">
                            <button onClick={() => setIsScenarioGenOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>

                            <h2 className="text-2xl font-black text-indigo-400 flex items-center gap-3 mb-2"><i className="fa-solid fa-wand-magic-sparkles"></i> Gerador Estratégico AI</h2>
                            <p className="text-sm text-slate-400 mb-6">Descreva a dinâmica da mesa, posições e as stacks (em bb). O Motor Neural irá inferir toda a matriz matemática, Risk Premium, textos de teoria e exploit, injetando o cenário diretamente no painel de estudos.</p>

                            <textarea rows={4} value={scenarioPrompt} onChange={e => setScenarioPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none mb-6 resize-none custom-scrollbar" placeholder="Ex: Bolha da FT, eu sou o CL com 80bb atacando do CO, e o BB é um nit com 15bb..."></textarea>

                            <button onClick={handleGenerateScenario} disabled={isGeneratingScenario || !scenarioPrompt.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50">
                                {isGeneratingScenario ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Construindo Matriz Complexa...</>
                                ) : (
                                    <>Construir Matriz HRC ✨</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}