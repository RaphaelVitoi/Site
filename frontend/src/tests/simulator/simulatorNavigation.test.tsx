import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { ActiveTool } from '../../components/simulator/MasterSimulator';
import SimulatorNavigation from '../../components/simulator/ui/SimulatorNavigation';

function Harness() {
  const [tool, setTool] = useState<ActiveTool>('scenario');
  return <SimulatorNavigation activeTool={tool} onSelectTool={setTool} />;
}

test('tool tabs support keyboard selection with a single tab stop', () => {
  render(<Harness />);
  const list = screen.getByRole('tablist', { name: 'Ferramentas do simulador' });
  expect(list).toBeDefined();
  const initial = screen.getByRole('tab', { name: 'Cenário Ativo' });
  fireEvent.keyDown(initial, { key: 'ArrowRight' });
  const next = screen.getByRole('tab', { name: 'Quantum PM' });
  expect(next.getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(next);
  expect(initial.tabIndex).toBe(-1);
  fireEvent.keyDown(next, { key: 'End' });
  const last = screen.getByRole('tab', { name: 'CFR & IA' });
  expect(document.activeElement).toBe(last);
  fireEvent.keyDown(last, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(initial);
});
