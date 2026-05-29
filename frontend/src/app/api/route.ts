import { NextResponse } from 'next/server';

export async function POST() {
	// SOTA: Rota desativada em favor do Proxy Python unificado (porta 17043).
	// Esta rota e mantida apenas para evitar que builds antigos quebrem com 404.
	return NextResponse.json(
		{
			error: 'Endpoint desativado. Utilize o Proxy SOTA em http://127.0.0.1:17043/generate',
		},
		{ status: 410 }, // 410 Gone
	);
}
