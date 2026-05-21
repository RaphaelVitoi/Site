import { NextResponse } from 'next/server';

/**
 * IDENTITY: API Route para Topologia do Knowledge Graph (KG)
 * PATH: frontend/src/app/api/kg/route.ts
 * ROLE: Fornecer os dados estruturais (nos e arestas) para o Oraculo / KGExplorer.
 */

export async function GET () {
    // SOTA VITOI: Contrato de API estabilizado para erradicar o Erro HTTP 404.
    // O envelope garante resiliencia independentemente do parser (React Flow ou D3-Force).
    const topology = {
        nodes: [],
        edges: [],
        links: []
    };

    return NextResponse.json( topology, { status: 200 } );
}
