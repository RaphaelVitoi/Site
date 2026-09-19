/**
 * IDENTITY: Testes de Renderização e Interação para ProspectRiskCorridorWidget
 * PATH: src/tests/simulator/prospectRiskCorridorWidget.test.tsx
 *
 * @format
 */

import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProspectRiskCorridorWidget } from '@/components/simulator/ui/ProspectRiskCorridorWidget';
import { CANONICAL_ANCHORS, type CanonicalAnchor } from '@/lib/prospectCorridor';

function TestHarness() {
  const [activeAnchorId, setActiveAnchorId] = useState<string>('convex_leverage_ip');
  const [psi, setPsi] = useState<number>(0.8);
  const [realization, setRealization] = useState<number>(1.25);

  const handleSelect = (anchor: CanonicalAnchor) => {
    setActiveAnchorId(anchor.id);
    setPsi(anchor.defaults.psiFactor);
    setRealization(anchor.defaults.realizationFactor);
  };

  return (
    <ProspectRiskCorridorWidget
      rawEquity={0.55}
      realizationFactor={realization}
      psiFactor={psi}
      potOdds={0.30}
      spr={7.0}
      numPlayers={2}
      lossAversionLambda={2.25}
      isNearPayjump={false}
      activeAnchorId={activeAnchorId}
      onSelectAnchor={handleSelect}
    />
  );
}

describe('ProspectRiskCorridorWidget: Elementos Específicos (Âncoras) e Ativação', () => {
  test('renderiza as 5 âncoras canônicas e destaca a âncora ativa', () => {
    render(<TestHarness />);

    // Todas as 5 âncoras devem estar presentes como botões
    CANONICAL_ANCHORS.forEach((anchor) => {
      expect(screen.getByText(anchor.name)).toBeInTheDocument();
      expect(screen.getByText(anchor.tag)).toBeInTheDocument();
    });

    // A âncora ativa deve exibir o badge 'ATIVA'
    expect(screen.getByText('ATIVA')).toBeInTheDocument();
  });

  test('exibe o critério lógico explícito da âncora ativa', () => {
    render(<TestHarness />);

    const activeAnchor = CANONICAL_ANCHORS.find((a) => a.id === 'convex_leverage_ip')!;
    expect(screen.getByText(activeAnchor.criterioLogico)).toBeInTheDocument();
    expect(screen.getByText(`“${activeAnchor.diretrizEstrategica}”`)).toBeInTheDocument();
  });

  test('ativa nova âncora ao clicar e atualiza os critérios lógicos e métricas', () => {
    render(<TestHarness />);

    // Clicar na Âncora 1: Bolha ICM Crítica
    const bubbleBtn = screen.getByText('1. Bolha ICM Crítica').closest('button')!;
    fireEvent.click(bubbleBtn);

    const bubbleAnchor = CANONICAL_ANCHORS.find((a) => a.id === 'ft_bubble')!;
    expect(screen.getByText(bubbleAnchor.criterioLogico)).toBeInTheDocument();
    expect(screen.getByText(`“${bubbleAnchor.diretrizEstrategica}”`)).toBeInTheDocument();
  });

  test('renderiza o gráfico do corredor estocástico com acessibilidade', () => {
    render(<TestHarness />);

    const svg = screen.getByLabelText('Gráfico do Corredor Estocástico');
    expect(svg).toBeInTheDocument();
    expect(screen.getByText(/Worst-Case \(VaR -2σ\):/)).toBeInTheDocument();
    expect(screen.getByText(/Piso Breakeven: 0.0%/)).toBeInTheDocument();
  });
});
