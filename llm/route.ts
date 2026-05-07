import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import util from 'node:util';
import path from 'node:path';
import fs from 'node:fs';

const execAsync = util.promisify(exec);

export async function GET() {
    try {
        // Resolvendo os paths absolutos para a infraestrutura do Kernel Python
        const pythonScript = path.resolve(process.cwd(), '../task_executor.py');
        let pythonBin = 'python';

        const venvPython = path.resolve(process.cwd(), '../.venv/Scripts/python.exe');
        if (fs.existsSync(venvPython)) {
            pythonBin = `"${venvPython}"`;
        }

        // Executa a CLI do task_executor para extrair o perfil (Autopoiese Cognitiva)
        // SOTA Guard: maxBuffer elevado para 10MB prevenindo colapso por ERR_CHILD_PROCESS_STDIO_MAXBUFFER
        const { stdout } = await execAsync(`${pythonBin} "${pythonScript}" predictive-profile`, { maxBuffer: 1024 * 1024 * 10 });

        // O orquestrador devolve um JSON puro impresso no stdout
        const profile = JSON.parse(stdout.trim());

        return NextResponse.json({ status: 'SUCCESS', profile });
    } catch (error) {
        console.error('[PREDICTIVE-PROFILE] Falha ao extrair perfil preditivo do Orquestrador:', error);
        return NextResponse.json({ status: 'ERROR', error: String(error) }, { status: 500 });
    }
}
