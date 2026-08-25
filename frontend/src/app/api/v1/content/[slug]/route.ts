/** @format */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const { slug } = await params;

		// SEC-009: Consulta blindada contra vazamento de rascunhos e metadados internos
		const content = await prisma.content.findFirst({
			where: {
				slug,
				isPublished: true, // Restrição SOTA: Apenas conteúdo consolidado/público
			},
			select: {
				// Whitelist de projeção de dados (Data Transfer Object explícito)
				id: true,
				slug: true,
				title: true,
				category: true,
				description: true,
				body: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!content) {
			return NextResponse.json({ error: 'Content not found' }, { status: 404 });
		}

		return NextResponse.json(content);
	} catch (error: unknown) {
		console.error('[API_CONTENT_ERROR]', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
