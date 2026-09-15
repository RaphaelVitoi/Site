'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { PmevEngine } from '@/engine/pmev_wasm/pkg/pmev_wasm';

interface SotaPerspectiveMeshProps {
    equity: number;
    potSize: number;
    stackDepth: number;
    realizationFactor: number;
    valuationStack: number;
}

export default function SotaPerspectiveMesh({
    equity,
    potSize,
    stackDepth,
    realizationFactor,
    valuationStack,
}: SotaPerspectiveMeshProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engine = useMemo(() => new PmevEngine(), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const gridSize = 20;
            const stepX = width / (gridSize - 1);
            const stepY = height / (gridSize - 1);

            // Drawing the Mesh
            ctx.lineWidth = 1;
            
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    // Map grid to Theory Parameters
                    // X axis: Equity (0.1 to 0.9)
                    // Y axis: Realization Factor (0.4 to 1.4)
                    const currentEquity = 0.1 + (i / (gridSize - 1)) * 0.8;
                    const currentRealization = 0.4 + (j / (gridSize - 1)) * 1.0;

                    // Calculate PMev via WASM Kernel
                    const resJs = engine.calculate_perspective(
                        currentEquity,
                        currentRealization,
                        valuationStack,
                        -1.0, // Fixed fold EV for mesh visualization
                        1.0,   // Fixed structural liability
                        stackDepth,
                        2,
                        0.05,
                        1.5,
                        potSize
                    );
                    
                    // We access the pmev value from the serialized JS object
                    const pmev = (resJs as any).pmev;

                    // Map PMev to Z-axis (Visual Displacement)
                    const z = pmev * 20; 
                    const x = i * stepX;
                    const y = j * stepY;

                    // SOTA Color Mapping: Indigo -> Gold based on PMev
                    const hue = 230 + (pmev * 50); // Shift from Indigo to Gold-ish
                    const lightness = 30 + (pmev * 20);
                    ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, 0.4)`;

                    // Draw lines to neighbors to create the mesh effect
                    if (i < gridSize - 1) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        // Next point calculation for the line
                        const nextEquity = 0.1 + ((i + 1) / (gridSize - 1)) * 0.8;
                        const nextResJs = engine.calculate_perspective(
                            nextEquity, currentRealization, valuationStack, -1.0, 1.0, stackDepth, 2, 0.05, 1.5, potSize
                        );
                        const nextZ = (nextResJs as any).pmev * 20;
                        ctx.lineTo(x + stepX, y + (nextZ - z));
                        ctx.stroke();
                    }

                    if (j < gridSize - 1) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        const nextRealization = 0.4 + ((j + 1) / (gridSize - 1)) * 1.0;
                        const nextResJs = engine.calculate_perspective(
                            currentEquity, nextRealization, valuationStack, -1.0, 1.0, stackDepth, 2, 0.05, 1.5, potSize
                        );
                        const nextZ = (nextResJs as any).pmev * 20;
                        ctx.lineTo(x + (nextZ - z), y + stepY);
                        ctx.stroke();
                    }
                }
            }

            // Highlight the current "Operator Point"
            const opX = ((equity - 0.1) / 0.8) * width;
            const opY = ((realizationFactor - 0.4) / 1.0) * height;
            
            ctx.fillStyle = '#FFD700'; // SOTA Gold
            ctx.beginPath();
            ctx.arc(opX, opY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FFD700';

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [engine, equity, realizationFactor, valuationStack, stackDepth, potSize]);

    return (
        <div className="relative w-full h-full min-h-[400px] bg-bg-base rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-black tracking-tighter text-sm uppercase opacity-50">
                    SOTA Perspective Mesh
                </h3>
                <p className="text-[0.6rem] text-accent-indigo-light font-bold uppercase tracking-widest">
                    Real-time Equity vs Realization Mapping
                </p>
            </div>
            <canvas 
                ref={canvasRef} 
                width={800} 
                height={400} 
                className="w-full h-full object-cover opacity-80"
            />
        </div>
    );
}
