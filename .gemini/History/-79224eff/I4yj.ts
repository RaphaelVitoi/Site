import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // SOTA: Fricção Zero. Substituímos o gargalo do CLI Python (execAsync)
        // por um fetch direto ao micro-servidor aiohttp em RAM (latência < 5ms).
        const token = process.env.API_SECRET_TOKEN || '';
        const res = await fetch('http://127.0.0.1:17042/predictive-profile', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            next: { revalidate: 0 } // Bypass cache para leitura dinâmica (Autopoiese)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.warn('[API Predictive] Modelo destreinado ou offline. Acionando Fallback Base...', error);

        return NextResponse.json({
            profile: {
                'Aversão ao Risco': 0.85,
                'Pot Entrapment': 0.65,
                'Miopia de Payjump': 0.9,
                'Excesso de Agressão': 0.3,
                'Passivo Estrutural (RIO)': 0.75,
                'Desvio de Nash': 0.45
            }
        });
    }
}
