"use server"

import { PrismaClient } from "@prisma/client"

// Evita a exaustão de conexões no modo dev do Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

interface TelemetryPayload {
    category: string;
    scenarioContext: Record<string, any>;
    userAction: string;
    optimalAction: string;
    evLoss: number;
    isCorrect: boolean;
}

/**
 * Injeta o vazamento de EV do jogador diretamente no Motor de Persistência.
 * Operação Assíncrona O(1) do ponto de vista do Client Component.
 */
export async function logTelemetryEvent(payload: TelemetryPayload) {
    try {
        const event = await prisma.telemetryEvent.create({
            data: {
                category: payload.category,
                scenarioContext: JSON.stringify(payload.scenarioContext),
                userAction: payload.userAction,
                optimalAction: payload.optimalAction,
                evLoss: payload.evLoss,
                isCorrect: payload.isCorrect,
            }
        });
        return { success: true, eventId: event.id };
    } catch (error) {
        console.error("[TELEMETRIA FATAL] Falha ao registrar evento:", error);
        return { success: false, error: "Falha na termodinâmica de persistência." };
    }
}