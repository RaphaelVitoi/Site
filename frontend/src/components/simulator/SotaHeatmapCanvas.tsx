/** @format */

import { useEffect, useRef } from 'react';

interface SotaHeatmapCanvasProps {
  /**
   * SOTA: Não passamos o array via props do React para evitar VDOM Diffing.
   * Passamos uma Referência Mutável que o Worker atualiza silenciosamente.
   */
  tensorRef: React.RefObject<Float64Array | null>;
  width?: number;
  height?: number;
}

const COLOR_BG = 0xff2a170f;
const COLOR_INDIGO = 0xfff16663;
const COLOR_EMERALD = 0xff81b910;
const COLOR_RED = 0xff1a1aff;

const RANKS = '23456789TJQKA';
const SUITS = ['♠', '♥', '♦', '♣'] as const;
const SUIT_COLORS = ['text-slate-400', 'text-red-500', 'text-blue-500', 'text-emerald-500'] as const;

function getSotaColor(prob: number): number {
  if (prob < 0.01) return COLOR_BG;
  if (prob < 0.4) return COLOR_INDIGO;
  if (prob < 0.7) return COLOR_EMERALD;
  return COLOR_RED;
}

function setPixel(data32: Uint32Array, pixelIdx: number, color: number): void {
  if (pixelIdx >= 0 && pixelIdx < data32.length) {
    data32.fill(color, pixelIdx, pixelIdx + 1);
  }
}

export function SotaHeatmapCanvas({ tensorRef, width = 260, height = 260 }: Readonly<SotaHeatmapCanvasProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    // Geometria Combinatória: Para 1326 combos, o mapeamento ideal direto
    // seria um grid de 52x52 (onde metade é espelhada/vazia).
    const GRID_SIZE = 52;
    const cellWidth = width / GRID_SIZE;
    const cellHeight = height / GRID_SIZE;

    // SOTA: Rasterização de Baixo Nível via buffer de 32-bit dwords (RGBA)
    const imageData = ctx.createImageData(GRID_SIZE, GRID_SIZE);
    const data32 = new Uint32Array(imageData.data.buffer);

    const renderLoop = () => {
      const tensor = tensorRef.current;
      if (tensor) {
        let comboIndex = 0;

        // SOTA: Limpeza de Buffer Vetorizada (Fricção Zero)
        data32.fill(COLOR_BG);

        // Assumindo indexação linear c1 > c2 (0..51)
        for (let c1 = 1; c1 < 52; c1++) {
          for (let c2 = 0; c2 < c1; c2++) {
            // Acesso à memória Fricção Zero
            const prob = tensor.at(comboIndex) ?? 0;
            const color = getSotaColor(prob);

            // Mapeamento [x, y] = [c1, c2] e simetria [c2, c1]
            const idx1 = c2 * GRID_SIZE + c1;
            const idx2 = c1 * GRID_SIZE + c2;

            // Inversão Geométrica: Ás (rank 12, index 51) no Topo/Esquerda (0)
            const m1 = 51 - c1;
            const m2 = 51 - c2;

            const idxUpper = m1 * GRID_SIZE + m2;
            const idxLower = m2 * GRID_SIZE + m1;

            const isPair = c1 >> 2 === c2 >> 2;
            const isSuited = (c1 & 3) === (c2 & 3);

            if (isPair) {
              setPixel(data32, idxUpper, color);
              setPixel(data32, idxLower, color);
            } else if (isSuited) {
              setPixel(data32, idxUpper, color);
            } else {
              setPixel(data32, idxLower, color);
            }

            setPixel(data32, idx1, color);
            setPixel(data32, idx2, color);

            comboIndex++;
          }
        }

        // Flush instantâneo na GPU/Canvas API
        ctx.putImageData(imageData, 0, 0);

        // Escala o ImageData para o tamanho físico do Canvas sem anti-aliasing (Mantém os pixels "duros")
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, GRID_SIZE, GRID_SIZE, 0, 0, width, height);
      }

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    requestRef.current = requestAnimationFrame(renderLoop);

    // ========================================================================
    // SOTA 2D RAYCASTER (Fricção Zero / O(1) Hit Detection)
    // ========================================================================
    const handleMouseMove = (e: MouseEvent) => {
      if (!tensorRef.current || !tooltipRef.current || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      // Normalização de escala caso o CSS redimensione o canvas
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Mapeamento espacial (0 a 51)
      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);

      // Inversão de Coordenadas (De volta para o sistema do Rust/GCN)
      const mapped_c_row = 51 - row;
      const mapped_c_col = 51 - col;

      // A diagonal principal representa cartas clonadas (ex: AhAh), fisicamente impossíveis.
      if (
        mapped_c_row === mapped_c_col ||
        mapped_c_row < 0 ||
        mapped_c_row > 51 ||
        mapped_c_col < 0 ||
        mapped_c_col > 51
      ) {
        tooltipRef.current.style.opacity = '0';
        return;
      }

      // Inversão do Stride para indexação na memória linear de 1326 combos.
      // O Rust/WASM assume c1 > c2.
      const isPair = mapped_c_row >> 2 === mapped_c_col >> 2;
      const isSuited = (mapped_c_row & 3) === (mapped_c_col & 3);

      // SOTA: Abortar o Raycast nos "buracos" da matriz esparsa
      if (!isPair) {
        if (isSuited && row > col) {
          tooltipRef.current.style.opacity = '0';
          return;
        }
        if (!isSuited && row < col) {
          tooltipRef.current.style.opacity = '0';
          return;
        }
      }

      const c1 = Math.max(mapped_c_row, mapped_c_col);
      const c2 = Math.min(mapped_c_row, mapped_c_col);
      const comboIndex = (c1 * (c1 - 1)) / 2 + c2;

      const prob = tensorRef.current.at(comboIndex) ?? 0;

      // Decodificador de Naipes O(1)
      const r1 = RANKS.at(c1 >> 2) ?? '2';
      const s1 = c1 & 3;
      const r2 = RANKS.at(c2 >> 2) ?? '2';
      const s2 = c2 & 3;
      const suit1 = SUITS.at(s1) ?? '♠';
      const suit2 = SUITS.at(s2) ?? '♠';
      const suitColor1 = SUIT_COLORS.at(s1) ?? 'text-slate-400';
      const suitColor2 = SUIT_COLORS.at(s2) ?? 'text-slate-400';

      const tooltipEl = tooltipRef.current;
      tooltipEl.replaceChildren();

      const headerDiv = document.createElement('div');
      headerDiv.className = 'flex items-center gap-1 font-bold text-sm';

      const c1Span = document.createElement('span');
      c1Span.textContent = r1;
      const s1Span = document.createElement('span');
      s1Span.className = suitColor1;
      s1Span.textContent = suit1;
      c1Span.appendChild(s1Span);

      const c2Span = document.createElement('span');
      c2Span.textContent = r2;
      const s2Span = document.createElement('span');
      s2Span.className = suitColor2;
      s2Span.textContent = suit2;
      c2Span.appendChild(s2Span);

      headerDiv.append(c1Span, c2Span);

      const densityDiv = document.createElement('div');
      densityDiv.className = 'text-[10px] text-slate-400 mt-1';
      densityDiv.textContent = `Density: ${(prob * 100).toFixed(2)}%`;

      tooltipEl.append(headerDiv, densityDiv);

      // Mutação direta via Compositor Thread (GPU), ignorando o React Render Cycle
      // SOTA: Clamping com consciência de viewport contra corte e overflow em bordas
      const tooltipWidth = 160;
      const tooltipHeight = 65;
      const posX =
        e.clientX + 15 + tooltipWidth > window.innerWidth
          ? Math.max(10, e.clientX - tooltipWidth - 15)
          : e.clientX + 15;
      const posY =
        e.clientY + 15 + tooltipHeight > window.innerHeight
          ? Math.max(10, e.clientY - tooltipHeight - 15)
          : e.clientY + 15;

      tooltipEl.style.transform = `translate(${posX}px, ${posY}px)`;
      tooltipEl.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    };

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [width, height, tensorRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="glass-panel sota-grain cursor-crosshair rounded-md border border-indigo-500/20 shadow-2xl"
      />
      {/* SOTA: Portal DOM flutuante. "will-change-transform" joga o elemento na GPU */}
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed top-0 left-0 z-50 rounded-md border border-slate-700 bg-slate-900/95 px-3 py-2 font-mono opacity-0 shadow-2xl backdrop-blur-md transition-opacity duration-75 will-change-transform"
      />
    </>
  );
}
