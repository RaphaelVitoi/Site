import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '@/lib/logger';

export async function GET() {
  // SOTA: Extração da Identidade Autenticada
  const session = await auth();
  const userId = session?.user?.id || 'anonymous';

  // Matriz Heurística Padrão (Baseline)
  const defaultProfile = {
    'Aversão ao Risco': 0.85,
    'Pot Entrapment': 0.65,
    'Miopia de Payjump': 0.9,
    'Excesso de Agressão': 0.3,
    'Passivo Estrutural (RIO)': 0.75,
    'Desvio de Nash': 0.45,
  };

  try {
    // SOTA INTEGRATION: Tenta primeiro o Orquestrador Local (WASM/RAG Engine)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800); // SOTA Fallback: Falha rapida em 800ms
    try {
      const { buildNexusServerUrl } = await import('@/lib/api-contract');
      const localRes = await fetch(buildNexusServerUrl('/predictive-profile'), {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      if (localRes.ok) {
        const data = await localRes.json();
        if (data.profile) {
          const asciiToUtf8Map: Record<string, string> = {
            'Aversao ao Risco': 'Aversão ao Risco',
            'Pot Entrapment': 'Pot Entrapment',
            'Miopia de Payjump': 'Miopia de Payjump',
            'Excesso de Agressao': 'Excesso de Agressão',
            'Passivo Estrutural (RIO)': 'Passivo Estrutural (RIO)',
            'Desvio de Nash': 'Desvio de Nash',
          };
          const mappedProfile: Record<string, number> = {};
          for (const key of Object.keys(data.profile)) {
            const mappedKey = asciiToUtf8Map[key] || key;
            mappedProfile[mappedKey] = data.profile[key] ?? 0;
          }
          return NextResponse.json({
            ...data,
            profile: mappedProfile,
          });
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      logger.info('API:Predictive', 'Orquestrador Nexus offline (fallback ativo).', { error: e });
    }

    // FALLBACK 1: Busca os últimos 50 eventos de telemetria do usuário no DB
    const events = await prisma.telemetryEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (events.length === 0) {
      return NextResponse.json({
        profile: defaultProfile,
        telemetry: [],
        source: 'baseline',
      });
    }

    let errors = 0;
    events.forEach((e: { isCorrect: boolean }) => {
      if (!e.isCorrect) errors++;
    });
    const errorRate = errors / events.length;

    // Modulação Bayesiana do Profile baseada na Telemetria Real
    const profile = {
      'Aversão ao Risco': Math.min(1, defaultProfile['Aversão ao Risco'] * (1 + errorRate * 0.2)),
      'Pot Entrapment': Math.min(1, defaultProfile['Pot Entrapment'] * (1 + errorRate * 0.1)),
      'Miopia de Payjump': Math.max(0, defaultProfile['Miopia de Payjump'] * (1 - errorRate * 0.1)),
      'Excesso de Agressão': Math.min(1, defaultProfile['Excesso de Agressão'] + errorRate * 0.3),
      'Passivo Estrutural (RIO)': defaultProfile['Passivo Estrutural (RIO)'],
      'Desvio de Nash': Math.min(1, errorRate * 1.5),
    };

    const telemetry = events.map((e: { evLoss: number | null; isCorrect: boolean; createdAt: Date }) => ({
      evLoss: e.evLoss ?? 0,
      isCorrect: e.isCorrect,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({ profile, telemetry, source: 'telemetry-db' });
  } catch (error) {
    logger.error('API:Predictive', 'Entropia na integração preditiva', { error });

    // God Mode: Exportação forçada de Logs Analíticos de Falha
    try {
      const logDir = join(process.cwd(), '..', 'logs');
      mkdirSync(logDir, { recursive: true });
      const logPath = join(logDir, 'predictive-profile-fatal.log');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] FATAL: Falha dupla (Nexus + Prisma). User: ${userId.substring(0, 4)}***. Erro: ${error instanceof Error ? error.message : String(error)}\n`;
      appendFileSync(logPath, logEntry, 'utf8');
    } catch (fsError) {
      logger.error('API:Predictive', 'Falha crítica ao escrever log do God Mode', { error: fsError });
    }

    return NextResponse.json({
      profile: defaultProfile,
      telemetry: [],
      source: 'fallback-error',
    });
  }
}
