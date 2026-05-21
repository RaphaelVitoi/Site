import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  // SOTA: Opcionalmente, extraímos a sessão JWT para amarrar o perfil ao ID do usuário
  const session = await auth();

  // Matriz Heurística Padrão (Baseline SOTA Gold v4.2)
  // Em iterações futuras, isso será consultado via Prisma/Python
  const profile = {
    'Aversão ao Risco': 0.85,
    'Pot Entrapment': 0.65,
    'Miopia de Payjump': 0.9,
    'Excesso de Agressão': 0.3,
    'Passivo Estrutural (RIO)': 0.75,
    'Desvio de Nash': 0.45
  };

  return NextResponse.json({ profile });
}
