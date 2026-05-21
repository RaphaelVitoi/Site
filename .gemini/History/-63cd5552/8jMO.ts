"use server"

/**
 * IDENTITY: SOTA Telemetry Server Engine
 * PATH: src/components/telemetry.ts
 * ROLE: Persistência e validação de inteligência analítica sistêmica.
 * PRINCIPLE: Economia Generalizada (Shannon) - Redução de ruído e erro.
 */

import prisma from "@/lib/prisma";
import { TelemetryPayload, TelemetryPayloadSchema } from "@/lib/schemas";

/**
 * Registra um evento de telemetria no banco de dados com validação rigorosa.
 * Projetado para suportar auditoria matemática e performance.
 */
export async function logTelemetryEvent( payload: TelemetryPayload ) {
    try {
        // Validação Antevisão: Garante que apenas dados coerentes entrem no sistema
        const validated = TelemetryPayloadSchema.safeParse( payload );

        if ( !validated.success ) {
            console.error( "[TELEMETRIA-ERROR] Payload inválido:", validated.error.issues );
            return { success: false, error: "Contrato semântico violado." };
        }

        const data = validated.data;

        // Persistência otimizada
        const event = await ( prisma as any ).telemetryEvent.create( {
            data: {
                category: data.category,
                scenarioContext: data.scenarioContext ? JSON.stringify( data.scenarioContext ) : null,
                userAction: data.userAction || null,
                optimalAction: data.optimalAction || null,
                evLoss: data.evLoss ?? 0,
                isCorrect: data.isCorrect ?? true,
                latency: data.latency ?? 0,
                componentName: data.componentName,
                metadata: data.metadata ? JSON.stringify( data.metadata ) : null,
            }
        } );

        // SOTA: Auto-Auditoria silenciosa
        if ( data.evLoss > 10 ) {
            console.warn( `[SOTA-CRITICAL-MISPLAY] Event ID: ${event.id} | EV Loss: ${data.evLoss}%` );
        }

        return { success: true, eventId: event.id };
    } catch ( error ) {
        console.error( "[TELEMETRIA FATAL] Colapso na camada de persistência:", error );
        return { success: false, error: "Falha na termodinâmica de persistência." };
    }
}
