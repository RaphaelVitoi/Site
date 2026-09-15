import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { evaluateIcmTransitions, TransitionCapacityError } from '@/lib/icmTransitionExperiment';

function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return 'Informe stacks finitos, ordem de eliminação e probabilidades válidas.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Não foi possível avaliar as transições.';
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
  try {
    const result = await evaluateIcmTransitions(input);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const code = error instanceof TransitionCapacityError ? 'capacity' : 'invalid-input';
    return NextResponse.json({ code, error: getErrorMessage(error) }, { status: 422 });
  }
}

