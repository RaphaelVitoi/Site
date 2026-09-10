import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { evaluateIcmTransitions, TransitionCapacityError } from '@/lib/icmTransitionExperiment';

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  try { return NextResponse.json(evaluateIcmTransitions(input), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) {
    return NextResponse.json({ code: error instanceof TransitionCapacityError ? 'capacity' : 'invalid-input', error: error instanceof ZodError ? 'Informe stacks finitos, ordem de eliminação e probabilidades válidas.' : error instanceof Error ? error.message : 'Não foi possível avaliar as transições.' }, { status: 422 });
  }
}
