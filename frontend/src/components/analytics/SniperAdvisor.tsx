'use client';

import { GlassPanel } from '@/components/ui/layout/GlassPanel';

/**
 * Recomendação por vetor do perfil preditivo.
 *
 * FE-07 (auditoria 2026-09-17): o `switch` anterior comparava com 'Risk Premium', 'Bolha' e
 * 'Pós-Flop', chaves que o perfil nunca produz. Todo vazamento caía no texto genérico. As chaves
 * abaixo são exatamente as seis que `predictive_forest.py` e a rota /api/v1/predictive devolvem, e o
 * teste do componente falha se um vetor ficar sem recomendação.
 *
 * As recomendações são qualitativas de propósito: sem medição do spot, um percentual de ajuste
 * ("reduza X em 20%") seria número inventado.
 */
export const RECOMENDACOES_POR_VETOR: Readonly<Record<string, string>> = {
	'Aversão ao Risco':
		'Protocolo Sniper: o fold passivo está sendo tratado como gratuito. Antes de largar a mão, estime o custo de EV_fold até a próxima subida de blinds e compare com o risco do call.',
	'Pot Entrapment':
		'Protocolo Sniper: fichas já investidas estão pesando na decisão. Reavalie cada rua como decisão nova — o que está no pote não é seu, e continuar só se justifica pela equidade daqui para frente.',
	'Miopia de Payjump':
		'Protocolo Sniper: o próximo payjump está dominando a leitura. Pese o valor do salto contra a sobrevivência ativa até os saltos maiores; proteger um degrau pequeno pode custar a subida inteira.',
	'Excesso de Agressão':
		'Protocolo Sniper: agressão acima do que a estrutura sustenta. Reserve pressão para stacks que o Bubble Factor realmente limita, e não contra quem pode pagar sem arriscar o torneio.',
	'Passivo Estrutural (RIO)':
		'Protocolo Sniper: o passivo multiway está sendo subestimado. Cada oponente a mais no pote cresce o custo estrutural — aperte a faixa de continuação quando a ação vier de vários lados.',
	'Desvio de Nash':
		'Protocolo Sniper: as decisões se afastam do equilíbrio sem justificativa explorativa registrada. Volte ao baseline de equilíbrio e só desvie com leitura concreta do adversário.',
};

interface SniperAdvisorProps {
	topVazamento: string | null;
}

export function SniperAdvisor({ topVazamento }: Readonly<SniperAdvisorProps>) {
	if (!topVazamento) return null;
	const recomendacao = RECOMENDACOES_POR_VETOR[topVazamento];
	if (!recomendacao) return null;

	return (
		<GlassPanel className="p-8 border-accent-indigo/30 bg-linear-to-r from-accent-indigo/10 to-transparent mb-8">
			<div className="flex items-start gap-6">
				<div className="p-4 bg-accent-indigo/20 rounded-2xl">
					<i className="fa-solid fa-crosshairs text-3xl text-accent-indigo-light" />
				</div>
				<div>
					<h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
						Conselheiro Smart Sniper
					</h3>
					<p className="text-text-muted leading-relaxed max-w-2xl font-medium">{recomendacao}</p>
				</div>
			</div>
		</GlassPanel>
	);
}
