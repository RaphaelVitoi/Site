import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET ( req: NextRequest ) {
    try
    {
        const { searchParams } = req.nextUrl;
        const bf = searchParams.get( 'bf' ) || '1.000';
        const rp = searchParams.get( 'rp' ) || '0.0';
        const pureEv = searchParams.get( 'pureEv' ) || '0.00';
        const icmEv = searchParams.get( 'icmEv' ) || '0.00';
        const pot = searchParams.get( 'pot' ) || '0.0';

        // SOTA: Satori exige CSS estrito. Sem rem, sem variáveis, display: flex mandatório em todos os containers.
        return new ImageResponse(
            (
                <div style={ { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#030712', padding: '60px', fontFamily: 'monospace', color: '#d1d5db' } }>
                    <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #111827', paddingBottom: '30px', marginBottom: '40px', width: '100%' } }>
                        <h1 style={ { color: '#2dd4bf', fontSize: '50px', margin: 0, textTransform: 'uppercase' } }>Perspectiva Matemática</h1>
                        <span style={ { color: '#b45309', fontSize: '30px', fontWeight: 'bold' } }>SOTA V2 | ICM / FGS</span>
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: '40px' } }>
                        <div style={ { display: 'flex', flexDirection: 'column', width: '48%', backgroundColor: '#0a0f1c', border: '1px solid #134e4a', padding: '30px', borderRadius: '16px' } }>
                            <span style={ { fontSize: '24px', color: '#0f766e', textTransform: 'uppercase', marginBottom: '10px' } }>Risk Premium</span>
                            <span style={ { fontSize: '72px', color: '#14b8a6', fontWeight: 'bold' } }>{ rp }%</span>
                        </div>
                        <div style={ { display: 'flex', flexDirection: 'column', width: '48%', backgroundColor: '#0a0f1c', border: '1px solid #1f2937', padding: '30px', borderRadius: '16px' } }>
                            <span style={ { fontSize: '24px', color: '#4b5563', textTransform: 'uppercase', marginBottom: '10px' } }>Bubble Factor</span>
                            <span style={ { fontSize: '72px', color: '#9ca3af', fontWeight: 'bold' } }>{ bf }</span>
                        </div>
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'row', justifyItems: 'flex-start', width: '100%' } }>
                        <div style={ { display: 'flex', flexDirection: 'column', width: '33%' } }>
                            <span style={ { fontSize: '20px', color: '#4b5563', marginBottom: '8px', textTransform: 'uppercase' } }>Chip EV Base</span>
                            <span style={ { fontSize: '40px', color: '#d1d5db' } }>{ pureEv }</span>
                        </div>
                        <div style={ { display: 'flex', flexDirection: 'column', width: '33%' } }>
                            <span style={ { fontSize: '20px', color: '#4b5563', marginBottom: '8px', textTransform: 'uppercase' } }>ICM EV</span>
                            <span style={ { fontSize: '40px', color: '#d1d5db' } }>{ icmEv }</span>
                        </div>
                        <div style={ { display: 'flex', flexDirection: 'column', width: '33%' } }>
                            <span style={ { fontSize: '20px', color: '#4b5563', marginBottom: '8px', textTransform: 'uppercase' } }>Dead Money</span>
                            <span style={ { fontSize: '40px', color: '#d1d5db' } }>{ pot } bb</span>
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
    } catch ( e: any )
    {
        return new Response( `Falha SOTA OG: ${e.message}`, { status: 500 } );
    }
}
