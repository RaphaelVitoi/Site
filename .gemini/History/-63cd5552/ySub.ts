"use server"

import { PrismaClient } from "@prisma/client"

// Evita a exaustão de conexões no modo dev do Next.js
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if ( process.env.NODE_ENV !== "production" ) globalForPrisma.prisma = prisma

interface TelemetryPayload {
    category: 'quiz' | 'simulator' | 'performance' | 'error';
    scenarioContext?: Record<string, any>;
    userAction?: string;
    optimalAction?: string;
    evLoss?: number;
    isCorrect?: boolean;
    // Métricas de Performance (AuditEngine)
    latency?: number;          // ms
    memoryUsage?: number;      // MB (se disponível)
    componentName?: string;
    metadata?: Record<string, any>;
}

/**
 * Injeta o vazamento de EV ou métricas de performance no Motor de Persistência.
 * Operação Assíncrona O(1) do ponto de vista do Client Component.
 */
export async function logTelemetryEvent ( payload: TelemetryPayload ) {
    try
    {
        const event = await prisma.telemetryEvent.create( {
            data: {
                category: payload.category,
                scenarioContext: payload.scenarioContext ? JSON.stringify( payload.scenarioContext ) : null,
                userAction: payload.userAction || null,
                optimalAction: payload.optimalAction || null,
                evLoss: payload.evLoss || 0,
                isCorrect: payload.isCorrect ?? true,
                // Expansão AuditEngine v3.4
                latency: payload.latency || 0,
                componentName: payload.componentName || "unknown",
                metadata: payload.metadata ? JSON.stringify( payload.metadata ) : null,
            }
        } );
        return { success: true, eventId: event.id };
    } catch ( error )
    {
        console.error( "[TELEMETRIA FATAL] Falha ao registrar evento:", error );
        return { success: false, error: "Falha na termodinâmica de persistência." };
    }
}
