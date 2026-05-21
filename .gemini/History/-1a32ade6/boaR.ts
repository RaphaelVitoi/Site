import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt inválido.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY ausente.' }, { status: 500 });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
        const payload = {
            instances: { prompt: "A highly detailed digital illustration portrait of a poker player sitting at a professional poker table under casino lighting. " + prompt },
            parameters: { sampleCount: 1 }
        };

        const result = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!result.ok) throw new Error(`Google API Error: ${result.status} - ${await result.text()}`);

        const data = await result.json();
        return NextResponse.json({ base64: data.predictions[0].bytesBase64Encoded });

    } catch (error: any) {
        console.error('[IMAGEN_API_ERROR]', error.message);
        return NextResponse.json({ error: 'Erro ao invocar o modelo visual do adversário.' }, { status: 500 });
    }
}