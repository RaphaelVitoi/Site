import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET ( request: Request ) {
    try
    {
        const { searchParams } = new URL( request.url );

        // SOTA: Extração segura de parâmetros com fallbacks para evitar colapso do Satori Engine.
        const bf = searchParams.get( 'bf' ) ?? '1.000';
        const rp = searchParams.get( 'rp' ) ?? '0.0';
        const pureEv = searchParams.get( 'pureEv' ) ?? '0.0';
        const icmEv = searchParams.get( 'icmEv' ) ?? '0.0';
        const pot = searchParams.get( 'pot' ) ?? '0.0';
        const bet = searchParams.get( 'bet' ) ?? '0.0';

        const parsedPureEv = Number.parseFloat( pureEv );
        const parsedIcmEv = Number.parseFloat( icmEv );

        return new ImageResponse(
            (
                <div
                    style={ {
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#020617',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.03) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.03) 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        padding: '60px',
                        fontFamily: 'sans-serif',
                        border: '2px solid #1e293b',
                    } }
                >
                    {/* Header Institucional SOTA */ }
                    <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1e293b', paddingBottom: '30px', marginBottom: '40px' } }>
                        <div style={ { display: 'flex', flexDirection: 'column' } }>
                            <span style={ { fontSize: '24px', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' } }>
                                Tensão Decisional
                            </span>
                            <span style={ { fontSize: '48px', color: '#f8fafc', fontWeight: 900, marginTop: '10px' } }>
                                Perspectiva Matemática
                            </span>
                        </div>
                        <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '15px 30px', borderRadius: '16px', border: '2px solid #334155' } }>
                            <span style={ { fontSize: '26px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' } }>Motor SOTA V2</span>
                        </div>
                    </div>

                    {/* Content Grid */ }
                    <div style={ { display: 'flex', gap: '40px', flex: 1 } }>

                        {/* Left Column: Contexto da Mesa */ }
                        <div style={ { display: 'flex', flexDirection: 'column', flex: 1, gap: '30px' } }>
                            <div style={ { display: 'flex', flexDirection: 'column', background: '#0a0f1c', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b' } }>
                                <span style={ { fontSize: '20px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' } }>Dead Money (Pot)</span>
                                <span style={ { fontSize: '64px', color: '#e2e8f0', fontWeight: 800, marginTop: '10px' } }>{ pot } <span style={ { fontSize: '32px', color: '#64748b' } }>bb</span></span>
                            </div>
                            <div style={ { display: 'flex', flexDirection: 'column', background: '#0a0f1c', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b' } }>
                                <span style={ { fontSize: '20px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' } }>Investimento Nominal</span>
                                <span style={ { fontSize: '64px', color: '#e2e8f0', fontWeight: 800, marginTop: '10px' } }>{ bet } <span style={ { fontSize: '32px', color: '#64748b' } }>bb</span></span>
                            </div>
                        </div>

                        {/* Middle Column: A Dor (ICM) */ }
                        <div style={ { display: 'flex', flexDirection: 'column', flex: 1.2, background: '#0a0f1c', padding: '40px', borderRadius: '24px', border: '2px solid rgba(14, 165, 233, 0.2)' } }>
                            <span style={ { fontSize: '20px', color: '#0ea5e9', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' } }>Risk Premium</span>
                            <span style={ { fontSize: '80px', color: '#38bdf8', fontWeight: 900, marginTop: '20px' } }>{ rp }%</span>

                            <div style={ { display: 'flex', flexDirection: 'column', marginTop: 'auto', paddingTop: '30px', borderTop: '2px solid #1e293b' } }>
                                <span style={ { fontSize: '20px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' } }>Bubble Factor</span>
                                <span style={ { fontSize: '48px', color: '#94a3b8', fontWeight: 800, marginTop: '10px' } }>{ bf }x</span>
                            </div>
                        </div>

                        {/* Right Column: EV Comparativo (O Choque de Realidade) */ }
                        <div style={ { display: 'flex', flexDirection: 'column', flex: 1.2, background: '#0a0f1c', padding: '40px', borderRadius: '24px', border: '2px solid rgba(225, 29, 72, 0.2)' } }>
                            <span style={ { fontSize: '20px', color: '#e11d48', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' } }>Assimetria de EV</span>

                            <div style={ { display: 'flex', flexDirection: 'column', marginTop: '30px' } }>
                                <span style={ { fontSize: '18px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' } }>ChipEV Puro</span>
                                <span style={ { fontSize: '42px', color: '#e2e8f0', fontWeight: 800, marginTop: '5px' } }>
                                    { parsedPureEv > 0 ? `+${parsedPureEv.toFixed( 1 )}` : parsedPureEv.toFixed( 1 ) }
                                </span>
                            </div>

                            <div style={ { display: 'flex', flexDirection: 'column', marginTop: 'auto', paddingTop: '30px', borderTop: '2px solid #1e293b' } }>
                                <span style={ { fontSize: '18px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' } }>ICM EV (Perspectiva)</span>
                                <span style={ { fontSize: '56px', color: parsedIcmEv >= 0 ? '#34d399' : '#fb7185', fontWeight: 900, marginTop: '10px' } }>
                                    { parsedIcmEv > 0 ? `+${parsedIcmEv.toFixed( 1 )}` : parsedIcmEv.toFixed( 1 ) }
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch ( error: any )
    {
        console.error( '[API OG ERROR]', error );
        return new Response(
            JSON.stringify( { error: 'Falha na compilação do artefato OG', details: error.message } ),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
