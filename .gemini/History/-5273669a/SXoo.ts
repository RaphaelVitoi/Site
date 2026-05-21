import { NextResponse } from 'next/server';

// Gatekeeper SOTA: Whitelist de domínios para prevenção de SSRF
const ALLOWED_BYOK_DOMAINS = [
    'api.openai.com',
    'openrouter.ai',
    'api.anthropic.com',
    'api.deepseek.com',
    'api.groq.com'
];

export async function POST ( req: Request ) {
    try
    {
        const bodyText = await req.text();
        if ( !bodyText ) return NextResponse.json( { error: 'Payload vazio.' }, { status: 400 } );

        const body = JSON.parse( bodyText );
        const { prompt, systemInstruction, provider, customApiKey, customBaseUrl, customModelName } = body;

        if ( !prompt || typeof prompt !== 'string' )
        {
            return NextResponse.json( { error: 'Payload inválido.' }, { status: 400 } );
        }

        let responseText = "";

        switch ( provider )
        {
            case 'byok-custom': {
                if ( !customApiKey || !customBaseUrl || !customModelName )
                {
                    return NextResponse.json( { error: 'Credenciais BYOK incompletas. Verifique as configurações.' }, { status: 401 } );
                }

                // Auditoria de Segurança: Interceptação de SSRF
                try
                {
                    const urlObj = new URL( customBaseUrl );
                    if ( !ALLOWED_BYOK_DOMAINS.includes( urlObj.hostname ) )
                    {
                        return NextResponse.json( { error: 'Domínio BYOK não autorizado pelo Cortex Shield (Proteção SSRF).' }, { status: 403 } );
                    }
                } catch ( e )
                {
                    return NextResponse.json( { error: 'URL BYOK malformada.' }, { status: 400 } );
                }

                const targetUrl = `${customBaseUrl.replace( /\/$/, '' )}/chat/completions`;
                const byokRes = await fetch( targetUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${customApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify( {
                        model: customModelName,
                        messages: [
                            { role: "system", content: systemInstruction || "Você é um assistente lógico especialista em Teoria dos Jogos e ICM no Poker." },
                            { role: "user", content: prompt }
                        ]
                    } )
                } );

                if ( !byokRes.ok )
                {
                    const errorData = await byokRes.text();
                    throw new Error( `Upstream Provider Error: ${byokRes.status} - ${errorData}` );
                }
                const byokData = await byokRes.json();
                responseText = byokData.choices[ 0 ].message.content;
                break;
            }

            case 'pokerracional-cloud':
            default: {
                if ( !process.env.GEMINI_API_KEY )
                {
                    throw new Error( "GEMINI_API_KEY ausente no ambiente de servidor." );
                }

                const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                const gRes = await fetch( googleUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( {
                        contents: [ { parts: [ { text: prompt } ] } ],
                        systemInstruction: { parts: [ { text: systemInstruction || "Você é Raphael Vitoi, especialista em ICM." } ] }
                    } )
                } );

                if ( !gRes.ok )
                {
                    const errorData = await gRes.text();
                    throw new Error( `Upstream Provider Error (Google): ${gRes.status} - ${errorData}` );
                }

                const gData = await gRes.json();
                responseText = gData.candidates?.[ 0 ]?.content?.parts?.[ 0 ]?.text || "Erro ao decodificar IA.";
                break;
            }
        }

        return NextResponse.json( { text: responseText } );

    } catch ( error: unknown )
    {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido durante parseamento JSON ou fetch.';
        console.error( '[AI_GATEWAY_ERROR] Falha na ponte proxy:', errorMessage );
        return NextResponse.json( { error: 'Falha na conexão neural. Verifique sua chave e endpoint.' }, { status: 500 } );
    }
}
