export const TOY_GAMES = [
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