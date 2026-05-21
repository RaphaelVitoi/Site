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
    question: z.string().min( 2, "A pergunta deve ter no mínimo 2 caracteres." ).max( 2000, "A pergunta excede o limite de 2000 caracteres." )
} );

// SOTA: Otimização de Latência (Resolução de caminhos no Cold Start, custo O(1) em tempo de requisição)
const SCRIPT_PATH = path.resolve( process.cwd(), '../task_executor.py' );
const PYTHON_CMD = process.env.NODE_ENV === 'production' ? 'python' : path.resolve( process.cwd(), '../.venv/Scripts/python.exe' );

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
                if ( data.status === 'SUCCESS' ) return NextResponse.json( { answer: data.answer, source: 'llm' } );
            }
        } catch ( apiError: any )
        {
            console.warn( '[ORÁCULO] API offline. Acionando fallback direto no Kernel (retrieve_sota_context)... Detalhe:', apiError.message );
        }

        // SOTA: Tentativa 2 - Fallback Nativo (Apenas Recuperação de Contexto RAG + KG)
        const { stdout } = await execFileAsync( PYTHON_CMD, [ SCRIPT_PATH, 'query', question ] );

        return NextResponse.json( { answer: stdout.trim() || 'A Mente Coletiva não encontrou fragmentos relevantes.', source: 'context_only' } );
    } catch ( error: any )
    {
        console.error( '[ORÁCULO FATAL] Erro ao consultar:', error );
        return NextResponse.json( { error: error.message }, { status: 500 } );
    }
}
