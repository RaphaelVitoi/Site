import { fireEvent, render, screen, within } from '@testing-library/react';
import { SCENARIOS } from '../../components/simulator/solver/scenarios';
import { ScenarioQuickSelector } from '../../components/simulator/ui/ScenarioQuickSelector';

test('groups Atlas scenarios by strategic family and reveals cases on demand', () => {
  const onSelect = jest.fn();
  const { rerender } = render(
    <ScenarioQuickSelector scenarios={SCENARIOS} activeId="chipev" onSelect={onSelect} />,
  );

  const references = screen.getByText('Referenciais').closest('details');
  const clinical = screen.getByText('Casos clínicos').closest('details');
  const toyGames = screen.getByText('Toy games').closest('details');

  expect(references?.open).toBe(true);
  expect(clinical?.open).toBe(false);
  expect(toyGames?.open).toBe(false);
  expect(within(references as HTMLElement).getAllByRole('button')).toHaveLength(2);

  fireEvent.click(screen.getByText('Casos clínicos'));

  expect(clinical?.open).toBe(true);
  expect(within(clinical as HTMLElement).getAllByRole('button')).toHaveLength(8);

  fireEvent.click(screen.getByText('Toy games'));
  expect(within(toyGames as HTMLElement).getAllByRole('button')).toHaveLength(2);

  rerender(<ScenarioQuickSelector scenarios={SCENARIOS} activeId="chipev" onSelect={onSelect} />);
  expect(references?.open).toBe(true);
  expect(clinical?.open).toBe(true);
  expect(toyGames?.open).toBe(true);

  const clinicalScenario = within(clinical as HTMLElement).getByRole('button', {
    name: /Paradoxo do Valuation/,
  });
  fireEvent.click(clinicalScenario);
  expect(onSelect).toHaveBeenCalledWith('paradoxo');

  rerender(<ScenarioQuickSelector scenarios={SCENARIOS} activeId="paradoxo" onSelect={onSelect} />);
  expect(clinical?.open).toBe(true);
  expect(references?.open).toBe(false);
  expect(clinicalScenario.getAttribute('aria-pressed')).toBe('true');
});

test('opens the family containing the active scenario', () => {
  render(<ScenarioQuickSelector scenarios={SCENARIOS} activeId="paradoxo" onSelect={jest.fn()} />);

  expect(screen.getByText('Casos clínicos').closest('details')?.open).toBe(true);
  expect(screen.getByText('Referenciais').closest('details')?.open).toBe(false);
});

test('formats Atlas indices with two digits after scenario nine', () => {
  const finalScenario = SCENARIOS.at(-1);
  if (!finalScenario) throw new Error('Atlas scenarios are required for this test');

  render(
    <ScenarioQuickSelector scenarios={SCENARIOS} activeId={finalScenario.id} onSelect={jest.fn()} />,
  );

  const finalCard = screen.getByRole('button', { name: /Bully do Botão/ });
  expect(within(finalCard).getByText('12', { exact: true })).toBeDefined();
});
