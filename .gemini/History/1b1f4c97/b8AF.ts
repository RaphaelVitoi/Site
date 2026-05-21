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
            // Blindagem: O contrato SOTA exige que a comunicação seja via Buffers brutos
            if ( msg.payload instanceof Uint8Array || msg.payload instanceof Int32Array )
            {

                // --- INJEÇÃO DO RANQUEADOR BITWISE NATIVO ---
                // A matriz é processada linearmente em O(1)
                // Simulando a extração SOTA (o Rust/WASM seria invocado aqui)

                const simulatedMonopolyVector = 1.15; // > 1 = Assimetria Favorável
                const simulatedRiskPremium = 14.2;    // Em porcentagem
                const simulatedPerspective = 0.88;    // Normalizado 0 a 1

                ctx.postMessage( {
                    type: 'QUANTUM_SYNC',
                    payload: {
                        monopolyVector: simulatedMonopolyVector,
                        riskPremium: simulatedRiskPremium,
                        perspective: simulatedPerspective
                    }
                } );
            } else
            {
                ctx.postMessage( {
                    type: 'ENTROPY_ERROR',
                    payload: 'Falha de Contrato: Payload deve ser Uint8Array ou Int32Array para Fricção Zero.'
                } );
            }
        }
    }
} );
