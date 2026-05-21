import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, provider, customApiKey, customBaseUrl, customModelName } = body;
        const { prompt } = body;

        if (!prompt) return NextResponse.json({ error: 'Prompt vazio.' }, { status: 400 });
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt inválido.' }, { status: 400 });
        }

        const systemInstruction = `Você é um solver HRC avançado. Gere um JSON EXATO de um cenário de ICM de poker baseado no prompt do usuário. NÃO retorne markdown ou formatação (como \`\`\`json). Apenas o JSON cru. 
        SCHEMA OBRIGATÓRIO DE SAÍDA:
        {
          "id": "string (slug único curto)",
          "title": "string (Título de impacto, ex: A Armadilha do CL)",
          "env": "string (Contexto, ex: Bolha da FT)",
          "icon": "emoji (ex: 🎯)",
          "verdict": { "label": "string", "class": "text-sky-400 border-sky-500/30 (use tailwind cores)" },
          "ip": { "pos": "string", "stack": "string (ex: 40 bb)", "rp": number, "morph": "string (ex: Polar)" },
          "oop": { "pos": "string", "stack": "string", "rp": number, "morph": "string" },
          "theory": "<h3 class='text-white font-bold text-xl mb-3'>Título</h3><p class='text-slate-300'>HTML para teoria de alto nível.</p>",
          "exploit": "<h3 class='text-indigo-400 font-bold text-xl mb-3'>Exploit</h3><p class='text-slate-300'>HTML descrevendo tática.</p>",
          "quiz": {
             "q": "string",
             "opts": [ { "isCorrect": boolean, "text": "string" }, { "isCorrect": boolean, "text": "string" } ],
             "exp": "string (Por que a resposta está certa?)"
          }
        }`;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY ausente.' }, { status: 500 });
        }

        let targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        let headers: any = { 'Content-Type': 'application/json' };
        let payload: any = {
            contents: [{ parts: [{ text: "Crie a matriz para: " + prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: { responseMimeType: "application/json" }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
            const payload = {
                instances: { prompt: "A highly detailed digital illustration portrait of a poker player sitting at a professional poker table under casino lighting. " + prompt },
                parameters: { sampleCount: 1 }
            };

            // Se o usuário estiver no modo BYOK (Traga a sua Própria Chave), rotacionamos o Endpoint:
            if(provider === 'byok-custom' && customApiKey && customBaseUrl) {
                targetUrl = `${customBaseUrl.replace(/\/$/, '')}/chat/completions`;
        headers['Authorization'] = `Bearer ${customApiKey}`;
        payload = {
            model: customModelName || 'gpt-4o',
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: "Crie a matriz em JSON para: " + prompt }
            ]
        };
    }
        const result = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const res = await fetch(targetUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Provider Error: ${await res.text()}`);
    if (!result.ok) throw new Error(`Google API Error: ${result.status} - ${await result.text()}`);

    const data = await res.json();

    // Parse agnóstico: Gemini usa candidates[0].content, OpenAI/OpenRouter usa choices[0].message
    let jsonText = "";
    if (data.candidates) jsonText = data.candidates[0].content.parts[0].text;
    else if (data.choices) jsonText = data.choices[0].message.content;

    // Limpeza de markdown de fallback, caso a IA erre a instrução e envie ```json
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(jsonText));

    const data = await result.json();
    return NextResponse.json({ base64: data.predictions[0].bytesBase64Encoded });

} catch (error: any) {
    console.error('[GENERATE_SCENARIO_ERROR]', error.message);
    return NextResponse.json({ error: 'Falha na compilação estruturada do cenário.' }, { status: 500 });
    console.error('[IMAGEN_API_ERROR]', error.message);
    return NextResponse.json({ error: 'Erro ao invocar o modelo visual do adversário.' }, { status: 500 });
}
}