import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { evaluateIcmTransitions, TransitionCapacityError } from '@/lib/icmTransitionExperiment';
import { mensagemDeErroDeDominio } from '@/lib/server/domain-error-message';

function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return 'Informe stacks finitos, ordem de eliminação e probabilidades válidas.';
  }
  return mensagemDeErroDeDominio(error, 'Não foi possível avaliar as transições.', [TransitionCapacityError]);
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

