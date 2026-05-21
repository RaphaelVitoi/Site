/**
 * IDENTITY: ICM Scenarios & Toy Games Database
 * PATH: src/data/scenarios.ts
 * ROLE: Fonte de Verdade SOTA para os cenários de simulação (Substitui os antigos .js soltos)
 */

export interface PlayerState {
    pos: string;
    stack: string;
    rp: number;
    morph: string;
}

export interface ScenarioData {
    ip: PlayerState;
    oop: PlayerState;
}

export interface Scenario {
    id: string;
    icon: string;
    label: string;
    context: string;
    data: ScenarioData;
    content: string; // Armazena o HTML legado para injeção ou parser futuro
}

export const SCENARIOS: Scenario[] = [
    {
        id: "paradox",
        icon: "fa-scale-unbalanced",
        label: "Paradoxo do Valuation",
        context: "Mid Stack (BTN) vs Big Stack (BB)",
        data: {
            ip: { pos: "BTN", stack: "40bb", rp: 21.4, morph: "Polarizado" },
            oop: { pos: "BB", stack: "55bb", rp: 12.9, morph: "Condensado" }
        },
        content: `
            <h3 class="text-xl text-white font-bold mb-4 font-editorial">O Instinto Traído</h3>
            <p class="text-slate-300 mb-4 text-sm leading-relaxed">O "Risk Premium de Ida" (21.4%) é quase o dobro do "Risk Premium de Volta". O BTN aposta a sua vida; o BB aposta apenas fichas.</p>
        `
    },
    {
        id: "pact",
        icon: "fa-handshake",
        label: "O Pacto Silencioso",
        context: "CL vs CL (Choque de Titãs)",
        data: {
            ip: { pos: "CO", stack: "65bb", rp: 24.5, morph: "Linear Passivo" },
            oop: { pos: "BTN", stack: "70bb", rp: 23.5, morph: "Flat Call Massivo" }
        },
        content: `
            <h3 class="text-xl text-white font-bold mb-4 font-editorial">Destruição Mútua Assegurada</h3>
            <p class="text-slate-300 mb-4 text-sm leading-relaxed">Quando as duas maiores stacks colidem, 3-bets somem. Ranges de flat-call explodem para evitar variância pré-flop.</p>
        `
    },
    {
        id: "bubble_3way",
        icon: "fa-radiation",
        label: "O Abismo (3-Way Bubble)",
        context: "BTN (CL) abre, SB call, BB (Hero) decisão",
        data: {
            ip: { pos: "BTN", stack: "85bb", rp: 10.5, morph: "Maniaco (CL)" },
            oop: { pos: "BB", stack: "12bb", rp: 42.0, morph: "Paralisado" }
        },
        content: `
            <h3 class="text-xl text-white font-bold mb-4 font-editorial">Pressão Máxima de ICM</h3>
            <p class="text-slate-300 mb-4 text-sm leading-relaxed">
                Cenário de pesadelo: Bolha do ITM. O Chip Leader (BTN) abre any-two. O SB (que te cobre) paga flat. 
                O pote é gigante, mas seu <strong>Risk Premium é de 42%</strong>.
                <br><br>
                A matemática aqui desafia a lógica: mesmo com "Pot Odds" excelentes, seu "Bubble Factor" exige que você folde mãos como <strong>TT</strong> e <strong>AQo</strong>. A sobrevivência vale mais que o acúmulo.
            </p>
        `
    }
];

export const TOY_GAMES: Scenario[] = [
    {
        id: "toy_sniper",
        icon: "fa-crosshairs",
        label: "O Franco-Atirador (Blind War)",
        context: "SB (Hero) vs BB",
        data: {
            ip: { pos: "SB", stack: "50bb", rp: 12.0, morph: "Chipleader" },
            oop: { pos: "BB", stack: "12bb", rp: 45.0, morph: "Short Stack" }
        },
        content: `
            <h3 class="text-xl text-white font-bold mb-4 font-editorial">Licença para Matar</h3>
            <p class="text-slate-300 mb-4 text-sm leading-relaxed">
                <strong>Predator Mode Ativado:</strong> Você é o Chipleader no SB. O BB tem 12bb e um Risk Premium de 45% (Death Zone).
                <br><br>
                Matematicamente, ele não pode pagar com quase nada porque cair antes dos stacks de 8bb e 9bb é catastrófico. 
                Seu range de shove aqui deve ser <strong>100% (Any Two Cards)</strong>.
            </p>
        `
    },
    {
        id: "toy_bully",
        icon: "fa-skull-crossbones",
        label: "O Bully do Botão",
        context: "Bolha do ITM: BTN vs Blinds",
        data: {
            ip: { pos: "BTN", stack: "80bb", rp: 5.0, morph: "Bully" },
            oop: { pos: "SB", stack: "20bb", rp: 42.0, morph: "Pressionado" }
        },
        content: `
            <h3 class="text-xl text-white font-bold mb-4 font-editorial">Agressão Impune</h3>
            <p class="text-slate-300 mb-4 text-sm leading-relaxed">
                Estamos na Bolha. Você tem 80bb e os blinds têm 20bb/18bb.
                Seu Risk Premium é ínfimo (5%). O deles é massivo (>40%).
                <br><br>
                Isso cria uma assimetria brutal. O solver sugere agressão desproporcional. 
                Observe como o medidor do oponente entra na <strong>Death Zone</strong> enquanto o seu brilha em <strong>Predator Mode</strong>.
            </p>
        `
    }
];

export const ALL_SCENARIOS: Scenario[] = [...SCENARIOS, ...TOY_GAMES];