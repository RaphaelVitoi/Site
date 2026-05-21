import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z, ZodError } from 'zod';

const prisma = new PrismaClient();

// SOTA: Parser Estrutural Estrito. Erradica a falácia da Validação Implícita.
const MetricPayloadSchema = z.object({
  scenarioId: z.string().nullish().transform(val => val || null),
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

    // Lei de Shannon SOTA: Achatamento estrutural (Spread O(1)).
    // Erradica o mapeamento manual 1:1 aproveitando a ausência de colisão de chaves do Schema.
    const record = await prisma.vitoiPerspectiveMetric.create({
      data: {
        scenarioId: parsed.scenarioId,
        ...parsed.baseState,
        ...parsed.dynamicModifiers,
        ...parsed.structuralLiabilities,
        ...parsed.edgeRelative,
        ...parsed.insolvency
      }
    });

    return NextResponse.json({ status: 'SUCCESS', id: record.id });
  } catch (error: unknown) {
    console.error('[VITOI TELEMETRY] Erro Catastrófico de Injeção:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validação de Payload Falhou', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Entropia não tratada' }, { status: 500 });
  }
}
