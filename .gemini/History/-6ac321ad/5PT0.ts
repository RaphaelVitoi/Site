import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify( execFile );

export async function POST ( request: Request ) {
    try
    {
        const { question } = await request.json();

        if ( !question || typeof question !== 'string' )
        {
            return NextResponse.json( { error: 'Pergunta inválida.' }, { status: 400 } );
        }

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

        } catch ( apiError )
        {
            console.warn( '[ORÁCULO] API offline. Acionando fallback direto no Kernel (retrieve_sota_context)...' );
        }

        // SOTA: Tentativa 2 - Fallback Nativo (Apenas Recuperação de Contexto RAG + KG)
        const scriptPath = path.resolve( process.cwd(), '../task_executor.py' );
        const pythonCmd = process.env.NODE_ENV === 'production' ? 'python' : path.resolve( process.cwd(), '../.venv/Scripts/python.exe' );
        const { stdout } = await execFileAsync( pythonCmd, [ scriptPath, 'query', question ] );

        return NextResponse.json( { answer: stdout.trim() || 'A Mente Coletiva não encontrou fragmentos relevantes.', source: 'context_only' } );
    } catch ( error: any )
    {
        console.error( '[ORÁCULO FATAL] Erro ao consultar:', error );
        return NextResponse.json( { error: error.message }, { status: 500 } );
    }
}
