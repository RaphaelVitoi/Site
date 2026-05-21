'use client';

/**
 * IDENTITY: RiskVisualizer (Visualizador de Distorcao de Equidade)
 * PATH: frontend/src/components/simulator/RiskVisualizer.tsx
 * ROLE: Renderizar graficamente o "Drift" de equidade, mostrando como o Risk Premium
 *       reduz o valor percebido de um pote, animando a área de valor.
 * BINDING: [SimuladorICM.tsx, Framer Motion, Tailwind CSS]
 * TELEOLOGY: Fornecer uma representacao visual intuitiva dos conceitos de ChipEV e ICMev
 *            para fins didaticos no Laboratorio de ICM Universal (V2).
 */

import React from 'react';
import { motion } from 'framer-motion';

interface RiskVisualizerProps {
  /** Valor base da equidade em fichas (Chip EV) - normalizado (ex: 0 a 100) */
  chipEV: number;
  /** Valor do Risk Premium (0 a 1, onde 1 = 100% RP) */
  riskPremium: number;
  /** Cor de acentuação para o visualizador (classe tailwind ex: "indigo-500" ou hex) */
  color: string;
}

// Mapa de cores tailwind para hexadecimais para uso em SVG fill
const COLOR_MAP: Record<string, string> = {
  'indigo-500': '#6366f1',
  'rose-500': '#e11d48',
  'emerald-500': '#10b981',
  'sky-500': '#0ea5e9',
  'amber-500': '#f59e0b',
  'fuchsia-500': '#d946ef',
  'slate-500': '#64748b',
  // Adicione outras cores conforme necessario, ou ajuste para usar uma paleta mais robusta
};

const RiskVisualizer: React.FC<RiskVisualizerProps> = ({ chipEV, riskPremium, color }) => {
  // Garante que chipEV esteja entre 0 e 100 para escalonamento visual consistente
  const normalizedChipEV = Math.max(0, Math.min(100, chipEV));

  // Calcula o valor da equidade ICM, aplicando o Risk Premium
  // Exemplo: se ChipEV = 80 e RP = 0.2 (20%), ICMev = 80 * (1 - 0.2) = 64
  const icmEV = normalizedChipEV * (1 - riskPremium);

  // Define a transicao padrao para as animacoes Framer Motion
  const transition = { type: 'spring' as const, stiffness: 100, damping: 20 };

  // Funcao para obter a cor hexadecimal a partir de uma classe Tailwind ou valor direto
  const getFillColor = (tailwindColor: string): string => {
    return COLOR_MAP[tailwindColor] || tailwindColor;
  };

  const currentFillColor = getFillColor(color);

  // Path SVG para a forma de valor. Comeca no fundo, sobe ate a altura do EV,
  // e tem uma curva suave no topo para representar o "volume" da equidade.
  // M 0 100 (inicio inferior esquerdo)
  // L 0 (100 - altura_EV) (sobe ate a altura do EV)
  // C 30 (100 - altura_EV - 10) 70 (100 - altura_EV - 10) 100 (100 - altura_EV) (curva Bezier para o topo)
  // L 100 100 (desce ate o inferior direito)
  // Z (fecha o path)
  const createValuePath = (height: number) => {
    return `M0,100 L0,${100 - height} C30,${100 - height - 10} 70,${100 - height - 10} 100,${100 - height} L100,100 Z`;
  };

  const chipEVPath = createValuePath(normalizedChipEV);
  const icmEVPath = createValuePath(icmEV);

  return (
    <div className="relative w-full h-48"> {/* Container com altura fixa, ajustavel via CSS/Tailwind */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Linhas de grade de fundo para referencia visual */}
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="0.5">
          {[20, 40, 60, 80].map(y => (
            <line key={`grid-y-${y}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </g>

        {/* Forma de referencia para o ChipEV (potencial total), em tom suave */}
        <motion.path
          d={chipEVPath}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
          transition={transition}
        />

        {/* Forma animada da Equidade ICM (o "valor real" pos-RP) */}
        <motion.path
          d={icmEVPath}
          fill={currentFillColor}
          stroke={currentFillColor}
          strokeWidth="1"
          transition={transition}
          // Animacao inicial para um efeito de "entrada" suave
          initial={{ opacity: 0.7, scaleY: 0.9 }}
          animate={{ opacity: 1, scaleY: 1 }}
          style={{ transformOrigin: 'bottom' }}    // Garante que a escalaY ancore na base
        />

        {/* Labels de texto para os valores de ChipEV e ICMEV */}
        <text
          x="5"
          y={100 - normalizedChipEV - 5}
          className="fill-white opacity-70"
          style={{ fontSize: '6px' }} // Ajuste de tamanho para caber no SVG
        >
          ChipEV: {normalizedChipEV.toFixed(0)}%
        </text>
        <text
          x="5"
          y={100 - icmEV - 5}
          className="fill-white"
          style={{ fontSize: '6px', fill: currentFillColor }}
        >
          ICMEV: {icmEV.toFixed(0)}%
        </text>

        {/* Linha indicadora do efeito do Risk Premium (se RP > 0) */}
        {riskPremium > 0.01 && ( // Mostra a linha apenas se houver RP significativo
          <motion.line
            x1="0"
            y1={100 - icmEV - 2}
            x2="100"
            y2={100 - icmEV - 2}
            stroke="white"
            strokeDasharray="2 2" // Linha tracejada
            strokeWidth="0.5"
            className="opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.2, ...transition }}
          />
        )}
      </svg>
    </div>
  );
};

export default RiskVisualizer;
