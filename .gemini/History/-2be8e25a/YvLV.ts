import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// SOTA: Parser Estrutural Estrito. Erradica a falácia da Validação Implícita.
const MetricPayloadSchema = z.object({
  scenarioId: z.string().nullable().optional(),
  baseState: z.object({
    chipEvFold: z.number(),
    icmValuation: z.number(),
  }),
  dynamicModifiers: z.object({
    timeToBlindJumpMinutes: z.number(),
    payjumpProximityFactor: z.number(),
    positionalUrgency: z.number(),
  }),
  structuralLiabilities: z.object({
    multiwayOpponents: z.number(),
    reverseImpliedOddsPenalty: z.number(),
  }),
  edgeRelative: z.object({
    stackDepthBb: z.number(),
    humanNoiseFactor: z.number().default(0),
    technicalSuperiority: z.number(),
  }),
  insolvency: z.object({
    potOddsRatio: z.number(),
    perspectiveUtility: z.number(),
    insolvencyCoefficient: z.number().nullable(),
    isViable: z.boolean(),
  })
});

export async function POST(req: Request) {
  try {
    const parsed = MetricPayloadSchema.parse(await req.json());

    const record = await prisma.vitoiPerspectiveMetrics.create({
      data: {
        scenarioId: parsed.scenarioId || null,
        chipEvFold: parsed.baseState.chipEvFold,
        icmValuation: parsed.baseState.icmValuation,
        timeToBlindJumpMinutes: parsed.dynamicModifiers.timeToBlindJumpMinutes,
        payjumpProximityFactor: parsed.dynamicModifiers.payjumpProximityFactor,
        positionalUrgency: parsed.dynamicModifiers.positionalUrgency,
        multiwayOpponents: parsed.structuralLiabilities.multiwayOpponents,
        reverseImpliedOddsPenalty: parsed.structuralLiabilities.reverseImpliedOddsPenalty,
        stackDepthBb: parsed.edgeRelative.stackDepthBb,
        humanNoiseFactor: parsed.edgeRelative.humanNoiseFactor,
        technicalSuperiority: parsed.edgeRelative.technicalSuperiority,
        potOddsRatio: parsed.insolvency.potOddsRatio,
        perspectiveUtility: parsed.insolvency.perspectiveUtility,
        insolvencyCoefficient: parsed.insolvency.insolvencyCoefficient,
        isViable: parsed.insolvency.isViable
      }
    });

    return NextResponse.json({ status: 'SUCCESS', id: record.id });
  } catch (error: unknown) {
    console.error('[VITOI TELEMETRY] Erro Catastrófico de Injeção:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validação de Payload Falhou', details: (error as any).errors }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Entropia não tratada' }, { status: 500 });
  }
}
