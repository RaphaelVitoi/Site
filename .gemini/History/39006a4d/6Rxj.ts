import { NextResponse } from 'next/server';

// Gatekeeper SOTA: Whitelist de domínios para prevenção de SSRF
const ALLOWED_BYOK_DOMAINS = new Set( [
    'api.openai.com',
    'openrouter.ai',
    'api.deepseek.com',
    'api.groq.com'
] );

interface ProxyPayload
{
    prompt: string;
    provider?: string;
    systemInstruction?: string;
    customApiKey?: string;
    customBaseUrl?: string;
    customModelName?: string;
}

async function handleByokCustom ( body: ProxyPayload )
{
    const { prompt, systemInstruction, customApiKey, customBaseUrl, customModelName } = body;

    if ( !customApiKey || !customBaseUrl || !customModelName )
    {
        return NextResponse.json( { error: 'Credenciais BYOK incompletas. Verifique as configurações.' }, { status: 401 } );
    }

    // Auditoria de Segurança: Interceptação de SSRF
    try
    {
        const urlObj = new URL( customBaseUrl );
        if ( urlObj.protocol !== 'https:' )
        {
            return NextResponse.json( { error: 'Protocolo inválido. Apenas conexões seguras (HTTPS) são permitidas no BYOK.' }, { status: 403 } );
        }
        if ( urlObj.port !== '' && urlObj.port !== '443' )
        {
            return NextResponse.json( { error: 'Porta inválida. Exfiltração de credenciais por portas não padronizadas bloqueada.' }, { status: 403 } );
        }
        if ( !ALLOWED_BYOK_DOMAINS.has( urlObj.hostname ) )
        {
            return NextResponse.json( { error: 'Domínio BYOK não autorizado pelo Cortex Shield (Proteção SSRF).' }, { status: 403 } );
        }
    } catch
    {
        return NextResponse.json( { error: 'URL BYOK malformada.' }, { status: 400 } );
    }

        // SOTA: O sufixo é forçado para o padrão OpenAI. Provedores não compatíveis (ex: Anthropic nativo) devem ser roteados via OpenRouter.
    const targetUrl = `${ customBaseUrl.replace( /\/$/, '' ) }/chat/completions`;
    const byokRes = await fetch( targetUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ customApiKey }`,
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
        throw new Error( `Upstream Provider Error: ${ byokRes.status } - ${ errorData }` );
    }
    const byokData = await byokRes.json();
    return NextResponse.json( { text: byokData.choices[ 0 ].message.content } );
}

async function handlePokerRacionalCloud ( body: ProxyPayload )
{
    const { prompt, systemInstruction } = body;

    if ( !process.env.GEMINI_API_KEY )
    {
        throw new Error( "GEMINI_API_KEY ausente no ambiente de servidor." );
    }

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${ process.env.GEMINI_API_KEY }`;
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
        throw new Error( `Upstream Provider Error (Google): ${ gRes.status } - ${ errorData }` );
    }

    const gData = await gRes.json();
    const responseText = gData.candidates?.[ 0 ]?.content?.parts?.[ 0 ]?.text || "Erro ao decodificar IA.";
    return NextResponse.json( { text: responseText } );
}

export async function POST ( req: Request )
{
    try
    {
        const bodyText = await req.text();
        if ( !bodyText ) return NextResponse.json( { error: 'Payload vazio.' }, { status: 400 } );

        const body = JSON.parse( bodyText ) as ProxyPayload;
        const { prompt, provider } = body;

        if ( !prompt || typeof prompt !== 'string' || prompt.length > 8000 )
        {
            return NextResponse.json( { error: 'Payload inválido ou excede a densidade de bytes permitida.' }, { status: 400 } );
        }

        if ( provider === 'byok-custom' )
        {
            return await handleByokCustom( body );
        }

        return await handlePokerRacionalCloud( body );

    } catch ( error: unknown )
    {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido durante parseamento JSON ou fetch.';
        console.error( '[AI_GATEWAY_ERROR] Falha na ponte proxy:', errorMessage );
        return NextResponse.json( { error: 'Falha na conexão neural. Verifique sua chave e endpoint.' }, { status: 500 } );
    }
}
