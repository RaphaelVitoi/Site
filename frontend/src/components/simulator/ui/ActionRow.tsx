/**
 * IDENTITY: Linha de Ação GTO SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/ActionRow.tsx
 * ROLE: Exibe a frequência de uma ação específica e sua distorção de Nash.
 */

'use client';

import type { ChipEvFreqs, FreqResult } from '@/components/simulator/solver/types';
import AnimatedNumber from '../ui/AnimatedNumber';
import { FreqInput } from './FreqInput';
import { InfoTooltip } from './InfoTooltip';

interface ActionRowProps {
  label: string;
  labelTooltip?: string;
  chipEv: number;
  result: FreqResult;
  field: keyof ChipEvFreqs;
  accent: string;
  freqs: ChipEvFreqs;
  onChange: (freqs: ChipEvFreqs) => void;
}

export const ActionRow = ({
  label,
  labelTooltip,
  chipEv,
  result,
  field,
  accent,
  freqs,
  onChange,
}: Readonly<ActionRowProps>) => {
  // Frequência de Entrada e Alvo Nash GTO
  const userFreq = Number(chipEv) || 0;
  const userFreqPct = Math.max(0, Math.min(100, userFreq));
  const gtoTarget = result.center;
  const gtoTargetPct = Math.max(0, Math.min(100, gtoTarget));

  // Desvio real do usuário em relação ao GTO:
  // Aumentar acima do GTO = Excesso (+ com ▲)
  // Diminuir abaixo do GTO = Déficit (- com ▼)
  // Na margem de ±1% = Equilíbrio (0% com ●)
  const deviation = userFreq - gtoTarget;
  const absDeviation = Math.abs(deviation);
  const isEquilibrium = absDeviation <= 1.0;
  const isExcesso = deviation > 1.0;
  const isDeficit = deviation < -1.0;

  let deltaLabel = 'Déficit';
  let deltaBadgeColor = '#f59e0b';
  let deltaIcon = '▼';
  let deltaSign = '';

  if (isEquilibrium) {
    deltaLabel = 'Equilíbrio';
    deltaBadgeColor = '#10b981';
    deltaIcon = '●';
  } else if (isExcesso) {
    deltaLabel = 'Excesso';
    deltaBadgeColor = '#f43f5e';
    deltaIcon = '▲';
    deltaSign = '+';
  }

  const formattedDelta = isEquilibrium ? '0%' : `${deltaSign}${deviation.toFixed(0)}%`;

  return (
    <div className="group/row flex flex-col gap-2 rounded-2xl border border-white/6 bg-slate-950/45 p-3 transition-all duration-300 hover:border-white/15 hover:bg-slate-950/75">
      {/* Andar 1: Identificação da Ação e Diagnóstico de Divergência com Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-bold tracking-wide uppercase" style={{ color: accent }}>
          {label} {labelTooltip && <InfoTooltip text={labelTooltip} />}
        </span>

        {/* Badge Didático do Delta (Divergência) + Status */}
        <div
          className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 font-mono text-xs font-bold tabular-nums shadow-sm"
          style={{
            color: deltaBadgeColor,
            borderColor: `${deltaBadgeColor}44`,
            backgroundColor: `${deltaBadgeColor}15`,
          }}
          title={`Divergência da ação ${label}: ${formattedDelta} em relação ao equilíbrio Nash GTO`}
        >
          <span className="text-xs opacity-80">{deltaIcon}</span>
          <span>{formattedDelta}</span>
          <span className="ml-0.5 text-xs font-bold tracking-normal uppercase opacity-85">&middot; {deltaLabel}</span>
        </div>
      </div>

      {/* Andar 2: Comparativo Direto (Frequência -> Alvo GTO) - SEM "SUA:" */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-white/3 bg-black/35 px-2.5 py-2">
        {/* Frequência de Entrada */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-text-muted text-xs font-semibold">Sua freq.</span>
          <FreqInput value={chipEv} field={field} freqs={freqs} onChange={onChange} />
        </div>

        {/* Alvo Nash GTO */}
        <div className="min-w-0 text-right">
          <span className="text-text-muted block text-xs font-semibold">Alvo GTO</span>
          <div className="flex flex-col items-end leading-tight">
            <span className="font-mono text-base font-bold tracking-tight whitespace-nowrap text-white tabular-nums">
              <AnimatedNumber value={result.center} suffix="%" />
            </span>
            <span className="text-text-muted font-mono text-xs whitespace-nowrap tabular-nums">
              ±{result.spread.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Andar 3: Barra de Frequência Inferior (Preenche ao aumentar, esvazia ao diminuir) */}
      <div
        className="relative mt-0.5 h-2.5 w-full cursor-default overflow-hidden rounded-full border border-white/10 bg-black/80 shadow-inner"
        title={`Frequência: ${userFreq}% | Alvo GTO: ${gtoTarget.toFixed(1)}% | Desvio: ${formattedDelta} (${deltaLabel})`}
      >
        {/* Zona de Déficit (sombra sutil até o alvo GTO) */}
        {isDeficit && (
          <div
            className="absolute top-0 bottom-0 bg-amber-500/20"
            style={{
              left: `${userFreqPct}%`,
              width: `${Math.max(0, gtoTargetPct - userFreqPct)}%`,
            }}
          />
        )}

        {/* Preenchimento da Frequência do Jogador */}
        <div
          className="relative z-10 h-full rounded-full transition-[width] duration-250 ease-out"
          style={{
            width: `${userFreqPct}%`,
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />

        {/* Zona de Excesso (destaque rose de ultrapassagem além do alvo GTO) */}
        {isExcesso && (
          <div
            style={{
              left: `${gtoTargetPct}%`,
              width: `${Math.max(0, userFreqPct - gtoTargetPct)}%`,
            }}
            className="absolute top-0 bottom-0 z-15 rounded-r-full bg-rose-500/80 shadow-[0_0_10px_#f43f5e] transition-[left,width] duration-250 ease-out"
          />
        )}

        {/* Marcador Vertical do Alvo Nash GTO (Sempre visível sobre a barra) */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-20 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
          style={{ left: `calc(${gtoTargetPct}% - 2px)` }}
          title={`Alvo Nash GTO: ${gtoTarget.toFixed(1)}% ±${result.spread.toFixed(1)}%`}
        />
      </div>
    </div>
  );
};
