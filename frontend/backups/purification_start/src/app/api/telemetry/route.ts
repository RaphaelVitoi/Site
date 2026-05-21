import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { z, ZodError } from "zod";
import { enforcePureAscii } from "@/lib/text-utils";

// SOTA: Caminho absoluto para o buffer de telemetria compartilhado com o motor Python
const SHARED_TELEMETRY_PATH = path.resolve(
  process.cwd(),
  "..",
  ".claude/logs/wasm_telemetry_dump.jsonl",
);

function logToOrchestrator(payload: any) {
  try {
    const rawLog = JSON.stringify({
      ...payload,
      _source: "frontend-nextjs",
      _timestamp: new Date().toISOString(),
    }) + "\n";

    // SOTA: Purificação ASCII obrigatória antes de gravar no log compartilhado
    const logEntry = enforcePureAscii(rawLog);

    // SOTA FIX: Append atômico via fs.appendFileSync para garantir integridade no log rotativo do Python
    fs.appendFileSync(SHARED_TELEMETRY_PATH, logEntry, { encoding: "ascii" });
  } catch (err) {
    // Falha silenciosa para não quebrar a request do usuário se o disco estiver cheio/travado
    console.warn(
      "[TELEMETRY-BRIDGE] Falha ao encaminhar log para Orquestrador:",
      err,
    );
  }
}

// Schema SOTA para Telemetria Geral/UI/Quiz
const GeneralTelemetrySchema = z.object({
  category: z.string(),
  componentName: z.string().optional(),
  scenarioContext: z.any().optional(),
  userAction: z.string().optional(),
  optimalAction: z.string().optional(),
  evLoss: z.number().optional().default(0),
  isCorrect: z.boolean().optional(),
  latency: z.number().optional(),
  metadata: z.any().optional(),
  type: z.string().optional(),
  time_ms: z.number().optional(),
  is_correct: z.boolean().optional(),
  ev_loss: z.number().optional(),
  user_id: z.string().optional(),
});

// SOTA: Parser Estrutural Estrito. Erradica a falácia da Validação Implícita.
const MetricPayloadSchema = z.object({
  scenarioId: z
    .string()
    .nullish()
    .transform((val) => val || null),
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
  }),
});

export async function POST(req: Request) {
  try {
    const rawPayload = await req.json();

    // Roteamento Híbrido Fricção Zero: Distingue TelemetryEvent de PerspectiveMetric
    if ("category" in rawPayload) {
      const parsed = GeneralTelemetrySchema.parse(rawPayload);

      // SOTA: Persistência no Banco de Dados (Prisma)
      const record = await prisma.telemetryEvent.create({
        data: {
          userId: parsed.user_id || "local-operator",
          category: parsed.category,
          componentName: parsed.componentName || parsed.type || "unknown",
          scenarioContext: parsed.scenarioContext ?? null,
          userAction: parsed.userAction ?? null,
          optimalAction: parsed.optimalAction ?? null,
          evLoss: parsed.evLoss ?? parsed.ev_loss ?? 0,
          isCorrect: parsed.isCorrect ?? parsed.is_correct ?? true,
          latency: parsed.latency ?? parsed.time_ms ?? 0,
          metadata: parsed.metadata ?? null,
        },
      });

      // SOTA: Ponte para o Orquestrador Python (Logs unificados)
      logToOrchestrator({ type: "TelemetryEvent", ...parsed });

      return NextResponse.json({
        status: "SUCCESS",
        id: record.id,
        type: "TelemetryEvent",
      });
    } else {
      const parsed = MetricPayloadSchema.parse(rawPayload);

      const record = await prisma.vitoiPerspectiveMetric.create({
        data: {
          scenarioId: parsed.scenarioId,
          ...parsed.baseState,
          ...parsed.dynamicModifiers,
          ...parsed.structuralLiabilities,
          ...parsed.edgeRelative,
          ...parsed.insolvency,
        },
      });

      // SOTA: Ponte para o Orquestrador Python
      logToOrchestrator({ type: "PerspectiveMetric", ...parsed });

      return NextResponse.json({
        status: "SUCCESS",
        id: record.id,
        type: "PerspectiveMetric",
      });
    }
  } catch (error: unknown) {
    console.error("[VITOI TELEMETRY] Erro Catastrófico de Injeção:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validação de Payload Falhou", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Entropia não tratada",
      },
      { status: 500 },
    );
  }
}
