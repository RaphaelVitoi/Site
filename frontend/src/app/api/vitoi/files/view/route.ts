import { NextResponse } from 'next/server';
import { encaminharGetDeOperador } from '@/lib/server/operator-gateway';

export const runtime = 'nodejs';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const path = searchParams.get('path')?.trim();
	if (!path) return NextResponse.json({ status: 'ERROR', error: "Parâmetro 'path' ausente." }, { status: 400 });

	const parametros: Record<string, string> = { path };
	if (searchParams.get('raw') === 'true') parametros['raw'] = 'true';
	return encaminharGetDeOperador('/api/files/view', parametros);
}
