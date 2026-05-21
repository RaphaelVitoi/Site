import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

export async function GET() {
    try {
        const siteRoot = path.resolve(process.cwd(), '..');
        const pythonExe = path.join(siteRoot, '.venv', 'Scripts', 'python.exe');
        const executorScript = path.join(siteRoot, 'task_executor.py');

        const { stdout, stderr } = await execAsync(`"${pythonExe}" "${executorScript}" predictive-profile`);

        if (stderr && !stdout.trim()) {
            console.error('[API Predictive] Entropia no Kernel Python:', stderr);
            throw new Error('Falha na inferência do modelo preditivo via CLI');
        }

        const jsonStr = stdout.substring(stdout.indexOf('{'));
        const profile = JSON.parse(jsonStr);

        return NextResponse.json({ profile });
    } catch (error) {
        console.warn('[API Predictive] Modelo destreinado ou offline. Acionando Fallback Base...', error);

        return NextResponse.json({
            profile: {
                'Aversão ao Risco': 0.85,
                'Pot Entrapment': 0.65,
                'Miopia de Payjump': 0.9,
                'Excesso de Agressão': 0.3,
                'Passivo Estrutural (RIO)': 0.75,
                'Desvio de Nash': 0.45
            }
        });
    }
}
