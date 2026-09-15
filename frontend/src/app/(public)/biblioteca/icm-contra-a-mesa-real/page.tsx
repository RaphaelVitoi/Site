/**
 * IDENTITY: O ICM contra a mesa real
 * PATH: src/app/(public)/biblioteca/icm-contra-a-mesa-real/page.tsx
 * ROLE: Primeiro recorte empírico da PMev publicado: ICM x ChipEV medido em hand histories
 *       reais, com o desfecho observado. Molde do caminho dado -> contrato -> página.
 * DADOS: data/pmev_benchmark_icm_chipev.v1.json, validado por src/lib/pmevBenchmark.ts.
 */

import type { Metadata } from 'next';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import RealTableLab from '@/components/pmev/benchmark/RealTableLab';
import { BinnedCurveChart } from '@/components/pmev/benchmark/BinnedCurveChart';
import { ForestPlot, type ForestRow } from '@/components/pmev/benchmark/ForestPlot';
import styles from '@/components/pmev/benchmark/benchmark.module.css';
import { PMEV_BENCHMARK, type BenchmarkMetricId, type BenchmarkStructure } from '@/lib/pmevBenchmark';

const DESCRICAO =
	'Quinze mil estados de torneios reais de poker, o lugar em que cada um terminou e a pergunta: o ICM prevê melhor do que as fichas?';

export const metadata: Metadata = {
	// O layout raiz acrescenta " | Raphael Vitoi" pelo template.
	title: 'O ICM contra a mesa real',
	description: DESCRICAO,
};

const ORDEM = ['ps-stt-9p-9.20-0.80', 'ps-mtt-45p-0.91-0.09', 'ps-spin-3p-0.46-0.04', 'ps-spin-3p-3.68-0.32'];
const posicao = (id: string) => (ORDEM.includes(id) ? ORDEM.indexOf(id) : ORDEM.length);
const estruturas: BenchmarkStructure[] = [...PMEV_BENCHMARK.estruturas].sort((a, b) => posicao(a.id) - posicao(b.id));
const stt = estruturas.find((e) => !e.vencedor_leva_tudo && e.field <= e.max_mesa);
const sng = estruturas.find((e) => !e.vencedor_leva_tudo && e.field > e.max_mesa);
const spins = estruturas.filter((e) => e.vencedor_leva_tudo);

const int = (n: number) => n.toLocaleString('pt-BR');
const pp = (n: number) => `${(Math.abs(n) * 100).toFixed(1).replace('.', ',')}%`;

const linhas = (metric: BenchmarkMetricId): ForestRow[] =>
	estruturas.map((e) => ({
		// Rótulo curto: o gráfico cabe no celular, e o rótulo completo segue na tabela acessível.
		label: `${(e.rotulo.split(',')[0] ?? e.rotulo).replace(/ \d+-max de /, ' ')} (${int(e.estados)})`,
		metric: e.metricas[metric],
		states: e.estados,
	}));

const funil = PMEV_BENCHMARK.funil;
const completos = funil ? Object.values(funil.por_estrutura).reduce((s, f) => s + f.estados_field_completo, 0) : null;
const canonicos = estruturas.reduce((s, e) => s + e.canonicos, 0);

const reducaoErroPremio = (e: BenchmarkStructure | undefined) =>
	e ? pp(-e.metricas.erro2_premio.diferenca / e.metricas.erro2_premio.referencia) : '';

const articleSchema = {
	'@context': 'https://schema.org',
	'@type': 'TechArticle',
	headline: 'O ICM contra a mesa real',
	description: DESCRICAO,
	author: { '@type': 'Person', name: 'Raphael Vitoi' },
	dateModified: PMEV_BENCHMARK.gerado_em,
};

export default function IcmContraMesaRealPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright">
			<JsonLd data={articleSchema} />
			<ContentPageHeader
				title="O ICM contra a mesa real"
				subtitle="Quinze mil estados de torneios reais, o lugar em que cada um terminou e uma pergunta simples: o ICM acerta mais do que as fichas?"
				category="Mecânica & ICM"
				icon="fa-flask-vial"
			/>

			<article className={`sota-container ${styles['page']}`}>
				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						Todo estudo de ICM parte de uma promessa: numa mesa com prêmio escalonado, uma ficha não vale o mesmo que
						outra. O <strong className={styles['icm']}>ICM</strong> transforma fichas em dinheiro esperado considerando a
						estrutura de prêmios; o <strong className={styles['chip']}>ChipEV</strong> apenas divide o prêmio pela proporção
						de fichas. A teoria diz qual dos dois está certo. Aqui a pergunta vai para quem decide de verdade: a mesa.
					</p>
					<p>
						Abaixo está um estado real, tirado de uma hand history, no instante em que a mão começou. Leia a previsão antes
						de revelar o final.
					</p>
				</div>

				<div className={styles['wide']}>
					<RealTableLab structures={estruturas} />
				</div>

				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						Uma mesa sozinha não prova nada. Um jogador com 60% de chance de entrar no dinheiro sai sem nada quatro vezes
						em cada dez, e isso não é erro do modelo. Para julgar uma previsão de probabilidade é preciso muitas previsões
						e os desfechos de todas elas.
					</p>
				</div>

				<h2 className={`${styles['sectionTitle']} ${styles['column']}`}>De onde vêm estes estados</h2>
				<ol className={`${styles['pipeline']} ${styles['wide']}`}>
					{funil ? (
						<li className={styles['step']}>
							<span className={styles['stepValue']}>{int(funil.maos_ps_lidas)}</span>
							<span className={styles['stepLabel']}>mãos de torneio da PokerStars lidas</span>
						</li>
					) : null}
					<li className={styles['step']}>
						<span className={styles['stepValue']}>{estruturas.length}</span>
						<span className={styles['stepLabel']}>
							estruturas de prêmio conhecidas por inteiro, confirmadas em {canonicos} torneios com resultado completo
						</span>
					</li>
					{completos !== null ? (
						<li className={styles['step']}>
							<span className={styles['stepValue']}>{int(completos)}</span>
							<span className={styles['stepLabel']}>estados em que todas as fichas do torneio estão na mesa</span>
						</li>
					) : null}
					<li className={`${styles['step']} ${styles['stepLast']}`}>
						<span className={styles['stepValue']}>{int(PMEV_BENCHMARK.estados_total)}</span>
						<span className={styles['stepLabel']}>estados com o lugar final do dono das mãos registrado na própria mão</span>
					</li>
				</ol>
				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						Dois cuidados sustentam o resto. Primeiro, <strong>só conta como estado ICM a mesa que contém todas as fichas
						do torneio</strong>: a soma dos stacks precisa bater com o número de inscritos vezes o stack inicial. Num
						torneio de 45 jogadores, isso só acontece na mesa final. Antes dela, a mesa observada é um pedaço do torneio
						e não serve. Segundo, <strong>o desfecho não foi estimado</strong>: a PokerStars escreve na própria mão em que
						lugar cada jogador terminou.
					</p>
				</div>

				<h2 className={`${styles['sectionTitle']} ${styles['column']}`}>O que a mesa respondeu</h2>
				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						Cada gráfico mede o erro do ICM menos o erro de uma referência. Nas previsões de lugar, a referência é o
						palpite sem informação, que dá a mesma chance a todos os vivos. No prêmio, a referência é o ChipEV. O ponto é
						a diferença média; a barra é o intervalo de 95%, reamostrando torneios inteiros. À esquerda do zero, o ICM
						erra menos.
					</p>
				</div>
				<div className={`${styles['charts']} ${styles['wide']}`}>
					<ForestPlot
						title="Previsão do lugar final"
						explanation="Erro de Brier sobre a distribuição de lugares: quanto menor, mais perto do que aconteceu."
						reference="palpite uniforme"
						rows={linhas('brier_lugar')}
					/>
					<ForestPlot
						title="Surpresa com o lugar final"
						explanation="Log-loss: pune com força a previsão confiante que não se confirma."
						reference="palpite uniforme"
						rows={linhas('logloss_lugar')}
					/>
					<ForestPlot
						title="Entrar no dinheiro"
						explanation="Erro de Brier da chance de terminar num lugar pago."
						reference="palpite uniforme"
						rows={linhas('brier_itm')}
					/>
					<ForestPlot
						title="Prêmio recebido"
						explanation="Erro quadrático entre o dinheiro esperado e o prêmio que o jogador levou, em US$²."
						reference="ChipEV"
						rows={linhas('erro2_premio')}
						digits={2}
					/>
				</div>
				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						Nos dois formatos com prêmio escalonado, o ICM erra menos em tudo, e nenhum intervalo cruza o zero. No
						prêmio, o ChipEV erra {reducaoErroPremio(stt)} a mais no STT de 9 jogadores e {reducaoErroPremio(sng)} a mais
						na mesa final do torneio de 45.
					</p>
				</div>

				<h2 className={`${styles['sectionTitle']} ${styles['column']}`}>Quando o ICM diz 70%, acontece 70%?</h2>
				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						Acertar na média não basta: a previsão precisa ser calibrada. Os estados foram agrupados pela chance de
						entrar no dinheiro que o ICM atribuía ao dono das mãos, e cada ponto mostra com que frequência isso de fato
						aconteceu. Uma previsão perfeita cai sobre a diagonal.
					</p>
				</div>
				<div className={`${styles['charts']} ${styles['wide']}`}>
					{stt ? (
						<BinnedCurveChart
							bins={stt.calibracao_itm}
							title={`Calibração no ${stt.rotulo}`}
							description="Cada ponto compara a chance prevista pelo ICM de entrar no dinheiro com a frequência observada."
							xLabel="previsto pelo ICM"
							yLabel="observado na mesa"
							tone="reality"
						/>
					) : null}
					{sng ? (
						<BinnedCurveChart
							bins={sng.calibracao_itm}
							title={`Calibração no ${sng.rotulo}`}
							description="O mesmo teste só com a mesa final, a única fase em que o estado do torneio inteiro está visível."
							xLabel="previsto pelo ICM"
							yLabel="observado na mesa"
							tone="reality"
						/>
					) : null}
				</div>
				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						No STT, os pontos acompanham a diagonal e, onde se afastam, ficam levemente acima: o dono das mãos entrou no
						dinheiro um pouco mais do que o ICM previa. Na mesa final do SNG, com 7 pagos entre 9, quase todos os estados já
						estão perto do dinheiro; as faixas do meio têm poucos estados e oscilam mais, e é por isso que a métrica agregada
						vem com intervalo. O ICM assume jogadores iguais; se quem exportou as mãos joga melhor que a
						média, esse é exatamente o desvio esperado, e é o espaço que um modelo com habilidade teria de explicar.
					</p>
				</div>

				<h2 className={`${styles['sectionTitle']} ${styles['column']}`}>A forma do valor de uma ficha</h2>
				<div className={`${styles['charts']} ${styles['wide']}`}>
					{stt ? (
						<BinnedCurveChart
							bins={stt.concavidade}
							title="Fichas não se convertem em prêmio em linha reta"
							description="Nos estados reais do STT de 9, a fração do prêmio que o ICM atribui ao dono das mãos, contra a fração das fichas que ele tinha. A diagonal é o ChipEV."
							xLabel="fração das fichas"
							yLabel="fração do prêmio pelo ICM"
							tone="icm"
						/>
					) : null}
					<div className={styles['prose']}>
						<p>
							Stacks curtos valem mais do que suas fichas, e stacks grandes, menos. A curva fica acima da diagonal à
							esquerda e abaixo à direita. É a razão de o jogador grande pressionar e o médio se proteger, e agora ela
							aparece desenhada por estados que existiram.
						</p>
						{spins.length ? (
							<p>
								<strong>O controle.</strong> No Spin, o vencedor leva tudo, e ICM e ChipEV viram a mesma conta. O
								benchmark confirma: nos {int(spins.reduce((s, e) => s + e.estados, 0))} estados de Spin, o erro de prêmio
								dos dois é idêntico. É a prova de que a medição não inventa diferença onde ela não pode existir.
							</p>
						) : null}
					</div>
				</div>

				<h2 className={`${styles['sectionTitle']} ${styles['column']}`}>O que isto não prova</h2>
				<ul className={`${styles['limits']} ${styles['column']} ${styles['prose']}`}>
					<li>
						Os estados são sempre os da mesa de quem exportou as mãos. Esse jogador não é sorteado do field, e a amostra
						herda o perfil dele.
					</li>
					<li>
						Mãos seguidas do mesmo torneio são parecidas. O intervalo reamostra torneios inteiros para não fingir mais
						informação do que existe, mas não modela a dependência dentro de cada torneio.
					</li>
					<li>
						São três formatos de torneio, todos da PokerStars. Nada aqui se estende sozinho a MTTs grandes ou a outras
						estruturas de prêmio.
					</li>
					<li>
						Nenhum operador da PMev foi testado. Esta página mede a linha de base: o que qualquer modelo novo precisa
						superar, nesta mesma amostra e com estas mesmas métricas.
					</li>
				</ul>

				<h2 className={`${styles['sectionTitle']} ${styles['column']}`}>Como este recorte chega à página</h2>
				<div className={`${styles['column']} ${styles['prose']}`}>
					<p>
						O caminho é o molde para os próximos recortes: cada passo tem um contrato, e nenhum número desta página foi
						digitado à mão.
					</p>
				</div>
				<ol className={`${styles['mold']} ${styles['column']}`}>
					<li className={styles['moldStep']}>
						<span className={styles['moldTitle']}>Estado coerente</span>
						<span className={styles['moldText']}>
							<code>engine/pmev_hh_canon.py</code> lê as mãos, reconhece a estrutura de prêmio e só aceita mesas com todas
							as fichas.
						</span>
					</li>
					<li className={styles['moldStep']}>
						<span className={styles['moldTitle']}>Desfecho e métrica</span>
						<span className={styles['moldText']}>
							<code>engine/pmev_hh_benchmark.py</code> lê o lugar final e mede Brier, log-loss e erro de prêmio com
							bootstrap por torneio.
						</span>
					</li>
					<li className={styles['moldStep']}>
						<span className={styles['moldTitle']}>Recorte público</span>
						<span className={styles['moldText']}>
							<code>engine/pmev_benchmark_publico.py</code> agrega, retira qualquer identificador e gera um JSON
							determinístico.
						</span>
					</li>
					<li className={styles['moldStep']}>
						<span className={styles['moldTitle']}>Contrato no site</span>
						<span className={styles['moldText']}>
							<code>src/lib/pmevBenchmark.ts</code> recusa artefato adulterado, e um teste confere o ICM publicado contra o
							kernel TypeScript.
						</span>
					</li>
				</ol>
				<p className={`${styles['provenance']} ${styles['column']}`}>
					Gerado em {PMEV_BENCHMARK.gerado_em}. {PMEV_BENCHMARK.metodo['intervalo']}. Digest da amostra{' '}
					{PMEV_BENCHMARK.digest_amostra}. {PMEV_BENCHMARK.privacidade}.
				</p>
			</article>
		</div>
	);
}
