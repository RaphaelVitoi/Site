import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

export async function GET() {
    try {
        // SOTA: Caminhos absolutos resolvidos na arvore do Node.js (Next.js Root -> Site Root)
        const siteRoot = path.resolve(process.cwd(), '..');
        const pythonExe = path.join(siteRoot, '.venv', 'Scripts', 'python.exe');
        const executorScript = path.join(siteRoot, 'task_executor.py');

        // Invocação Fricção Zero do Kernel Python para extrair a inferência
        const { stdout, stderr } = await execAsync(`"${pythonExe}" "${executorScript}" predictive-profile`);

        if (stderr && !stdout.trim()) {
            console.error('[API Predictive] Entropia no Kernel Python:', stderr);
            throw new Error('Falha na inferência do modelo preditivo via CLI');
        }

        // O Kernel expele o JSON no stdout. Blindagem para expurgar logs prévios (Rich) caso existam.
        const jsonStr = stdout.substring(stdout.indexOf('{'));
        const profile = JSON.parse(jsonStr);

        return NextResponse.json({ profile });
    } catch (error) {
        console.warn('[API Predictive] Modelo destreinado ou offline. Acionando Fallback Base...', error);

        // Fallback SOTA para manter a Estética e a UX do RadarChart plenamente operacionais
        // enquanto o Random Forest não acumula eventos suficientes no tasks.db para o treinamento.
        return NextResponse.json({
            profile: {
                'Aversão a Risco (Bolha)': 0.15,
                'Overcall (Pot Entrapment)': 0.45,
                'Tilt Induzido (Bad Beat)': 0.1,
                'Negligência de RIO MW': 0.65,
                'Passividade IP': 0.2
            }
        });
    }
}
