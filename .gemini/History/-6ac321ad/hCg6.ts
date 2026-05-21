import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';
import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

// Invariante: O acesso direto ao SO via child_process bloqueia o Edge Runtime.
export const runtime = 'nodejs';

const execAsync = promisify( exec );

export async function POST ( req: NextRequest ) {
    try
    {
        const body = await req.json();
        const { metrics, spot } = body;

        // 1. Extração RAG via Node Child Process (Custo Zero Backend)
        let ragContext = '';
        try
        {
            const query = `Risk Premium de ${metrics?.riskPremium}% com Vetor Monopólio de ${metrics?.monopolyVector}`;

            // Resolução cirúrgica baseada no process.cwd() que, no App Router Node, aponta pra raiz da sub-pasta ou workspace.
            const rootDir = path.resolve( process.cwd(), '..' );
            const venvPython = path.join( rootDir, '.venv', 'Scripts', 'python.exe' );
            const pythonCmd = fs.existsSync( venvPython ) ? `"${venvPython}"` : 'python';
            const scriptPath = path.join( rootDir, 'memory_rag.py' );

            const command = `${pythonCmd} "${scriptPath}" query "${query}"`;

            const { stdout } = await execAsync( command );
            ragContext = stdout;
        } catch ( err )
        {
            console.warn( '[RAG SOTA] Falha ao extrair contexto python:', err );
            ragContext = 'Contexto da Mente Coletiva temporariamente indisponível (Fallback ativo).';
        }

        // 2. Resolução da Chave de API (BYOK Header ou Backend Environment)
        const apiKey = req.headers.get( 'x-api-key' ) || process.env.GEMINI_API_KEY;

        if ( !apiKey )
        {
            return new Response(
                '[ENTROPIA CRÍTICA] Chave de API do Gemini não detectada. Configure a GEMINI_API_KEY ou envie via BYOK.',
                { status: 401 }
            );
        }

        // 3. Orquestração do Modelo Gemini SOTA (Streaming O(1))
        const genAI = new GoogleGenerativeAI( apiKey );
        const model = genAI.getGenerativeModel( {
            model: 'gemini-1.5-pro',
            systemInstruction: "Você é o Oráculo Híbrido SOTA, especializado na Perspectiva Matemática de Raphael Vitoi. Seu papel é atuar como mentor tático. Seja direto, sombrio, analítico e cirúrgico. Abomine 'fluff' e trivialidades. Fricção Zero. Estruture em markdown."
        } );

        const prompt = `
[ESTADO QUÂNTICO ATUAL]
- Hero Invested: ${spot?.heroInvested} bb
- Pot Total: ${spot?.pot} bb
- Distribuição (Stacks): ${spot?.stacks?.join( ' bb, ' )} bb
- Vetor Monopólio (Tensão): ${metrics?.monopolyVector}
- Risk Premium (Dor Pura): ${metrics?.riskPremium}%
- Perspectiva Matemática: ${metrics?.perspective}

[MEMÓRIA COLETIVA RAG]
${ragContext}

SÍNTESE EXIGIDA:
Analisando a Tensão (Vetor Monopólio) e a Dor (Risk Premium) do spot, qual é a ação estratégica SOTA a ser tomada? Relate os riscos invisíveis do Downward Drift ou RIO em até 3 parágrafos de altíssima densidade.
`;

        const result = await model.generateContentStream( prompt );

        const stream = new ReadableStream( {
            async start ( controller ) {
                try
                {
                    for await ( const chunk of result.stream )
                    {
                        const chunkText = chunk.text();
                        if ( chunkText )
                        {
                            controller.enqueue( new TextEncoder().encode( chunkText ) );
                        }
                    }
                    controller.close();
                } catch ( e )
                {
                    controller.error( e );
                }
            }
        } );

        return new Response( stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } } );
    } catch ( error: unknown )
    {
        const msg = error instanceof Error ? error.message : 'Ruptura interdimensional desconhecida.';
        return new Response( `[ENTROPIA SISTÊMICA] Falha no Oráculo: ${msg}`, { status: 500 } );
    }
}
