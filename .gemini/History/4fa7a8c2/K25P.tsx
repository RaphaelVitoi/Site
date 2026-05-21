'use client';

import { useIcmStore } from '@/store/icmStore';
import { useEffect, useState } from 'react';
import RiskVisualizer from '../RiskVisualizer';

export default function SimuladorPage () {
    const { updateMetrics, setSimulating } = useIcmStore();

    // Controles do Cenário
    const [ invested, setInvested ] = useState<number>( 12.5 ); // Investimento em % do BB (ex: 12.5% ante)
    const [ opponents, setOpponents ] = useState<number>( 1 );  // Oponentes na mão
    const [ bubbleProximity, setBubbleProximity ] = useState<number>( 10 ); // Pressão de 0 a 100

    useEffect( () => {
        setSimulating( true );

        const debounceTimer = setTimeout( () => {
            // LÓGICA SOTA CLIENT-SIDE (Zero Tokens)
            // Baseado nas Derivações Matemáticas D1-D6 de Raphael Vitoi

            // D1/D5: O Axioma do Fold. Custo marginal baseado no que foi investido.
            // (Pode cruzar zero em caso de payjumps extremos, simplificado aqui).
            const baseFoldEv = -( invested / 100 );
            const dynamicEvFold = bubbleProximity > 90 ? Math.abs( baseFoldEv ) * 0.5 : baseFoldEv;

            // Risk Premium e Bubble Factor: Crescem não-linearmente com a proximidade da bolha.
            const bubbleFactor = 1 + ( bubbleProximity / 40 );
            const riskPremium = bubbleProximity * 0.45;

            // D2/D3: Coeficiente de Insolvência (Ci) para Multiway.
            // RIO cresce O(N²), deteriorando a utilidade real vs Pot Odds aparentes.
            const insolvencyCoefficient = 1.8 - ( opponents * 0.35 ) - ( riskPremium / 100 );

            updateMetrics( {
                evFold: dynamicEvFold,
                riskPremium: Math.min( riskPremium, 100 ), // Cap Teto do RP
                bubbleFactor,
                insolvencyCoefficient: Math.max( insolvencyCoefficient, -1 ),
            } );

            setSimulating( false );
        }, 200 ); // Fricção sensorial leve para indicar recálculo

        return () => clearTimeout( debounceTimer );
    }, [ invested, opponents, bubbleProximity, updateMetrics, setSimulating ] );

    return (
        <div className="container py-12 max-w-6xl mx-auto">
            <header className="mb-10 text-center">
                <div className="inline-block px-3 py-1 mb-4 border border-indigo-500/30 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest">Laboratório ICM V2</div>
                <h1 className="text-4xl font-heading font-black text-white mb-4">Motor de Perspectiva Matemática</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">Manipule os vetores de entropia da mesa. O motor calcula o impacto estrutural em tempo real, sem delay de rede.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controles de Entrada */ }
                <div className="glass-panel p-8 border border-white/10 rounded-2xl flex flex-col gap-6">
                    <div>
                        <label className="flex justify-between text-sm font-mono text-slate-300 mb-3"><span>Fichas Investidas no Pote</span> <span className="text-indigo-400">{ invested }% BB</span></label>
                        <input type="range" min="0" max="100" value={ invested } onChange={ ( e ) => setInvested( Number( e.target.value ) ) } className="w-full accent-indigo-500" />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-mono text-slate-300 mb-3"><span>Oponentes Ativos (Multiway)</span> <span className="text-rose-400">{ opponents }</span></label>
                        <input type="range" min="1" max="5" value={ opponents } onChange={ ( e ) => setOpponents( Number( e.target.value ) ) } className="w-full accent-rose-500" />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-mono text-slate-300 mb-3"><span>Pressão de Sobrevivência (ICM)</span> <span className="text-amber-400">{ bubbleProximity }%</span></label>
                        <input type="range" min="0" max="100" value={ bubbleProximity } onChange={ ( e ) => setBubbleProximity( Number( e.target.value ) ) } className="w-full accent-amber-500" />
                    </div>
                </div>

                {/* Visualizador de Saída */ }
                <RiskVisualizer />
            </div>
        </div>
    );
}
