'use client';

/**
 * IDENTITY: CfrCanvas (High-Performance Poker Range & CFR Heatmap)
 * PATH: src/components/simulator/ui/CfrCanvas.tsx
 * ROLE: Renderizador gráfico de alta precisão para a Matriz 13x13 de Regret Matching.
 *       Garante 100% de compatibilidade em todos os navegadores com aceleração 2D e suporte HiDPI.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface CfrCanvasProps {
  nodes?: number;
  onHoverHand?: (handInfo: { hand: string; value: number; type: 'pair' | 'suited' | 'offsuit' } | null) => void;
}

export interface CfrCanvasRef {
  updateMatrix: (matrix: Float32Array) => void;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function getHandLabel(row: number, col: number): { name: string; type: 'pair' | 'suited' | 'offsuit' } {
  const r1 = RANKS[row] ?? '2';
  const r2 = RANKS[col] ?? '2';
  if (row === col) {
    return { name: `${r1}${r2}`, type: 'pair' };
  }
  if (row < col) {
    return { name: `${r1}${r2}s`, type: 'suited' };
  }
  return { name: `${r2}${r1}o`, type: 'offsuit' };
}

function getCellColor(val: number): { bg: string; text: string } {
  // Clamped entre 0 e 1
  const v = Math.max(0, Math.min(1, val));

  if (v >= 0.75) {
    // Agressão alta / Frequência dominante (Verde Esmeralda SOTA)
    return {
      bg: `rgba(16, 185, 129, ${0.4 + v * 0.55})`,
      text: '#ffffff',
    };
  }
  if (v >= 0.45) {
    // Decisão mista / Call-Raise moderado (Índigo / Azul Vibrante)
    return {
      bg: `rgba(79, 70, 229, ${0.35 + v * 0.45})`,
      text: '#e2e8f0',
    };
  }
  if (v >= 0.2) {
    // Frequência baixa / Ação marginal (Azul ardósia escuro)
    return {
      bg: `rgba(30, 41, 59, ${0.4 + v * 0.4})`,
      text: '#94a3b8',
    };
  }
  // Fold quase puro (Preto / Ardósia Profundo)
  return {
    bg: 'rgba(15, 23, 42, 0.75)',
    text: '#64748b',
  };
}

export const CfrCanvas = forwardRef<CfrCanvasRef, Readonly<CfrCanvasProps>>(({ nodes = 13, onHoverHand }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrixRef = useRef<Float32Array | null>(null);
  const hoveredCellRef = useRef<{ row: number; col: number } | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    name: string;
    value: number;
    type: 'pair' | 'suited' | 'offsuit';
    x: number;
    y: number;
  } | null>(null);

  const renderGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const matrix = matrixRef.current;
    const n = Math.min(nodes, 13);
    const cellW = width / n;
    const cellH = height / n;
    const hovered = hoveredCellRef.current;

    // 1. Desenhar Células da Matriz 13x13
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const idx = r * n + c;
        const val = matrix ? (matrix[idx] ?? 0) : 0.5;
        const { name, type } = getHandLabel(r, c);
        const { bg, text } = getCellColor(val);
        const x = c * cellW;
        const y = r * cellH;

        // Fundo da célula
        ctx.fillStyle = bg;
        ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

        // Borda de célula
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

        // Rótulo da mão
        const fontSize = Math.max(8, Math.min(11, Math.floor(cellW * 0.38)));
        ctx.font = `${type === 'pair' ? 'bold' : '600'} ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = text;
        ctx.fillText(name, x + cellW / 2, y + cellH / 2);

        // Indicador de tipo sutil (diagonal ou par)
        if (type === 'pair') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
        }
      }
    }

    // 2. Realce da Célula sob o Mouse (Hover)
    if (hovered && hovered.row < n && hovered.col < n) {
      const hx = hovered.col * cellW;
      const hy = hovered.row * cellH;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 8;
      ctx.strokeRect(hx + 1, hy + 1, cellW - 2, cellH - 2);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, [nodes]);

  useImperativeHandle(
    ref,
    () => ({
      updateMatrix: (newMatrix: Float32Array) => {
        matrixRef.current = newMatrix;
        renderGrid();
      },
    }),
    [renderGrid],
  );

  useEffect(() => {
    renderGrid();
    window.addEventListener('resize', renderGrid);
    return () => window.removeEventListener('resize', renderGrid);
  }, [renderGrid]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const n = Math.min(nodes, 13);
    const cellW = rect.width / n;
    const cellH = rect.height / n;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);

    if (row >= 0 && row < n && col >= 0 && col < n) {
      hoveredCellRef.current = { row, col };
      const idx = row * n + col;
      const val = matrixRef.current ? (matrixRef.current[idx] ?? 0) : 0.5;
      const { name, type } = getHandLabel(row, col);

      setTooltipInfo({
        name,
        value: val,
        type,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      onHoverHand?.({ hand: name, value: val, type });
      renderGrid();
    } else {
      handleMouseLeave();
    }
  };

  const handleMouseLeave = () => {
    hoveredCellRef.current = null;
    setTooltipInfo(null);
    onHoverHand?.(null);
    renderGrid();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full aspect-square select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full block rounded-2xl cursor-crosshair"
      />

      {tooltipInfo && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-950/95 border border-white/20 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md text-[0.7rem] font-mono whitespace-nowrap"
          style={{
            left: `${Math.max(40, Math.min(tooltipInfo.x, 380))}px`,
            top: `${Math.max(28, tooltipInfo.y - 8)}px`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-xs">{tooltipInfo.name}</span>
            <span
              className={`text-[0.6rem] px-1.5 py-0.2 rounded font-bold uppercase ${
                tooltipInfo.type === 'pair'
                  ? 'bg-accent-amber/20 text-accent-amber'
                  : tooltipInfo.type === 'suited'
                    ? 'bg-accent-emerald/20 text-accent-emerald'
                    : 'bg-accent-indigo/20 text-accent-indigo-light'
              }`}
            >
              {tooltipInfo.type === 'pair' ? 'Par' : tooltipInfo.type === 'suited' ? 'Suited' : 'Offsuit'}
            </span>
          </div>
          <div className="text-[0.65rem] text-text-muted mt-0.5 flex gap-2">
            <span>Ação: <strong className="text-accent-emerald">{(tooltipInfo.value * 100).toFixed(1)}%</strong></span>
            <span>Fold: <strong className="text-text-dim">{((1 - tooltipInfo.value) * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
});

CfrCanvas.displayName = 'CfrCanvas';
