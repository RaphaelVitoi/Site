/** @format */

import { useEffect, useRef } from 'react';

interface SotaHeatmapCanvasProps {
  /**
   * SOTA: Não passamos o array via props do React para evitar VDOM Diffing.
   * Passamos uma Referência Mutável que o Worker atualiza silenciosamente.
   */
  tensorRef: React.MutableRefObject<Float64Array | null>;
  width?: number;
  height?: number;
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

    // SOTA: Rasterização de Baixo Nível. Criamos um buffer de pixels Uint8ClampedArray (RGBA)
    // Isso é ordens de magnitude mais rápido do que chamar ctx.fillRect 1326 vezes.
    const imageData = ctx.createImageData(GRID_SIZE, GRID_SIZE);
    const data = imageData.data;

    // Função Pura para colorização (SOTA Cromática)
    // Mapeia a probabilidade (0.0 a 1.0) para a paleta SOTA (Indigo -> Emerald -> Nuclear Red)
    const applySotaColor = (prob: number, pixelIndex: number) => {
      if (prob < 0.01) {
        // Fundo (Vazio / Morto)
        data[pixelIndex] = 15; // R
        data[pixelIndex + 1] = 23; // G
        data[pixelIndex + 2] = 42; // B
        data[pixelIndex + 3] = 255; // Alpha
      } else if (prob < 0.4) {
        // SOTA Indigo (#6366f1) -> Baseline
        data[pixelIndex] = 99;
        data[pixelIndex + 1] = 102;
        data[pixelIndex + 2] = 241;
        data[pixelIndex + 3] = 255;
      } else if (prob < 0.7) {
        // Predator Emerald (#10b981) -> Vantagem
        data[pixelIndex] = 16;
        data[pixelIndex + 1] = 185;
        data[pixelIndex + 2] = 129;
        data[pixelIndex + 3] = 255;
      } else {
        // Nuclear Red (#ff1a1a) -> Pressão / Forte
        data[pixelIndex] = 255;
        data[pixelIndex + 1] = 26;
        data[pixelIndex + 2] = 26;
        data[pixelIndex + 3] = 255;
      }
    };

    const renderLoop = () => {
      const tensor = tensorRef.current;
      if (tensor) {
        let comboIndex = 0;

        // SOTA: Limpeza de Buffer (Fricção Zero)
        // Necessário porque desenharemos uma matriz esparsa (com buracos lógicos)
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 15; // R
          data[i + 1] = 23; // G
          data[i + 2] = 42; // B
          data[i + 3] = 255; // Alpha
        }

        // Assumindo indexação linear c1 > c2 (0..51)
        for (let c1 = 1; c1 < 52; c1++) {
          for (let c2 = 0; c2 < c1; c2++) {
            // Acesso à memória Fricção Zero
            const prob = tensor[comboIndex] ?? 0;

            // Mapeamento [x, y] = [c1, c2] e simetria [c2, c1]
            const idx1 = (c2 * GRID_SIZE + c1) * 4;
            const idx2 = (c1 * GRID_SIZE + c2) * 4;
            // Inversão Geométrica: Ás (rank 12, index 51) no Topo/Esquerda (0)
            const m1 = 51 - c1;
            const m2 = 51 - c2;

            const idxUpper = (m1 * GRID_SIZE + m2) * 4;
            const idxLower = (m2 * GRID_SIZE + m1) * 4;

            const isPair = c1 >> 2 === c2 >> 2;
            const isSuited = (c1 & 3) === (c2 & 3);

            if (isPair) {
              applySotaColor(prob, idxUpper);
              applySotaColor(prob, idxLower);
            } else if (isSuited) {
              applySotaColor(prob, idxUpper);
            } else {
              applySotaColor(prob, idxLower);
            }

            applySotaColor(prob, idx1);
            applySotaColor(prob, idx2);

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

      const prob = tensorRef.current[comboIndex] || 0;

      // Decodificador de Naipes O(1)
      const RANKS = '23456789TJQKA';
      // 0=Spades(s), 1=Hearts(h), 2=Diamonds(d), 3=Clubs(c)
      const SUITS = ['♠', '♥', '♦', '♣'];
      const SUIT_COLORS = ['text-slate-400', 'text-red-500', 'text-blue-500', 'text-emerald-500'];

      const r1 = RANKS[c1 >> 2];
      const s1 = c1 & 3;
      const r2 = RANKS[c2 >> 2];
      const s2 = c2 & 3;

      tooltipRef.current.innerHTML = `
        <div class="flex items-center gap-1 font-bold text-sm">
          <span>${r1}<span class="${SUIT_COLORS[s1]}">${SUITS[s1]}</span></span>
          <span>${r2}<span class="${SUIT_COLORS[s2]}">${SUITS[s2]}</span></span>
        </div>
        <div class="text-[10px] text-slate-400 mt-1">Density: ${(prob * 100).toFixed(2)}%</div>
      `;

      // Mutação direta via Compositor Thread (GPU), ignorando o React Render Cycle
      tooltipRef.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px)`;
      tooltipRef.current.style.opacity = '1';
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
