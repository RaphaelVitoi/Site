import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { evaluateCounterfactual } from '@/lib/counterfactualExperiment';

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  try {
    return NextResponse.json(evaluateCounterfactual(input), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ZodError
      ? 'Informe contexto completo, valores finitos e probabilidades entre 0 e 1.'
      : error instanceof Error ? error.message : 'Não foi possível avaliar o experimento.' }, { status: 422 });
  }
}
