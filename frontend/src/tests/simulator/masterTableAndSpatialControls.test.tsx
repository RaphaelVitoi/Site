/**
 * IDENTITY: Suíte de Testes da Topologia da Mesa e Controles Espaciais SOTA v8.0 GOLD
 * PATH: frontend/src/tests/simulator/masterTableAndSpatialControls.test.tsx
 * ROLE: Validar destaque de oponentes (Vice CL x CL), RPs exatos, papéis táticos, formatação de BBs sem .0 e layout espacial.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('mermaid', () => ({
  __esModule: true,
  default: { initialize: jest.fn(), render: jest.fn() },
}));
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => {
    const parts = (children || '').split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
      <div data-testid="markdown-output">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i}>{part.slice(1, -1)}</em>;
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  },
}));
jest.mock('rehype-katex', () => () => undefined);
jest.mock('rehype-slug', () => () => undefined);
jest.mock('remark-gfm', () => () => undefined);
jest.mock('remark-math', () => () => undefined);
jest.mock('katex/dist/katex.min.css', () => ({}));

import { MasterTableVisualizer, resolveTableSpot, formatBb } from '@/components/simulator/ui/MasterTableVisualizer';
import { SpatialControls } from '@/components/simulator/ui/SpatialControls';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { SCENARIOS } from '@/components/simulator/solver/scenarios';
import type { Scenario } from '@/components/simulator/solver/types';

describe('formatBb — Dispensar decimal .0 em números inteiros de BB', () => {
  it('remove decimal .0 quando o valor for inteiro', () => {
    expect(formatBb(25)).toBe('25 BB');
    expect(formatBb(25.0)).toBe('25 BB');
    expect(formatBb(90)).toBe('90 BB');
    expect(formatBb(70)).toBe('70 BB');
    expect(formatBb(15)).toBe('15 BB');
  });

  it('preserva decimal quando houver fração real', () => {
    expect(formatBb(9.4)).toBe('9.4 BB');
    expect(formatBb(52.4)).toBe('52.4 BB');
    expect(formatBb(22.2)).toBe('22.2 BB');
    expect(formatBb(53.9)).toBe('53.9 BB');
  });
});

describe('MasterTableVisualizer — Resolução e Destaque de Oponentes e RPs', () => {
  const pactoScenario = SCENARIOS.find((s) => s.id === 'pacto') as Scenario;
  const icmevScenario = SCENARIOS.find((s) => s.id === 'icmev-puro') as Scenario;
  const sniperScenario = SCENARIOS.find((s) => s.id === 'sniper') as Scenario;

  it('resolveTableSpot: mapeia corretamente assentos físicos e papéis no cenário Pacto (Vice CL vs CL)', () => {
    // Quando Hero é OOP (BB)
    const spotOop = resolveTableSpot(pactoScenario, 'OOP', 22.2, 20.0);
    expect(spotOop.ipSeat).toBe('CO');
    expect(spotOop.oopSeat).toBe('BB');
    expect(spotOop.heroSeat).toBe('BB');
    expect(spotOop.heroRole).toBe('CL');
    expect(spotOop.heroRp).toBe(20.0);
    expect(spotOop.villainSeat).toBe('CO');
    expect(spotOop.villainRole).toBe('Vice CL');
    expect(spotOop.villainRp).toBe(22.2);

    // Quando Hero é IP (CO)
    const spotIp = resolveTableSpot(pactoScenario, 'IP', 22.2, 20.0);
    expect(spotIp.heroSeat).toBe('CO');
    expect(spotIp.heroRole).toBe('Vice CL');
    expect(spotIp.heroRp).toBe(22.2);
    expect(spotIp.villainSeat).toBe('BB');
    expect(spotIp.villainRole).toBe('CL');
    expect(spotIp.villainRp).toBe(20.0);
  });

  it('MasterTableVisualizer: renderiza na mesa os oponentes (BB CL e CO Vice CL) com seus RPs e papéis, com BBs sem .0', () => {
    render(
      <MasterTableVisualizer
        scenario={pactoScenario}
        heroPosition="OOP"
        currentPot={15}
        effectiveIpRp={22.2}
        effectiveOopRp={20.0}
      />
    );

    // Cabeçalho deve informar Hero (BB · CL) e Villain (CO · Vice CL) com RPs corretos
    expect(screen.getByText(/Hero \(BB · CL\): 20.0% RP/)).toBeInTheDocument();
    expect(screen.getByText(/Villain \(CO · Vice CL\): 22.2% RP/)).toBeInTheDocument();

    // Pills de papel tático nos assentos da mesa
    expect(screen.getByText('CL')).toBeInTheDocument();
    expect(screen.getByText('Vice CL')).toBeInTheDocument();

    // Badges de RP nos assentos destacados
    expect(screen.getByText('RP 20.0%')).toBeInTheDocument();
    expect(screen.getByText('RP 22.2%')).toBeInTheDocument();

    // Stacks exibidos na mesa (70 BB e 65 BB, dispensando .0)
    expect(screen.getByText('70 BB')).toBeInTheDocument();
    expect(screen.getByText('65 BB')).toBeInTheDocument();

    // Pote total dispensando .0
    expect(screen.getByText('15 BB')).toBeInTheDocument();
  });

  it('MasterTableVisualizer: cenário ICMev Puro possui RP tradicional e destaca oponentes', () => {
    render(
      <MasterTableVisualizer
        scenario={icmevScenario}
        heroPosition="BB"
        currentPot={2.5}
        effectiveIpRp={18.5}
        effectiveOopRp={18.5}
      />
    );

    expect(screen.getByText(/Hero \(BB · Mid\): 18.5% RP/)).toBeInTheDocument();
    expect(screen.getByText(/Villain \(BTN · Mid\): 18.5% RP/)).toBeInTheDocument();
    expect(screen.getAllByText('RP 18.5%').length).toBeGreaterThanOrEqual(2);
  });

  it('MasterTableVisualizer: cenário Franco-Atirador destaca SB (CL) e BB com RPs', () => {
    render(
      <MasterTableVisualizer
        scenario={sniperScenario}
        heroPosition="BB"
        currentPot={1.5}
        effectiveIpRp={12.0}
        effectiveOopRp={45.0}
      />
    );

    expect(screen.getByText(/Hero \(BB\): 45.0% RP/)).toBeInTheDocument();
    expect(screen.getByText(/Villain \(SB · SB \(CL\)\): 12.0% RP/)).toBeInTheDocument();
    expect(screen.getByText('RP 45.0%')).toBeInTheDocument();
    expect(screen.getByText('RP 12.0%')).toBeInTheDocument();
  });

  it('MasterTableVisualizer: permite alternar posição ao clicar no assento', () => {
    const handleSelectPosition = jest.fn();
    render(
      <MasterTableVisualizer
        scenario={pactoScenario}
        heroPosition="OOP"
        currentPot={15}
        effectiveIpRp={22.2}
        effectiveOopRp={20.0}
        onSelectPosition={handleSelectPosition}
      />
    );

    // Clicar no assento CO (que é o IP seat no cenário pacto)
    const coSeat = screen.getByText('CO');
    fireEvent.click(coSeat);
    expect(handleSelectPosition).toHaveBeenCalledWith('IP');

    // Clicar no assento BB (que é o OOP seat)
    const bbSeat = screen.getByText('BB');
    fireEvent.click(bbSeat);
    expect(handleSelectPosition).toHaveBeenCalledWith('BB');
  });
});

describe('SpatialControls — Simetria, Harmonia e Acessibilidade dos Controles', () => {
  it('renderiza os 5 controles harmonizados em layout espaçoso sem colisão de labels', () => {
    const handleHeroPos = jest.fn();
    const setHeroInvested = jest.fn();
    const setCurrentPot = jest.fn();
    const setActivePlayers = jest.fn();
    const setIsPredictive = jest.fn();

    render(
      <SpatialControls
        heroPosition="OOP"
        handleHeroPositionChange={handleHeroPos}
        heroInvested={35}
        setHeroInvested={setHeroInvested}
        currentPot={15}
        setCurrentPot={setCurrentPot}
        activePlayers={2}
        setActivePlayers={setActivePlayers}
        isPredictive={true}
        setIsPredictive={setIsPredictive}
      />
    );

    // 5 labels harmonizados
    expect(screen.getByText('Posição (Ponto Zero)')).toBeInTheDocument();
    expect(screen.getByText('Sunk Cost (Investido)')).toBeInTheDocument();
    expect(screen.getByText('Pote Atual')).toBeInTheDocument();
    expect(screen.getByText('Jogadores Ativos')).toBeInTheDocument();
    expect(screen.getByText('FGS / Erosão Temporal')).toBeInTheDocument();

    // Valores
    const investInput = screen.getByDisplayValue('35');
    expect(investInput).toBeInTheDocument();
    const potInput = screen.getByDisplayValue('15');
    expect(potInput).toBeInTheDocument();
    const playersInput = screen.getByDisplayValue('2');
    expect(playersInput).toBeInTheDocument();

    // Disparos de evento
    fireEvent.change(investInput, { target: { value: '40' } });
    expect(setHeroInvested).toHaveBeenCalledWith(40);

    fireEvent.change(potInput, { target: { value: '25' } });
    expect(setCurrentPot).toHaveBeenCalledWith(25);
  });
});

describe('SotaMarkdown — Normalização de tags HTML inline', () => {
  it('converte tags <strong> e <em> em formatação markdown válida sem exibir código bruto', () => {
    const sample = 'O texto contém <strong>negrito com tag</strong> e <em>itálico com tag</em>.';
    render(<SotaMarkdown content={sample} />);

    // Não deve conter os literais <strong> ou </strong> em texto
    expect(screen.queryByText(/<strong>/)).not.toBeInTheDocument();
    expect(screen.queryByText(/<\/strong>/)).not.toBeInTheDocument();

    // O texto em negrito deve existir no DOM
    expect(screen.getByText('negrito com tag')).toBeInTheDocument();
  });
});
