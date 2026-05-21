
// === ONTOLOGIA VITOI SOTA v3.2 ===
// Componente: Painel Parametrico de Antevisao Semantica
// Strict Rule: Friccao Zero, Pure ASCII, Noctilux Aesthetic.

interface ParametricPanelProps {
    readonly sEff: number;
    readonly setSEff: ( val: number ) => void;
    readonly riskAversion: number;
    readonly setRiskAversion: ( val: number ) => void;
    readonly fb: number;
    readonly setFb: ( val: number ) => void;
}

export default function ParametricPanel ( {
    sEff, setSEff, riskAversion, setRiskAversion, fb, setFb
}: ParametricPanelProps ) {
    return (
        <div className="w-full bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 font-mono text-gray-300">
            <h2 className="text-xl text-cyan-400 mb-4 font-bold tracking-tighter uppercase border-b border-gray-700 pb-2">
                [SOTA] Parametros de Estado Sistemico
            </h2>

            <div className="space-y-6">
                {/* Input 1: Profundidade Efetiva (Colapso da Arvore) */ }
                <div>
                    <div className="flex justify-between mb-1">
                        <label htmlFor="sEff" className="text-sm font-semibold text-gray-200">
                            Profundidade Efetiva (S_eff)
                        </label>
                        <span className="text-cyan-400 font-bold">{ sEff } bb</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                        Define a complexidade da arvore. S_eff &lt;= 15bb engatilha o colapso mecanico da edge e reduz as opcoes a push/fold.
                    </p>
                    <input
                        id="sEff"
                        type="range" min="5" max="100" step="1" value={ sEff }
                        onChange={ ( e ) => setSEff( Number( e.target.value ) ) }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                </div>

                {/* Input 2: Aversao ao Risco (Multiplicador de RIO / ICM) */ }
                <div>
                    <div className="flex justify-between mb-1">
                        <label htmlFor="riskAversion" className="text-sm font-semibold text-gray-200">
                            Aversao ao Risco (Fator ICM)
                        </label>
                        <span className="text-yellow-400 font-bold">{ riskAversion.toFixed( 2 ) }x</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                        Multiplicador de pressao monetaria. 1.0 = ChipEV (Neutro). &gt; 1.5 = Insolvencia alta (Deslocamento do EV_fold).
                    </p>
                    <input
                        id="riskAversion"
                        type="range" min="1.0" max="3.0" step="0.1" value={ riskAversion }
                        onChange={ ( e ) => setRiskAversion( Number( e.target.value ) ) }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                </div>

                {/* Input 3: Taxa de Bobagem Humana (fb) */ }
                <div>
                    <div className="flex justify-between mb-1">
                        <label htmlFor="fb" className="text-sm font-semibold text-gray-200">
                            Taxa de Bobagem Humana (f_b)
                        </label>
                        <span className="text-fuchsia-400 font-bold">{ ( fb * 100 ).toFixed( 0 ) }%</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                        Injetor de equidade artificial. Amortece o Risk Premium assumindo frequencia de tilts ou blefes ilogicos do oponente.
                    </p>
                    <input
                        id="fb"
                        type="range" min="0.0" max="0.5" step="0.01" value={ fb }
                        onChange={ ( e ) => setFb( Number( e.target.value ) ) }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
                    />
                </div>
            </div>

            {/* Motor de Diagnostico em Tempo Real */ }
            <div className="mt-6 p-3 bg-black border border-gray-800 rounded text-xs text-gray-400 leading-relaxed">
                <span className="text-red-400 font-bold">[DIAGNOSTICO]:</span> {
                    sEff <= 15
                        ? "Estado Critico. Arvore colapsada. Vantagem tecnica amortizada pela variancia de blind-vs-blind."
                        : "Alta Resolucao. Ferramentas de Edge (outplay pos-flop) plenamente operacionais."
                }
                <br /><br />
                <span className="text-yellow-400 font-bold">[PRESSAO]:</span> {
                    riskAversion >= 2
                        ? "Extrema. Baseline do EV_fold deslocado. Evitar colisoes marginais e RIO exponencial."
                        : "Controlada. Foco na realizacao de equidade e captura de utilidade matematica."
                }
                <br /><br />
                <span className="text-fuchsia-400 font-bold">[FATOR Ψ]:</span> {
                    fb > 0.2
                        ? `Alta entropia comportamental (${( fb * 100 ).toFixed( 0 )}%). O sistema compensa a insolvencia das odds explorando o caos adversario.`
                        : "Oponentes racionais. A utilidade matematica domina as decisoes (GTO Baseline)."
                }
            </div>
        </div>
    );
}
