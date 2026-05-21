import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify( exec );

export async function POST ( request: Request ) {
    try
    {
        const body = await request.json();
        const { combo, insolvencyDelta } = body;

        if ( !combo )
        {
            return NextResponse.json( { error: 'Fricção Detectada: Combo indefinido' }, { status: 400 } );
        }

        // SOTA: Isolamento Semântico. A instrução busca os nós vitais sem alucinação LLM
        const query = `Reverse Implied Odds, FGS e Insolvência Matemática`;
        let isLocalRAGSuccess = false;

        try
        {
            const scriptPath = path.resolve( process.cwd(), '../memory_rag.py' );
            // Execução estrita via CLI Python (Custo Zero Tokens).
            // OBS: "query" passará apenas pelas rotinas do ChromaDB (BM25 local e embeddings locais).
            await execAsync( `python "${scriptPath}" query "${query}"` );
            isLocalRAGSuccess = true;
        } catch ( e )
        {
            console.warn( "[Oráculo Híbrido] Fallback ativado. memory_rag.py inacessível via CLI:", e );
        }

        // SOTA: Em Fase 3.2, o output textual será fatiado e extraído em nós via TypeScript
        // Heurística Temporária: Cria a estrutura determinística com base na severidade (Delta)
        const isCatastrophic = insolvencyDelta < -1;

        const nodes = [
            { id: "n1", label: `${combo} Action`, type: "trigger" },
            { id: "n2", label: isCatastrophic ? "Pot Entrapment Severo" : "Reverse Implied Odds", type: "concept" },
            { id: "n3", label: isCatastrophic ? "Insolvência Matemática" : "Amortização da Edge", type: "consequence" }
        ];

        const edges = [
            { source: "n1", target: "n2", relationship: "sofre_punicao_de" },
            { source: "n2", target: "n3", relationship: "causa" }
        ];

        return NextResponse.json( { status: "SUCCESS", nodes, edges, contextStatus: isLocalRAGSuccess ? "Loaded" : "Fallback" } );
    } catch ( error )
    {
        return NextResponse.json( { status: "ERROR", message: String( error ) }, { status: 500 } );
    }
}
