'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// SOTA: Renderização gráfica isolada no Client-Side para evitar anomalias de SSR no DOM
const ForceGraph2D = dynamic( () => import( 'react-force-graph-2d' ), { ssr: false } );

interface GraphNode {
    id: string;
    name: string;
    group: string;
    val: number;
}

interface GraphLink {
    source: string;
    target: string;
    name: string;
}

export default function KGExplorer () {
    const [ graphData, setGraphData ] = useState<{ nodes: GraphNode[], links: GraphLink[] }>( { nodes: [], links: [] } );
    const [ loading, setLoading ] = useState( true );

    useEffect( () => {
        fetch( '/api/kg' )
            .then( res => {
                if ( !res.ok ) throw new Error( `HTTP Error: ${res.status}` );
                return res.json();
            } )
            .then( data => {
                if ( data.nodes && data.edges )
                {
                    const formattedData = {
                        nodes: data.nodes.map( ( n: { id: string, label: string, type: string } ) => ( { id: n.id, name: n.label, group: n.type, val: 1 } ) ),
                        links: data.edges.map( ( e: { source_id: string, target_id: string, relation: string } ) => ( { source: e.source_id, target: e.target_id, name: e.relation } ) )
                    };
                    setGraphData( formattedData );
                }
                setLoading( false );
            } )
            .catch( err => {
                console.error( "Erro ao carregar Topologia KG:", err );
                setLoading( false );
            } );
    }, [] );

    if ( loading ) return <div className="p-10 text-cyan-500 font-mono text-center">Iniciando Varredura do Córtex Ontológico...</div>;

    return (
        <div className="w-full h-screen bg-gray-950 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 p-6 z-10 pointer-events-none">
                <h1 className="text-2xl font-bold text-cyan-400 drop-shadow-md">Knowledge Graph Explorer</h1>
                <p className="text-gray-400 text-sm">Topologia Ontológica SOTA</p>
            </div>
            <ForceGraph2D
                graphData={ graphData }
                nodeLabel="name"
                nodeAutoColorBy="group"
                linkDirectionalArrowLength={ 3.5 }
                linkDirectionalArrowRelPos={ 1 }
                linkLabel="name"
                backgroundColor="#030712"
            />
        </div>
    );
}
