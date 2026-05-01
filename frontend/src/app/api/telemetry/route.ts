import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { TelemetryPayloadSchema } from '@/lib/schemas';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const validated = TelemetryPayloadSchema.safeParse(payload);

        if (!validated.success) {
            return NextResponse.json(
                { success: false, error: 'Contrato semantico violado.' },
                { status: 400 },
            );
        }

        const data = validated.data;
        
        // SOTA: Persistência Fire-and-Forget. 
        // Não aguardamos o Prisma para responder ao cliente (Latência O(1)).
        (async () => {
            try {
                const event = await (prisma as any).telemetryEvent.create({
                    data: {
                        category: data.category,
                        scenarioContext: data.scenarioContext ? JSON.stringify(data.scenarioContext) : null,
                        userAction: data.userAction || null,
                        optimalAction: data.optimalAction || null,
                        evLoss: data.evLoss ?? 0,
                        isCorrect: data.isCorrect ?? true,
                        latency: data.latency ?? 0,
                        componentName: data.componentName,
                        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
                    },
                });

                if ((data.evLoss ?? 0) > 10) {
                    console.warn(`[SOTA-CRITICAL-MISPLAY] Event ID: ${event.id} | EV Loss: ${data.evLoss}%`);
                }
            } catch (err) {
                console.error('[TELEMETRY API] Background persistence failure', err);
            }
        })();

        // Resposta imediata
        return NextResponse.json({ success: true, message: 'Evento despachado para persistência.' });
    } catch (error) {
        console.error('[TELEMETRY API] Payload malformed', error);
        return NextResponse.json(
            { success: false, error: 'Falha na termodinamica de persistencia.' },
            { status: 500 },
        );
    }
}
