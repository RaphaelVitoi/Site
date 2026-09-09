import structureCollection from './fixtures/hrc-structure-pko.json';
import nativeSettings from './fixtures/hrc-native-settings.json';
import { pokerStarsHand, ggHand } from './fixtures/handHistories';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TournamentTableImport from '../../components/simulator/panels/TournamentTableImport';

const players = Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `P${i}`, stack: 100 + i, tableId: i < 9 ? 'FT' : 'Outra', seat: i < 9 ? i + 1 : i - 8 }));

test('requires a table and hand selection while preserving all source players and payouts', () => {
  const apply = jest.fn();
  render(<TournamentTableImport onApply={apply} />);
  const raw = JSON.stringify({ room: 'PokerStars', stackUnit: 'bb', players, prizes: [60, 30, 10] });
  fireEvent.change(screen.getByLabelText('Input original'), { target: { value: raw } });
  fireEvent.click(screen.getByText('Ler contexto do torneio'));
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Mesa registrada no input'), { target: { value: 'FT' } });
  fireEvent.click(screen.getByLabelText('Na mão: P0'));
  fireEvent.click(screen.getByLabelText('Na mão: P1'));
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply).toHaveBeenCalledWith(expect.objectContaining({
    population: players, prizes: [60, 30, 10],
    snapshot: expect.objectContaining({ rawInput: raw, players }),
    selection: { room: 'PokerStars', playerIds: players.slice(0, 9).map(p => p.id), participantIds: ['0', '1'] },
  }));
});

test('changing to GGPoker does not silently truncate a nine-seat table', () => {
  const apply = jest.fn();
  render(<TournamentTableImport onApply={apply} />);
  fireEvent.change(screen.getByLabelText('Input original'), { target: { value: JSON.stringify({ stackUnit: 'bb', players, prizes: [100] }) } });
  fireEvent.click(screen.getByText('Ler contexto do torneio'));
  fireEvent.change(screen.getByLabelText('Sala da mesa'), { target: { value: 'GGPoker' } });
  fireEvent.change(screen.getByLabelText('Mesa registrada no input'), { target: { value: 'FT' } });
  fireEvent.click(screen.getByLabelText('Na mão: P0'));
  fireEvent.click(screen.getByLabelText('Na mão: P1'));
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('2 a 8');
  expect(screen.getByLabelText('Mesa: P8')).toBeChecked();
  fireEvent.click(screen.getByLabelText('Mesa: P8'));
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply.mock.calls[0][0].population).toHaveLength(12);
  expect(apply.mock.calls[0][0].selection.playerIds).toHaveLength(8);
});


test.each([[pokerStarsHand, 'PokerStars', 100], [ggHand, 'GGPoker', 1000]] as const)('pasting a supported HH automatically fills the preview without a separate parse click', (text, room, bb) => {
  const apply = jest.fn();
  render(<TournamentTableImport onApply={apply} />);
  fireEvent.change(screen.getByLabelText('Input original'), { target: { value: text } });
  expect(screen.getByLabelText('Sala da mesa')).toHaveValue(room);
  expect(screen.getByLabelText('Big blind em fichas')).toHaveValue(bb);
  expect(screen.getByLabelText('Mesa: Hero')).toBeChecked();
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply).toHaveBeenCalledWith(expect.objectContaining({ population: expect.any(Array), bigBlind: bb,
    selection: expect.objectContaining({ room, participantIds: [] }), snapshot: expect.objectContaining({ payoutUnit: 'percent-remaining-pool' }) }));
});

test('file upload reads HH automatically and invalid replacement cannot apply the previous preview', async () => {
  const apply = jest.fn();
  render(<TournamentTableImport onApply={apply} />);
  fireEvent.change(screen.getByLabelText('Carregar HH ou configuração HRC'), { target: { files: [new File([ggHand], 'gg.txt', { type: 'text/plain' })] } });
  await waitFor(() => expect(screen.getByLabelText('Sala da mesa')).toHaveValue('GGPoker'));
  expect(screen.getByLabelText('Input original')).toHaveValue(ggHand);
  fireEvent.change(screen.getByLabelText('Input original'), { target: { value: '{broken' } });
  expect(screen.queryByText('Analisar mesa com contexto completo')).not.toBeInTheDocument();
  expect(apply).not.toHaveBeenCalled();
});


test('native HRC JSON file fills the table, blind, payouts and whole tournament context', async () => {
  const apply = jest.fn();
  render(<TournamentTableImport onApply={apply} defaultRoom="PokerStars" />);
  fireEvent.change(screen.getByLabelText('Carregar HH ou configuração HRC'), { target: { files: [new File([JSON.stringify(nativeSettings)], 'hand.json', { type: 'application/json' })] } });
  await waitFor(() => expect(screen.getByLabelText('Big blind em fichas')).toHaveValue(1000));
  expect(screen.getByLabelText('Mesa: HRC 1')).toBeChecked();
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply.mock.calls[0][0].population).toHaveLength(13);
  expect(apply.mock.calls[0][0].selection.playerIds).toHaveLength(6);
  expect(apply.mock.calls[0][0].prizes).toHaveLength(13);
});


test.each(['structure-first', 'hand-first'])('structure + HH automatic composition: %s', order => {
  const apply = jest.fn();
  render(<TournamentTableImport onApply={apply} />);
  const structureText = JSON.stringify(structureCollection);
  const loadHand = () => fireEvent.change(screen.getByLabelText('Input original'), { target: { value: pokerStarsHand } });
  const loadStructure = () => fireEvent.change(screen.getByLabelText('JSON de estrutura'), { target: { value: structureText } });
  if (order === 'hand-first') { loadHand(); loadStructure(); } else { loadStructure(); loadHand(); }
  expect(screen.getByLabelText('Input original')).toHaveValue(pokerStarsHand);
  expect(screen.getByLabelText('Payouts restantes de todo o torneio')).toHaveValue('442.6, 441.4, 261.89');
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply).toHaveBeenCalledWith(expect.objectContaining({ snapshot: expect.objectContaining({
    rawInput: pokerStarsHand, declaredTotalChips: 7000000, paidPlaces: 239, payoutUnit: 'absolute',
    structureSource: expect.objectContaining({ rawInput: structureText, bountyType: 'PKO' }),
  }) }));
});

test('main file input recognizes structures without replacing the hand', async () => {
  render(<TournamentTableImport onApply={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('Input original'), { target: { value: pokerStarsHand } });
  fireEvent.change(screen.getByLabelText('Carregar HH ou configuração HRC'), { target: { files: [new File([JSON.stringify(structureCollection)], 'structure.json')] } });
  await waitFor(() => expect(screen.getByText(/239 posições pagas · pool por colocação/)).toBeInTheDocument());
  expect(screen.getByLabelText('Input original')).toHaveValue(pokerStarsHand);
  expect(screen.getByLabelText('Mesa: Hero')).toBeChecked();
});

test('collections require explicit choice and invalid replacement preserves valid structure', () => {
  const apply = jest.fn();
  render(<TournamentTableImport onApply={apply} />);
  fireEvent.change(screen.getByLabelText('Input original'), { target: { value: pokerStarsHand } });
  fireEvent.change(screen.getByLabelText('JSON de estrutura'), { target: { value: JSON.stringify({ ...structureCollection, folders: [structureCollection] }) } });
  fireEvent.click(screen.getByText('Analisar mesa com contexto completo'));
  expect(apply).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Selecionar estrutura'), { target: { value: '/folders/0/structures/0' } });
  fireEvent.change(screen.getByLabelText('JSON de estrutura'), { target: { value: '{broken' } });
  expect(screen.getByLabelText('Payouts restantes de todo o torneio')).toHaveValue('442.6, 441.4, 261.89');
  expect(screen.getByRole('alert')).toBeInTheDocument();
});


test('dedicated structure file works before HH and original collection can be exported unchanged', async () => {
  const create = jest.fn(() => 'blob:structure');
  const previous = URL.createObjectURL;
  URL.createObjectURL = create;
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  try {
    render(<TournamentTableImport onApply={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Carregar estrutura JSON'), { target: { files: [new File([JSON.stringify(structureCollection)], 'structure.json')] } });
    await waitFor(() => expect(screen.getByText(/Estrutura carregada/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('Exportar coleção de estruturas original'));
    expect(create).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Input original'), { target: { value: ggHand } });
    expect(screen.getByLabelText('Payouts restantes de todo o torneio')).toHaveValue('442.6, 441.4, 261.89');
  } finally { URL.createObjectURL = previous; click.mockRestore(); }
});
