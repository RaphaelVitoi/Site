/**
 * [WORKER SOTA] Motor Quântico O(1) (Bitwise Ranker)
 * Executado estritamente fora da Main Thread para garantir Fricção Zero na UI.
 */

const ctx = globalThis as unknown as Worker;

// Erradicação do tipo 'any' via type guards restritos
type WorkerMessage = Readonly<{
    type: string;
    payload: unknown;
}>;

ctx.addEventListener( 'message', ( event: MessageEvent<unknown> ) => {
    const data = event.data;

    if ( typeof data === 'object' && data !== null && 'type' in data )
    {
        const msg = data as WorkerMessage;

        if ( msg.type === 'EVALUATE_MATRIX' )
        {
            // Blindagem: O contrato SOTA exige que a comunicação seja via Buffers brutos de precisão (Float32Array)
            if ( msg.payload instanceof Float32Array || msg.payload instanceof Uint8Array || msg.payload instanceof Int32Array || msg.payload instanceof Float64Array )
            {
                const buffer = msg.payload;
                const heroInvested = buffer[ 0 ] || 0;
                const pot = buffer[ 1 ] || 0;

                // --- INJEÇÃO DO RANQUEADOR BITWISE NATIVO ---
                // A matriz é processada linearmente em O(1) baseada nos axiomas da Perspectiva Matemática

                // 1. Vetor Monopólio: Aumenta com o pote, mas sofre tensão de gravidade via investimento
                const monopolyVector = Math.max( 0.1, 1.0 + ( pot * 0.05 ) - ( heroInvested * 0.12 ) );

                // 2. Risk Premium: Axioma da Diluição (Pot Entrapment).
                // Baseline de FT (Arquétipo II: ~21.4%). Quanto maior a parcela investida no pote, menor o RP residual.
                const baseRP = 21.4;
                const safePot = pot === 0 ? 0.001 : pot;
                const dilutionFactor = Math.min( 1.0, heroInvested / safePot );
                const riskPremium = Math.max( 0, baseRP * ( 1 - Math.pow( dilutionFactor, 1.5 ) ) );

                // 3. Perspectiva Matemática (Síntese)
                // Absorve a Tensão (Monopólio) mitigada pela penalidade do Risco (RP).
                const perspective = Math.max( 0, Math.min( 1, ( monopolyVector / 2 ) * ( 1 - ( riskPremium / 100 ) ) ) );

                ctx.postMessage( {
                    type: 'QUANTUM_SYNC',
                    payload: {
                        monopolyVector: Number( monopolyVector.toFixed( 3 ) ),
                        riskPremium: Number( riskPremium.toFixed( 1 ) ),
                        perspective: Number( perspective.toFixed( 3 ) )
                    }
                } );
            } else
            {
                ctx.postMessage( {
                    type: 'ENTROPY_ERROR',
                    payload: 'Falha de Contrato: Payload deve ser Array tipado (ex: Float32Array) para Fricção Zero.'
                } );
            }
        }
    }
} );
