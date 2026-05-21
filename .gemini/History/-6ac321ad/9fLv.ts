import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, systemInstruction, provider, customApiKey, customBaseUrl, customModelName } = body;

        // [SECURITY GATE] Sanitização básica
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
        }

        let responseText = "";

        switch (provider) {
            case 'byok-custom':
                if (!customApiKey || !customBaseUrl || !customModelName) {
                    return NextResponse.json({ error: 'Credenciais BYOK incompletas. Verifique as configurações.' }, { status: 401 });
                }

                // Executa a requisição para o endpoint soberano do cliente (Proxy Cego)
                const targetUrl = `${customBaseUrl.replace(/\/$/, '')}/chat/completions`;
                const byokRes = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${customApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: customModelName,
                        messages: [
                            { role: "system", content: systemInstruction || "Você é um assistente lógico." },
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!byokRes.ok) {
                    // Extrai o erro do provedor (Anthropic, OpenAI, etc), mas nunca loga a chave
                    const errorData = await byokRes.text();
                    throw new Error(`Upstream Provider Error: ${byokRes.status} - ${errorData}`);
                }

                const byokData = await byokRes.json();
                responseText = byokData.choices[0].message.content;
                break;

            case 'openrouter-free':
                responseText = "[SIMULAÇÃO] Roteamento para Llama 3 via OpenRouter gratuito seria feito aqui.";
                break;

            case 'ollama-local':
                responseText = "[SIMULAÇÃO] Roteamento para localhost:11434 seria feito aqui.";
                break;

            default:
                return NextResponse.json({ error: 'Provedor neural não suportado.' }, { status: 400 });
        }

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error('[AI_GATEWAY_ERROR] Falha na ponte proxy:', error.message);
        return NextResponse.json({ error: 'Falha na conexão neural. Verifique sua chave e endpoint.' }, { status: 500 });
    }
}