import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';

const execFileAsync = promisify( execFile );

// SOTA: Validação Estrita de Contrato via Zod
const oraclePayloadSchema = z.object( {
    question: z.string().min( 2, "A pergunta deve ter no mínimo 2 caracteres." ).max( 2000, "A pergunta excede o limite de 2000 caracteres." )
} );

export async function POST ( request: Request ) {
    try
    {
        const body = await request.json();
        const validation = oraclePayloadSchema.safeParse( body );

        if ( !validation.success )
        {
            return NextResponse.json( { error: validation.error.issues[ 0 ].message }, { status: 400 } );
        }

        const pythonCmd = process.env.NODE_ENV === 'production' ? 'python' : path.resolve( process.cwd(), '../.venv/Scripts/python.exe' );
        const { stdout } = await execFileAsync( pythonCmd, [ scriptPath, 'query', question ] );

        return NextResponse.json( { answer: stdout.trim() || 'A Mente Coletiva não encontrou fragmentos relevantes.', source: 'context_only' } );
    } catch ( error: any )
    {
        console.error( '[ORÁCULO FATAL] Erro ao consultar:', error );
        return NextResponse.json( { error: error.message }, { status: 500 } );
    }
}
