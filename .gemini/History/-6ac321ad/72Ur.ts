import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify( exec );

export async function GET () {
    try
    {
        // SOTA: Invoca o Kernel Python de forma isolada para extrair o estado atual da ontologia
        const scriptPath = path.resolve( process.cwd(), '../task_executor.py' );
        const pythonCmd = process.env.NODE_ENV === 'production' ? 'python' : path.resolve( process.cwd(), '../.venv/Scripts/python.exe' );

        const { stdout } = await execAsync( `"${pythonCmd}" "${scriptPath}" kg-export` );

        const jsonMatch = stdout.match( /\{"nodes":\s*\[.*\}/s );
        if ( jsonMatch )
        {
            return NextResponse.json( JSON.parse( jsonMatch[ 0 ] ) );
        }
        return NextResponse.json( JSON.parse( stdout.trim() ) );
    } catch ( error: any )
    {
        return NextResponse.json( { error: error.message }, { status: 500 } );
    }
}
