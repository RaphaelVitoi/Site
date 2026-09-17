import { render, screen } from '@testing-library/react';
import { RECOMENDACOES_POR_VETOR, SniperAdvisor } from './SniperAdvisor';

// As seis chaves que o perfil preditivo produz (predictive_forest.py -> /api/v1/predictive).
const VETORES_DO_PERFIL = [
	'Aversão ao Risco',
	'Pot Entrapment',
	'Miopia de Payjump',
	'Excesso de Agressão',
	'Passivo Estrutural (RIO)',
	'Desvio de Nash',
];

describe('SniperAdvisor (FE-07)', () => {
	it.each(VETORES_DO_PERFIL)('tem recomendação própria para "%s"', (vetor) => {
		render(<SniperAdvisor topVazamento={vetor} />);
		expect(screen.getByText(RECOMENDACOES_POR_VETOR[vetor]!)).toBeInTheDocument();
	});

	it('cobre exatamente os vetores do perfil, sem chave morta', () => {
		expect(Object.keys(RECOMENDACOES_POR_VETOR).sort()).toEqual([...VETORES_DO_PERFIL].sort());
	});

	it('não recomenda nada sem vetor conhecido, em vez de texto genérico', () => {
		const { container } = render(<SniperAdvisor topVazamento="Risk Premium" />);
		expect(container).toBeEmptyDOMElement();
	});

	it('não afirma percentual de ajuste sem medição', () => {
		for (const texto of Object.values(RECOMENDACOES_POR_VETOR)) expect(texto).not.toMatch(/\d+\s*%/);
	});
});
