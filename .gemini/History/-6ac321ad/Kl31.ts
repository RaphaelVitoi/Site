import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';

const execFileAsync = promisify( execFile );

// SOTA: Garantia de ambiente Node.js devido ao uso estrito de child_process. Edge Runtime causaria falha fatal.
export const runtime = 'nodejs';

// SOTA: Validação Estrita de Contrato via Zod
const oraclePayloadSchema = z.object( {
    question: z.string().min( 2, "A pergunta deve ter no mínimo 2 caracteres." ).max( 2000, "A pergunta excede o limite de 2000 caracteres." ),
    provider: z.string().optional(),
    customApiKey: z.string().optional(),
    customBaseUrl: z.string().optional(),
    customModelName: z.string().optional()
} );

// SOTA: Otimização de Latência (Resolução de caminhos no Cold Start, custo O(1) em tempo de requisição)
const SCRIPT_PATH = path.resolve( process.cwd(), '../task_executor.py' );
const PYTHON_CMD = process.env.NODE_ENV === 'production' ? 'python' : path.resolve( process.cwd(), '../.venv/Scripts/python.exe' );

// SOTA: Extração da sanitização de erro para erradicar coerção cega para '[object Object]' (SonarLint S6551).
const getErrorMessage = ( error: unknown ): string => {
    if ( error instanceof Error ) return error.message;
    if ( typeof error === 'string' ) return error;
    return JSON.stringify( error );
};

// SOTA: Conversor de JSON Assíncrono para Stream SSE (Fricção Zero)
function createSSEStream ( answer: string, source: string ) {
    const encoder = new TextEncoder();
    let isCancelled = false; // SOTA: Chave de interrupção para estancar o loop e prevenir Memory Leaks

    const stream = new ReadableStream( {
        async start ( controller ) {
            try
            {
                controller.enqueue( encoder.encode( `data: ${JSON.stringify( { source } )}\n\n` ) );
                const chunkSize = 25; // Transmissão cadenciada para fluidez visual no frontend
                for ( let i = 0; i < answer.length; i += chunkSize )
                {
                    if ( isCancelled ) break;
                    const chunk = answer.slice( i, i + chunkSize );
                    controller.enqueue( encoder.encode( `data: ${JSON.stringify( { answerToken: chunk } )}\n\n` ) );
                    // Retardo mínimo para ceder o event loop e criar o efeito visual orgânico
                    await new Promise( r => setTimeout( r, 15 ) );
                }
                if ( !isCancelled )
                {
                    controller.enqueue( encoder.encode( `data: [DONE]\n\n` ) );
                    controller.close();
                }
            } catch ( e )
            {
                if ( !isCancelled ) controller.error( e );
            }
        },
        cancel () {
            isCancelled = true; // Gatilho acionado nativamente se o client quebrar a conexão TCP
        }
    } );
    return new Response( stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    } );
}

export async function POST ( request: Request ) {
    try
    {
        const body = await request.json();
        const validation = oraclePayloadSchema.safeParse( body );

        if ( !validation.success )
        {
            return NextResponse.json( { error: validation.error.issues[ 0 ].message }, { status: 400 } );
        }

        const { question } = validation.data;
        let contextStr = 'A Mente Coletiva não encontrou fragmentos relevantes.';

        // SOTA: Tentativa 1 - Orquestrador Híbrido (API HTTP c/ LLM)
        try
        {
            const response = await fetch( 'http://127.0.0.1:17042/ask-oracle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...( process.env.API_SECRET_TOKEN ? { 'Authorization': `Bearer ${process.env.API_SECRET_TOKEN}` } : {} )
                },
                body: JSON.stringify( { question, n_results: 3 } ),
                signal: AbortSignal.timeout( 30000 )
            } );

            if ( response.ok )
            {
                const data = await response.json();
                if ( data.status === 'SUCCESS' ) contextStr = data.answer;
            }
        } catch ( apiError: unknown )
        {
            const errorMessage = getErrorMessage( apiError );
            console.warn( '[ORÁCULO] API offline. Acionando fallback direto no Kernel (retrieve_sota_context)... Detalhe:', errorMessage );
        }

        // Se a API falhou, roda o fallback Nativo (RAG Local) para extrair o contexto a Custo Zero
        if ( contextStr === 'A Mente Coletiva não encontrou fragmentos relevantes.' )
        {
            try
            {
                const { stdout } = await execFileAsync( PYTHON_CMD, [ SCRIPT_PATH, 'query', question ], { timeout: 15000 } );
                contextStr = stdout.trim() || contextStr;
            } catch ( e: unknown )
            {
                console.warn( '[ORÁCULO] Falha no fallback CLI RAG:', getErrorMessage( e ) );
            }
        }

        // SOTA BYOK: O RAG extraiu os documentos locais (Custo 0 para o servidor).
        // Agora, se o aluno enviou as credenciais, usamos a chave DELE para sintetizar a resposta.
        const { provider, customApiKey, customBaseUrl, customModelName } = validation.data;
        let finalAnswer = contextStr; // Se não houver chave, retorna os documentos brutos

        if ( provider === 'byok-custom' && customApiKey && customBaseUrl && customModelName )
        {
            const targetUrl = `${customBaseUrl.replace( /\/$/, '' )}/chat/completions`;
            const byokRes = await fetch( targetUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${customApiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    model: customModelName,
                    messages: [
                        { role: "system", content: `Você é o Oráculo de Poker SOTA. Formule uma resposta didática e coesa para a pergunta do usuário baseando-se ESTRITAMENTE nos fragmentos de memória a seguir. Não invente conceitos fora do que lhe foi fornecido:\n\n${contextStr}` },
                        { role: "user", content: question }
                    ]
                } )
            } );

            if ( byokRes.ok )
            {
                const byokData = await byokRes.json();
                finalAnswer = byokData.choices[ 0 ].message.content || contextStr;
            }
        }

        return createSSEStream( finalAnswer, provider === 'byok-custom' ? 'llm-byok' : 'context_only' );
    } catch ( error: unknown )
    {
        const errorMessage = getErrorMessage( error );
        console.error( '[ORÁCULO FATAL] Erro ao consultar:', errorMessage );
        return NextResponse.json( { error: errorMessage }, { status: 500 } );
    }
}
