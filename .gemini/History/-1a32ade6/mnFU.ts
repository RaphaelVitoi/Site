import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, systemInstruction, provider, customApiKey, customBaseUrl, customModelName } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
        }

        let responseText = "";

        switch (provider) {
            case 'byok-custom':
                if (!customApiKey || !customBaseUrl || !customModelName) {
                    return NextResponse.json({ error: 'Credenciais BYOK incompletas. Verifique as configurações.' }, { status: 401 });
                }
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
                            { role: "system", content: systemInstruction || "Você é um assistente lógico especialista em Teoria dos Jogos e ICM no Poker." },
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!byokRes.ok) {
                    const errorData = await byokRes.text();
                    throw new Error(`Upstream Provider Error: ${byokRes.status} - ${errorData}`);
                }
                const byokData = await byokRes.json();
                responseText = byokData.choices[0].message.content;
                break;

            case 'pokerracional-cloud':
            default:
                const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                const gRes = await fetch(googleUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        systemInstruction: { parts: [{ text: systemInstruction || "Você é Raphael Vitoi, especialista em ICM." }] }
                    })
                });
                if (!gRes.ok) throw new Error("Falha no provedor nativo.");
                const gData = await gRes.json();
                responseText = gData.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao decodificar IA.";
                break;
        }

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error('[AI_GATEWAY_ERROR] Falha na ponte proxy:', error.message);
        return NextResponse.json({ error: 'Falha na conexão neural. Verifique sua chave e endpoint.' }, { status: 500 });
    }
}