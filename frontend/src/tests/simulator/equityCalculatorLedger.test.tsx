import { fireEvent, render, screen } from '@testing-library/react';
import EquityCalculator from '../../components/simulator/panels/EquityCalculator';

jest.mock('../../components/simulator/hooks/useIcmCalculations', () => ({ useIcmCalculations: () => ({ results: [], totalChips: 95, totalPrizes: 10000 }) }));
jest.mock('../../components/simulator/SotaContext', () => ({ SotaWasmContext: jest.requireActual<typeof import('react')>('react').createContext(null) }));
jest.mock('../../components/simulator/ui/MonteCarloConvergenceWidget', () => ({ MonteCarloConvergenceWidget: () => null }));
jest.mock('../../components/simulator/ui/DynamicFoldEquityWidget', () => ({ DynamicFoldEquityWidget: () => null }));
jest.mock('../../components/simulator/ui/GeminiVoicePlayer', () => ({ GeminiVoicePlayer: () => null }));
jest.mock('../../components/simulator/ui/InsolvencyRioPanel', () => ({ InsolvencyRioPanel: () => null }));

test('HH and HRC have visible independent entry points and the import form opens before presets', () => {
  render(<EquityCalculator />);
  fireEvent.click(screen.getByRole('button', { name: 'Importar cenário HRC' }));
  expect(screen.getByRole('heading', { name: 'Importar cenário HRC' })).toBeTruthy();
  expect(screen.getByLabelText('Carregar HH ou configuração HRC').getAttribute('accept')).toContain('.hrcz');
  const form = screen.getByRole('heading', { name: 'Importar cenário HRC' });
  const preset = screen.getByRole('button', { name: 'FT MTT · HU' });
  expect(form.compareDocumentPosition(preset) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Importar HH' }));
  expect(screen.getByRole('heading', { name: 'Importar Hand History' })).toBeTruthy();
  expect(screen.getByLabelText('Input original')).toBeTruthy();
});

test('chip and currency totals remain fixed during editing; display toggles do not reinterpret inputs', () => {
  render(<EquityCalculator />);
  const stacks = screen.getAllByLabelText('Stack do Jogador') as HTMLInputElement[];
  const payouts = screen.getAllByLabelText('Premiação') as HTMLInputElement[];
  const exportButton = screen.getByText('Exportar contexto e seleção') as HTMLButtonElement;
  expect(exportButton.disabled).toBe(false);
  expect(stacks[0]!.value).toBe('40000');
  expect((screen.getByLabelText('Após fold: Jogador 1') as HTMLInputElement).value).toBe('40000');
  expect((screen.getByText('Calcular transições ICM') as HTMLButtonElement).disabled).toBe(false);
  expect(payouts[0]!.value).toBe('6500');
  fireEvent.click(screen.getByLabelText('Exibir BB'));
  fireEvent.click(screen.getByLabelText('Exibir percentuais dos payouts'));
  expect(stacks[0]!.value).toBe('40000');
  expect(payouts[0]!.value).toBe('6500');
  fireEvent.change(stacks[0]!, { target: { value: '20250' } });
  expect(exportButton.disabled).toBe(true);
  expect((screen.getByLabelText('Total de fichas do torneio') as HTMLInputElement).value).toBe('95000');
  fireEvent.change(stacks[1]!, { target: { value: '74750' } });
  expect(exportButton.disabled).toBe(false);
  fireEvent.change(payouts[0]!, { target: { value: '6499.99' } });
  expect(exportButton.disabled).toBe(true);
  expect((screen.getByLabelText('Prize pool restante') as HTMLInputElement).value).toBe('10000');
  fireEvent.change(payouts[1]!, { target: { value: '3500.01' } });
  expect(exportButton.disabled).toBe(false);
  expect(screen.getByText('BTN / SB')).toBeTruthy();
});
