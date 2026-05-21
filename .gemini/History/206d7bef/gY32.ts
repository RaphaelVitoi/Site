import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // SOTA: Extração da Identidade Autenticada
  const session = await auth();
  const userId = session?.user?.id || "anonymous";

  // Matriz Heurística Padrão (Baseline)
  const defaultProfile = {
    "Aversão ao Risco": 0.85,
    "Pot Entrapment": 0.65,
    "Miopia de Payjump": 0.9,
    "Excesso de Agressão": 0.3,
    "Passivo Estrutural (RIO)": 0.75,
    "Desvio de Nash": 0.45,
  };

  try {
    // SOTA INTEGRATION: Tenta primeiro o Orquestrador Local (WASM/RAG Engine)
    try {
      const { buildNexusServerUrl } = await import("@/lib/api-contract");
      const localRes = await fetch(buildNexusServerUrl("/predictive-profile"), {
        next: { revalidate: 300 }, // Cache de 5 min para poupar I/O
      });
      if (localRes.ok) {
        const data = await localRes.json();
        if (data.profile) return NextResponse.json(data);
      }
    } catch (e) {
      console.debug(
        "[SOTA API] Orquestrador Nexus offline (fallback ativo).",
        e,
      );
    }

    // FALLBACK 1: Busca os últimos 50 eventos de telemetria do usuário no DB
    const events = await prisma.telemetryEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (events.length === 0) {
      return NextResponse.json({ profile: defaultProfile, source: "baseline" });
    }

    let errors = 0;
    events.forEach((e) => {
      if (!e.isCorrect) errors++;
    });
    const errorRate = errors / events.length;

    // Modulação Bayesiana do Profile baseada na Telemetria Real
    const profile = {
      "Aversão ao Risco": Math.min(
        1,
        defaultProfile["Aversão ao Risco"] * (1 + errorRate * 0.2),
      ),
      "Pot Entrapment": Math.min(
        1,
        defaultProfile["Pot Entrapment"] * (1 + errorRate * 0.1),
      ),
      "Miopia de Payjump": Math.max(
        0,
        defaultProfile["Miopia de Payjump"] * (1 - errorRate * 0.1),
      ),
      "Excesso de Agressão": Math.min(
        1,
        defaultProfile["Excesso de Agressão"] + errorRate * 0.3,
      ),
      "Passivo Estrutural (RIO)": defaultProfile["Passivo Estrutural (RIO)"],
      "Desvio de Nash": Math.min(1, errorRate * 1.5),
    };

    return NextResponse.json({ profile, source: "telemetry-db" });
  } catch (error) {
    console.error("[SOTA API] Entropia na integração preditiva:", error);
    return NextResponse.json({
      profile: defaultProfile,
      source: "fallback-error",
    });
  }
}
