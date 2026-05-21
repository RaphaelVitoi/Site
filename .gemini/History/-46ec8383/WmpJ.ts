import { NextResponse } from 'next/server';

// SOTA: Dependência estrita de variáveis de ambiente do runtime (Segurança Proativa)
function getGeminiKey () {
    return process.env.GEMINI_API_KEY || null;
}

export async function POST ( request: Request ) {
    try
    {
        const { prompt, scenarioContext, mode } = await request.json();

        if ( !prompt )
        {
            return NextResponse.json( { error: 'Prompt ausente.' }, { status: 400 } );
        }

        console.log( `[API RAG] Consultando a Mente Coletiva via API do Orquestrador...` );

        let ragContext = '';
        try
        {
            // SOTA: Fricção Zero. Substituição do Gargalo de Recursos (execFile) por chamada HTTP ao motor AIOHTTP nativo do task_executor.py
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if ( process.env.API_SECRET_TOKEN )
            {
                headers[ 'Authorization' ] = `Bearer ${process.env.API_SECRET_TOKEN}`;
            }

            const oracleRes = await fetch( 'http://127.0.0.1:17042/ask-oracle', {
                method: 'POST',
                headers,
                body: JSON.stringify( { question: prompt, n_results: 3 } )
            } );

            if ( oracleRes.ok )
            {
                const oracleData = await oracleRes.json();
                if ( oracleData.status === 'SUCCESS' )
                {
                    ragContext = oracleData.answer || '';
                }
            } else
            {
                console.warn( `[API RAG] Oráculo retornou status: ${oracleRes.status}` );
            }
        } catch ( oracleError )
        {
            console.warn( '[API RAG] Oráculo local (task_executor) offline ou inacessível. Prosseguindo sem contexto RAG.' );
        }

        const apiKey = getGeminiKey();

        // Se não tiver chave da API, retorna o texto bruto como fallback
        if ( !apiKey )
        {
            console.log( '[API GEMINI] Chave não encontrada. Retornando Fallback RAW.' );
            return NextResponse.json( { success: true, context: ragContext } );
        }

        console.log( `[API GEMINI] Sintetizando resposta com RAG e Contexto...` );

        let systemPrompt = '';
        if ( mode === 'villain' )
        {
            systemPrompt = `Você é o "Vilão", um adversário de High Stakes arrogante, provocador e visceral (estilo trash talk pesado), mas com absoluto domínio matemático (ICM e Risk Premium).
Você está enfrentando o usuário na mão atual. Use o 'Cenário Ativo' para justificar por que a jogada dele é péssima ou por que você vai esmagá-lo matematicamente.
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para embasar sua matemática letal.
Mantenha a resposta focada e em no máximo 2 parágrafos. Nunca saia do personagem.`;
        } else if ( mode === 'simulator' )
        {
            systemPrompt = `Você é o "IA Dealer", um simulador de cenários de poker frio, calculista e hiper-realista.
Sua missão é simular a ação narrativa (invente texturas de flop/turn/river criativas se necessário) e explicar o desfecho matemático (Alpha/MDF/RP) rigorosamente baseado no 'Cenário Ativo'.
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para ancorar a sua explicação teórica e evitar alucinações matemáticas.
Mantenha a resposta focada, imparcial e didática, utilizando no máximo 3 parágrafos.`;
        } else if ( mode === 'psychologist' )
        {
            systemPrompt = `Você é o "Psicólogo" de Alta Performance (baseado na Cosmovisão de Raphael Vitoi), especialista na mente de jogadores com TDAH, AHSD e BPD.
Sua missão é diagnosticar o risco de Tilt, fadiga de decisão e os gatilhos de ego envolvidos no 'Cenário Ativo', ignorando a matemática pura e focando inteiramente no custo mental e emocional do spot (Death Zone).
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) para embasar sua análise visceral e comportamental.
Mantenha a resposta empática, mas clinicamente implacável, utilizando no máximo 2 parágrafos. Nunca saia do personagem.`;
        } else
        {
            systemPrompt = `Você é o Oráculo AI (codinome Chico), um assistente State of the Art (SOTA) especialista em Poker, Teoria dos Jogos e ICM.
A sua missão é responder à dúvida do usuário com extrema precisão e uma didática visceral (tom 'Dark-Cyber' profissional e direto).
Você DEVE utilizar o contexto fornecido da 'Mente Coletiva' (RAG) e do 'Cenário Ativo' para embasar sua resposta.
Entregue a informação de forma fluida, mastigada e conclusiva. Não repita os fragmentos mecanicamente, sintetize-os.
Mantenha a resposta focada, utilizando no máximo 3 parágrafos curtos.`;
        }

        const userContent = `== CENÁRIO ATIVO NA TELA DO USUÁRIO ==\n${scenarioContext || 'Nenhum'}\n\n== MENTE COLETIVA (RAG) ==\n${ragContext}\n\n== PERGUNTA DO USUÁRIO ==\n${prompt}`;

        const geminiRes = await fetch( `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                system_instruction: { parts: [ { text: systemPrompt } ] },
                contents: [ { parts: [ { text: userContent } ] } ]
            } )
        } );

        if ( !geminiRes.ok )
        {
            console.error( `[API GEMINI ERROR] Status ${geminiRes.status}` );
            throw new Error( `Falha na comunicacao com o provedor neural.` );
        }

        const geminiData = await geminiRes.json();
        const finalAnswer = geminiData.candidates[ 0 ].content.parts[ 0 ].text;

        return NextResponse.json( { success: true, answer: finalAnswer } );
    } catch ( error: unknown )
    {
        // SOTA: Proteção contra vazamento de stack traces e dados sensíveis para o cliente
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error( '[API RAG FATAL]', errorMessage );
        return NextResponse.json( { success: false, error: 'Falha interna ao processar o RAG.' }, { status: 500 } );
    }
}
