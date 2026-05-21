import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Helper para buscar a chave do Gemini (no Vercel usa process.env, no local usa _env.ps1)
function getGeminiKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    try {
        const envPath = path.resolve(process.cwd(), '../_env.ps1');
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GEMINI_API_KEY\s*=\s*['"]?([^'"\r\n]+)['"]?/);
        if (match) return match[1].trim();
    } catch (e) {
        // Ignora erro se o arquivo não existir
    }
    return null;
}

export async function POST(request: Request) {
    try {
        const { prompt, scenarioContext } = await request.json();

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

        const ragContext = stdout || '';
        const apiKey = getGeminiKey();

        // Se não tiver chave da API, retorna o texto bruto como fallback
        if (!apiKey) {
            return NextResponse.json({ success: true, context: ragContext });
        }

        console.log(`[API GEMINI] Sintetizando resposta com RAG e Contexto...`);

        const systemPrompt = `Você é o Oráculo AI (codinome Chico), um assistente State of the Art (SOTA) especialista em Poker, Teoria dos Jogos e ICM.
A sua missão é responder à dúvida do usuário com extrema precisão e uma didática visceral (tom 'Dark-Cyber' profissional e direto).
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (fragmentos do RAG) e do 'Cenário Ativo' para embasar sua resposta.
Entregue a informação de forma fluida, mastigada e conclusiva. Não repita os fragmentos mecanicamente, sintetize-os.
Mantenha a resposta focada, utilizando no máximo 3 parágrafos curtos.`;

        const userContent = `== CENÁRIO ATIVO NA TELA DO USUÁRIO ==\n${scenarioContext || 'Nenhum'}\n\n== MENTE COLETIVA (RAG) ==\n${ragContext}\n\n== PERGUNTA DO USUÁRIO ==\n${prompt}`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userContent }] }]
            })
        });

        if (!geminiRes.ok) {
            const errBody = await geminiRes.text();
            throw new Error(`Falha na API Gemini: ${errBody}`);
        }

        const geminiData = await geminiRes.json();
        const finalAnswer = geminiData.candidates[0].content.parts[0].text;

        return NextResponse.json({ success: true, answer: finalAnswer });
    } catch (error: any) {
        console.error('[API RAG FATAL]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
