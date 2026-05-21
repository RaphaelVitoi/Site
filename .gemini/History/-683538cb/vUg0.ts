import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify( execFile );

// SOTA: Garantia de ambiente Node.js. O Edge Runtime não suporta execFile.
export const runtime = 'nodejs';

// SOTA: Resolução do Córtex Central SOTA (Python) O(1)
const SCRIPT_PATH = path.resolve( process.cwd(), '../task_executor.py' );
const PYTHON_CMD = process.env.NODE_ENV === 'production' ? 'python' : path.resolve( process.cwd(), '../.venv/Scripts/python.exe' );

const getErrorMessage = ( error: unknown ): string => {
    if ( error instanceof Error ) return error.message;
    if ( typeof error === 'string' ) return error;
    return JSON.stringify( error );
};

export async function GET () {
    try
    {
        // SOTA: Fricção Zero. Delega a extração pesada do Grafo de Conhecimento (SQLite) para a camada nativa (Python).
        // Timeout de 10s impede Deadlocks de UI caso o SQLite esteja travado.
        const { stdout } = await execFileAsync( PYTHON_CMD, [ SCRIPT_PATH, 'kg-export' ], { timeout: 10000 } );

        const graphData = JSON.parse( stdout.trim() );

        if ( graphData.error )
        {
            throw new Error( graphData.error );
        }

        return NextResponse.json( graphData );
    } catch ( error: unknown )
    {
        const errorMessage = getErrorMessage( error );
        console.error( '[KG API FATAL] Falha estrutural ao extrair Grafo:', errorMessage );
        return NextResponse.json( { error: 'O Córtex Ontológico não pôde ser acessado.' }, { status: 500 } );
    }
}
