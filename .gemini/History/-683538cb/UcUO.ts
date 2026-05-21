import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify( execFile );

// SOTA: Garantir ambiente Node.js para I/O nativo (fs, child_process)
export const runtime = 'nodejs';

const SCRIPT_PATH = path.resolve( process.cwd(), '../task_executor.py' );
const PYTHON_CMD = process.env.NODE_ENV === 'production' ? 'python' : path.resolve( process.cwd(), '../.venv/Scripts/python.exe' );

/**
 * IDENTITY: API Route para Topologia do Knowledge Graph (KG)
 * PATH: frontend/src/app/api/kg/route.ts
 * ROLE: Fornecer os dados estruturais (nos e arestas) para o Oraculo / KGExplorer.
 */

export async function GET () {
    try
    {
        // SOTA: Tentativa 1 - Extração Causal da Mente Coletiva (SQLite/Chroma) via Python
        try
        {
            const { stdout } = await execFileAsync( PYTHON_CMD, [ SCRIPT_PATH, 'kg-export' ] );
            const data = JSON.parse( stdout.trim() );

            if ( data && data.nodes && data.nodes.length > 0 )
            {
                // Normaliza o payload (D3.js exige atributos 'source' e 'target' diretamente na aresta)
                const links = data.edges.map( ( e: any ) => ( {
                    ...e,
                    source: e.source_id,
                    target: e.target_id
                } ) );
            }
        } catch ( pyErr )
        {
            console.warn( '[KG API] Base Ontologica (Python) indisponivel ou vazia. Acionando Fallback Holografico...' );
        }

        // SOTA: Tentativa 2 - Fallback de Friccao Zero (Topologia Macroscopica de Agentes)
        const manifestPath = path.resolve( process.cwd(), '../data/agents_manifest.json' );
        const configPath = path.resolve( process.cwd(), '../data/system_config.json' );

        const [ manifestRaw, configRaw ] = await Promise.all( [
            fs.readFile( manifestPath, 'utf-8' ).catch( () => '{}' ),
            fs.readFile( configPath, 'utf-8' ).catch( () => '{}' )
        ] );

        const manifest = JSON.parse( manifestRaw );
        const config = JSON.parse( configRaw );

        const nodes: any[] = [];
        const links: any[] = [];

        // Mapeia os Agentes
        for ( const [ key, val ] of Object.entries( manifest ) )
        {
            const agent = val as any;
            nodes.push( { id: `@${key}`, label: `@${key}`, type: 'agent', description: agent.identidade, color: agent.color || 'white', group: agent.model_preference || 'fast_operations' } );
        }

        // Mapeia o Handoff Pipeline
        const handoff = config.handoff_pipeline || {};
        for ( const [ source, target ] of Object.entries( handoff ) )
        {
            const targetStr = String( target );
            links.push( { id: `${source}_handoff_${targetStr}`, source_id: source, target_id: targetStr, source: source, target: targetStr, relation: 'handoff', weight: 2.0 } );
        }

        return NextResponse.json( { nodes, edges: links, links }, { status: 200 } );
    } catch ( error: unknown )
    {
        console.error( '[KG API FATAL] Falha estrutural ao montar grafo:', error );
        return NextResponse.json( { nodes: [], edges: [], links: [] }, { status: 500 } );
    }
}
