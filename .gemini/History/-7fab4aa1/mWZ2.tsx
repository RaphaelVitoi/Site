import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET ( request: Request ) {
    try
    {
        const { searchParams } = new URL( request.url );

        // Extracao de metricas via query string com fallbacks de sanidade
        const bf = searchParams.get( 'bf' ) || '1.00';
        const rp = searchParams.get( 'rp' ) || '0.0%';
        const pureEv = searchParams.get( 'pureEv' ) || '0';
        const icmEv = searchParams.get( 'icmEv' ) || '0';
        const pot = searchParams.get( 'pot' ) || '0';
        const bet = searchParams.get( 'bet' ) || '0';

        // SOTA: Validação estrutural básica
        if ( bf.length > 10 || rp.length > 10 || pureEv.length > 10 || icmEv.length > 10 || pot.length > 10 || bet.length > 10 )
        {
            return new Response( 'Payload violou o limite estrutural.', { status: 400 } );
        }

        // Conversao para avaliacao visual de impacto (Cores)
        const numPureEv = Number.isNaN( Number.parseFloat( pureEv ) ) ? 0 : Number.parseFloat( pureEv );
        const numIcmEv = Number.isNaN( Number.parseFloat( icmEv ) ) ? 0 : Number.parseFloat( icmEv );

        return new ImageResponse(
            (
                <div
                    style={ {
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#111827', // bg-gray-900
                        padding: '60px',
                        fontFamily: 'sans-serif',
                        color: '#fff',
                        border: '8px solid #374151', // border-gray-700
                        borderRadius: '24px',
                    } }
                >
                    <h1 style={ { fontSize: '64px', color: '#22d3ee', marginBottom: '40px', fontWeight: 'bold' } }>
                        Impacto do ICM (A Geometria do Risco)
                    </h1>

                    <div style={ { display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '60px' } }>
                        <div style={ { display: 'flex', flexDirection: 'column' } }>
                            <span style={ { fontSize: '36px', color: '#9ca3af' } }>Bubble Factor (BF)</span>
                            <span style={ { fontSize: '56px', fontWeight: 'bold' } }>{ bf }</span>
                        </div>
                        <div style={ { display: 'flex', flexDirection: 'column' } }>
                            <span style={ { fontSize: '36px', color: '#9ca3af' } }>Risk Premium (RP)</span>
                            <span style={ { fontSize: '56px', fontWeight: 'bold', color: '#fb923c' } }>{ rp }</span>
                        </div>
                        <div style={ { display: 'flex', flexDirection: 'column' } }>
                            <span style={ { fontSize: '36px', color: '#9ca3af' } }>Pote / Aposta</span>
                            <span style={ { fontSize: '56px', fontWeight: 'bold' } }>{ pot } / { bet }</span>
                        </div>
                    </div>

                    <div style={ { display: 'flex', width: '100%', gap: '40px' } }>
                        <div
                            style={ {
                                display: 'flex', flexDirection: 'column', flex: 1,
                                backgroundColor: '#1f2937', padding: '40px',
                                borderRadius: '16px', border: '4px solid #4b5563',
                            } }
                        >
                            <span style={ { fontSize: '36px', color: '#9ca3af', marginBottom: '20px' } }>ChipEV (Ilusao Linear)</span>
                            <span style={ { fontSize: '80px', fontWeight: 'bold', color: numPureEv >= 0 ? '#4ade80' : '#ef4444' } }>
                                { numPureEv > 0 ? '+' : '' }{ pureEv }
                            </span>
                        </div>

                        <div
                            style={ {
                                display: 'flex', flexDirection: 'column', flex: 1,
                                backgroundColor: '#1f2937', padding: '40px',
                                borderRadius: '16px', border: '4px solid #9a3412',
                            } }
                        >
                            <span style={ { fontSize: '36px', color: '#fb923c', marginBottom: '20px' } }>ICM EV (Realidade Assimetrica)</span>
                            <span style={ { fontSize: '80px', fontWeight: 'bold', color: numIcmEv >= 0 ? '#4ade80' : '#ef4444' } }>
                                { numIcmEv > 0 ? '+' : '' }{ icmEv }
                            </span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            }
        );
    } catch ( error: unknown )
    {
        const msg = error instanceof Error ? error.message : 'Unknown Error';
        console.error( '[API SOTA] Falha estrutural ao gerar a assinatura visual OG:', msg );
        return new Response( 'Internal Server Error', { status: 500 } );
    }
}
