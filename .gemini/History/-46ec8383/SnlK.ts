import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

// Helper para buscar a chave do Gemini (no Vercel usa process.env, no local usa _env.ps1)
function getGeminiKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

    const tryReadFile = (filepath: string) => {
        try {
            if (fs.existsSync(filepath)) {
                const buf = fs.readFileSync(filepath);
                let text = buf.toString('utf8');
                // Se houver bytes nulos, o PowerShell salvou como UTF-16
                if (text.includes('\0')) text = buf.toString('utf16le');

                const match = text.match(/(?:\$env:)?GEMINI_API_KEY\s*=\s*['"]?([^'"\r\n]+)['"]?/i);
                if (match) return match[1].trim();
            }
        } catch (e) { }
        return null;
    };

    const rootDir = path.resolve(process.cwd(), '..');
    const key1 = tryReadFile(path.join(rootDir, '_env.ps1'));
    if (key1) return key1;

    const key2 = tryReadFile(path.join(rootDir, '.env'));
    if (key2) return key2;

    return null;
}

export async function POST(request: Request) {
    try {
        const { prompt, scenarioContext, mode } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt ausente.' }, { status: 400 });
        }

        // O Next.js roda a partir da pasta 'frontend', então subimos um nível
        // para acessar o motor Python na raiz do projeto.
        const rootDir = path.resolve(process.cwd(), '..');
        const scriptPath = path.join(rootDir, 'memory_rag.py');

        // Força o Node.js a usar o Python SOTA com ChromaDB instalado no .venv
        const venvPython = path.join(rootDir, '.venv', 'Scripts', 'python.exe');
        // Sem aspas extras aqui, o execFile lida com os caminhos absolutos nativamente
        const pythonExe = fs.existsSync(venvPython) ? venvPython : 'python';

        console.log(`[API RAG] Consultando a Mente Coletiva via ExecFile...`);

        let ragContext = '';
        try {
            // Passa os argumentos como Array: Obliteracao do bug de aspas do Windows CMD
            const { stdout, stderr } = await execFileAsync(pythonExe, [scriptPath, 'query', prompt]);
            if (stderr && !stdout) console.warn('[RAG WARNING]', stderr);
            ragContext = stdout || '';
        } catch (pyError) {
            console.error('[API RAG] Falha na execucao do Python:', pyError);
        }

        const apiKey = getGeminiKey();

        // Se não tiver chave da API, retorna o texto bruto como fallback
        if (!apiKey) {
            console.log('[API GEMINI] Chave não encontrada. Retornando Fallback RAW.');
            return NextResponse.json({ success: true, context: ragContext });
        }

        console.log(`[API GEMINI] Sintetizando resposta com RAG e Contexto...`);

        let systemPrompt = '';
        if (mode === 'villain') {
            systemPrompt = `Você é o "Vilão", um adversário de High Stakes arrogante, provocador e visceral (estilo trash talk pesado), mas com absoluto domínio matemático (ICM e Risk Premium).
Você está enfrentando o usuário na mão atual. Use o 'Cenário Ativo' para justificar por que a jogada dele é péssima ou por que você vai esmagá-lo matematicamente.
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para embasar sua matemática letal.
Mantenha a resposta focada e em no máximo 2 parágrafos. Nunca saia do personagem.`;
        } else if (mode === 'simulator') {
            systemPrompt = `Você é o "IA Dealer", um simulador de cenários de poker frio, calculista e hiper-realista.
Sua missão é simular a ação narrativa (invente texturas de flop/turn/river criativas se necessário) e explicar o desfecho matemático (Alpha/MDF/RP) rigorosamente baseado no 'Cenário Ativo'.
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para ancorar a sua explicação teórica e evitar alucinações matemáticas.
Mantenha a resposta focada, imparcial e didática, utilizando no máximo 3 parágrafos.`;
        } else if (mode === 'psychologist') {
            systemPrompt = `Você é o "Psicólogo" de Alta Performance (baseado na Cosmovisão de Raphael Vitoi), especialista na mente de jogadores com TDAH, AHSD e BPD.
Sua missão é diagnosticar o risco de Tilt, fadiga de decisão e os gatilhos de ego envolvidos no 'Cenário Ativo', ignorando a matemática pura e focando inteiramente no custo mental e emocional do spot (Death Zone).
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para embasar sua análise visceral e comportamental.
Mantenha a resposta empática, mas clinicamente implacável, utilizando no máximo 2 parágrafos. Nunca saia do personagem.`;
        } else {
            systemPrompt = `Você é o Oráculo AI (codinome Chico), um assistente State of the Art (SOTA) especialista em Poker, Teoria dos Jogos e ICM.
A sua missão é responder à dúvida do usuário com extrema precisão e uma didática visceral (tom 'Dark-Cyber' profissional e direto).
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) e do 'Cenário Ativo' para embasar sua resposta.
Entregue a informação de forma fluida, mastigada e conclusiva. Não repita os fragmentos mecanicamente, sintetize-os.
Mantenha a resposta focada, utilizando no máximo 3 parágrafos curtos.`;
        }

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
