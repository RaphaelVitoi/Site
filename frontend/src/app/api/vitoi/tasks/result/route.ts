import { NextResponse } from 'next/server';
import { encaminharGetDeOperador } from '@/lib/server/operator-gateway';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.trim() ?? '';
  if (!/^[A-Za-z0-9@_-]{1,100}$/.test(id)) {
    return NextResponse.json({ status: 'ERROR', error: 'Identificador de tarefa inválido.' }, { status: 400 });
  }
  return encaminharGetDeOperador('/task-result', { id });
}
