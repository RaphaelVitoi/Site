import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validação implícita baseada no contrato IVitoiMathematicalPerspective
    const record = await prisma.vitoiPerspectiveMetrics.create({
      data: {
        scenarioId: body.scenarioId || null,

        chipEvFold: body.baseState.chipEvFold,
        icmValuation: body.baseState.icmValuation,

        timeToBlindJumpMinutes: body.dynamicModifiers.timeToBlindJumpMinutes,
        payjumpProximityFactor: body.dynamicModifiers.payjumpProximityFactor,
        positionalUrgency: body.dynamicModifiers.positionalUrgency,

        multiwayOpponents: body.structuralLiabilities.multiwayOpponents,
        reverseImpliedOddsPenalty: body.structuralLiabilities.reverseImpliedOddsPenalty,

        stackDepthBb: body.edgeRelative.stackDepthBb,
        humanNoiseFactor: body.edgeRelative.humanNoiseFactor,
        technicalSuperiority: body.edgeRelative.technicalSuperiority,

        potOddsRatio: body.insolvency.potOddsRatio,
        perspectiveUtility: body.insolvency.perspectiveUtility,
        insolvencyCoefficient: body.insolvency.insolvencyCoefficient,
        isViable: body.insolvency.isViable
      }
    });

    return NextResponse.json({ status: 'SUCCESS', id: record.id });
  } catch (error: unknown) {
    console.error('[VITOI TELEMETRY] Erro Catastrófico de Injeção:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Entropia não tratada' }, { status: 500 });
  }
}
