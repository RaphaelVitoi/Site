import { NextResponse } from 'next/server';
import { encaminharGetDeOperador, encaminharPostJsonDeOperador } from '@/lib/server/operator-gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return encaminharGetDeOperador('/status', { status: 'all', since_hours: '168', limit: '30' });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: 'ERROR', error: 'Corpo JSON inválido.' }, { status: 400 });
  }

  const description =
    typeof payload === 'object' && payload !== null && 'description' in payload
      ? (payload as { description?: unknown }).description
      : undefined;
  if (typeof description !== 'string' || description.trim().length < 1 || description.trim().length > 4000) {
    return NextResponse.json({ status: 'ERROR', error: 'Descreva a tarefa em até 4.000 caracteres.' }, { status: 400 });
  }

  return encaminharPostJsonDeOperador('/add', {
    id: `DASH-${crypto.randomUUID()}`,
    description: description.trim(),
    status: 'pending',
    timestamp: new Date().toISOString(),
    agent: '@dispatcher',
    metadata: { source: 'operator-dashboard', task_kind: 'operator-task' },
  });
}
