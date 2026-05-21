import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt ausente.' }, { status: 400 });
        }

        // O Next.js roda a partir da pasta 'frontend', então subimos um nível
        // para acessar o motor Python na raiz do projeto.
        const scriptPath = path.resolve(process.cwd(), '../memory_rag.py');

        // Sanitização básica para evitar injeção de shell no terminal Windows
        const safePrompt = prompt.replace(/"/g, '\\"');

        console.log(`[API RAG] Consultando a Mente Coletiva: "${safePrompt}"`);

        // Aciona a Busca Híbrida do ChromaDB
        const { stdout, stderr } = await execAsync(`python "${scriptPath}" query "${safePrompt}"`);

        if (stderr && !stdout) {
            console.warn('[RAG WARNING]', stderr);
        }

        // Retorna os fragmentos contextuais de volta para a UI do Simulador
        return NextResponse.json({ success: true, context: stdout });
    } catch (error: any) {
        console.error('[API RAG FATAL]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}