'use client';

import RiskVisualizer from '@/app/RiskVisualizer';
import { useIcmStore } from '@/store/icmStore';
import { useEffect, useState } from 'react';

export default function IcmLab () {
    const { updateMetrics, setSimulating } = useIcmStore();

    // Controles do Cenário
    const [ invested, setInvested ] = useState<number>( 12.5 );
    const [ opponents, setOpponents ] = useState<number>( 1 );
    const [ bubbleProximity, setBubbleProximity ] = useState<number>( 10 );
    const [ isSaving, setIsSaving ] = useState<boolean>( false );

    useEffect( () => {
        setSimulating( true );

        const debounceTimer = setTimeout( () => {
            const baseFoldEv = -( invested / 100 );
            const dynamicEvFold = bubbleProximity > 90 ? Math.abs( baseFoldEv ) * 0.5 : baseFoldEv;

            const bubbleFactor = 1 + ( bubbleProximity / 40 );
            const riskPremium = bubbleProximity * 0.45;

            const insolvencyCoefficient = 1.8 - ( opponents * 0.35 ) - ( riskPremium / 100 );

            updateMetrics( {
                evFold: dynamicEvFold,
                riskPremium: Math.min( riskPremium, 100 ),
                bubbleFactor,
                insolvencyCoefficient: Math.max( insolvencyCoefficient, -1 ),
            } );

            setSimulating( false );
        }, 200 );

        return () => clearTimeout( debounceTimer );
    }, [ invested, opponents, bubbleProximity, updateMetrics, setSimulating ] );

    // SOTA: Gatilho assíncrono para persistência no SQLite via nova rota
    const handleSaveSimulation = async () => {
        setIsSaving( true );
        try
        {
            const payload = {
                invested,
                opponents,
                bubbleProximity,
                metrics: useIcmStore.getState().metrics
            };
            const res = await fetch( '/api/icm/simulations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( payload )
            } );
            if ( !res.ok ) throw new Error( 'Falha ao salvar simulação' );
        } catch ( error )
        {
            console.error( '[IcmLab] Erro de persistência:', error );
        } finally
        {
            setIsSaving( false );
        }
    };

    return (
        <div className="w-full mt-16 pt-8 border-t border-white/10">
            <header className="mb-10 text-center">
                <div className="inline-block px-3 py-1 mb-4 border border-indigo-500/30 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest">Laboratório ICM V2</div>
                <h2 className="text-3xl font-heading font-black text-white mb-4">Motor de Perspectiva Matemática</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Manipule os vetores de entropia da mesa. O motor calcula o impacto estrutural em tempo real.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <button onClick={ handleSaveSimulation } disabled={ isSaving } className="mt-4 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono transition-colors disabled:opacity-50">
                        { isSaving ? 'Gravando no SQLite...' : 'Salvar Snapshot da Simulação' }
                    </button>
                </div>
                <RiskVisualizer />
            </div>
        </div>
    );
}
