"use client";

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function DependencyGraph({ tasks }: { tasks: any[] }) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'inherit'
        });

        if (chartRef.current && tasks && tasks.length > 0) {
            const renderChart = async () => {
                let graphDef = "graph TD\n";

                tasks.forEach(task => {
                    // Colorimetria Semântica
                    const statusColor =
                        task.status === 'completed' ? 'fill:#064e3b,stroke:#22c55e' :
                            task.status === 'running' ? 'fill:#4a044e,stroke:#d946ef' :
                                task.status === 'failed' ? 'fill:#7f1d1d,stroke:#ef4444' :
                                    'fill:#422006,stroke:#eab308';

                    // Sanitização de IDs para o Mermaid
                    const safeId = task.id.replace(/[^a-zA-Z0-9]/g, '_');
                    // Trunca descrição muito longa
                    const shortDesc = task.description.substring(0, 35).replace(/["']/g, '') + "...";

                    graphDef += `  ${safeId}["<div class='font-mono text-[10px] text-gray-400'>${task.agent}</div><div class='text-xs mt-1'>${shortDesc}</div>"]\n`;
                    graphDef += `  style ${safeId} ${statusColor},color:#fff,stroke-width:2px,rx:8,ry:8\n`;

                    // Mapeia dependências
                    if (task.metadata?.depends_on && Array.isArray(task.metadata.depends_on)) {
                        task.metadata.depends_on.forEach((depId: string) => {
                            const safeDepId = depId.replace(/[^a-zA-Z0-9]/g, '_');
                            graphDef += `  ${safeDepId} --> ${safeId}\n`;
                        });
                    }
                });

                try {
                    const { svg } = await mermaid.render('mermaid-topology-' + Date.now(), graphDef);
                    if (chartRef.current) {
                        chartRef.current.innerHTML = svg;
                    }
                } catch (e) {
                    console.error("Falha ao renderizar a topologia Mermaid:", e);
                }
            };
            renderChart();
        }
    }, [tasks]);

    return (
        <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar bg-gray-950/50 p-4 rounded-lg min-h-[250px] flex items-center justify-center">
            {!tasks || tasks.length === 0 ? <p className="text-gray-600 font-mono text-sm animate-pulse">Sem ramificações ativas no momento.</p> : null}
            <div ref={chartRef} className="min-w-max flex justify-center"></div>
        </div>
    );
}