/**
 * IDENTITY: O Paradigma do Downward Drift
 * PATH: src/app/biblioteca/downward-drift-sota/page.tsx
 * ROLE: Artigo teórico sobre a contração de ranges e bet sizing sob pressão de ICM.
 */

import { GtoCfrContent } from '@/app/laboratorio-v2/gto-cfr/GtoCfrContent';
import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Suspense } from 'react';

export const metadata = {
    title: 'Downward Drift SOTA | Raphael Vitoi',
    description: 'Como a pressão do ICM força a redução geométrica dos tamanhos de aposta e a condensação dos ranges pós-flop.',
};

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Downward Drift SOTA: A Gravidade do ICM no Pós-Flop',
    description: 'A mecânica sistêmica onde grandes apostas se tornam pequenas, e calls se tornam folds sob a lente do Risk Premium.',
    author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function DownwardDriftPage ()
{
    const pageTitle = "Downward Drift SOTA | Raphael Vitoi";
    const pageUrl = "https://www.pokerracional.com/biblioteca/downward-drift-sota";

    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
            <JsonLd data={ articleSchema } />

            <ContentPageHeader
                title="Downward Drift SOTA"
                subtitle="A Gravidade do ICM no Pós-Flop: Como a Assimetria de Risco Esmaga o Sizing e Condensa o Range."
                category="Teoria de Sistemas"
                icon="fa-arrow-trend-down"
            />

            <SectionHeader
                step="01"
                label="O Conceito"
                title="A Erosão da Agressividade"
                description="Big bets viram small bets, small bets viram checks."
            />

            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>No vácuo do ChipEV, o poker é um jogo de alavancagem máxima. As apostas crescem geometricamente para maximizar o valor de mãos fortes. No entanto, quando introduzimos a pressão do <strong className="text-accent-indigo">ICM (Independent Chip Model)</strong> e a sombra do <strong className="text-accent-rose">Risk Premium</strong>, o tecido da estratégia se deforma.</p>

                        <p>O <strong>Downward Drift</strong> (ou Deriva Descendente) é o fenômeno sistêmico onde a pressão de sobrevivência força uma contração agressiva nas ramificações da árvore de decisão. Em termos práticos: <em>grandes apostas se tornam pequenas, apostas pequenas viram checks, e checks viram folds.</em></p>

                        <div className="bg-bg-elevated/50 border border-white/5 p-8 my-10 rounded-2xl">
                            <h4 className="mt-0 text-text-bright font-bold text-lg mb-4 font-heading">O Custo do Isolamento (Low-Variance Lines)</h4>
                            <p className="text-text-main leading-relaxed m-0 text-sm">
                                Solvers operando sob ICM priorizam a construção de potes através de <strong>sizings menores e de baixa variância</strong>. Reduzir o sizing não é uma fraqueza; é uma defesa matemática contra o isolamento em uma sub-árvore onde um erro custaria a vida no torneio.
                            </p>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="02"
                label="Ecossistema"
                title="Covering Advantage e Efeito Compounding"
                description="O poder gravitacional de quem cobre a mesa."
            />

            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>O jogador que possui a <strong>Covering Advantage</strong> (quem cobre o oponente) exerce uma gravidade que distorce o Downward Drift a seu favor. Como seu risco de eliminação é zero, o solver lhe concede permissão matemática para quebrar a regra de contenção.</p>

                        <p>O efeito é silencioso, porém pervasivo. Ele começa no pré-flop com diferenças de décimos de blind e escala exponencialmente até o river. O jogador coberto dobra sua taxa de check e abandona linhas de check-raise polarizadas, forçado a aceitar um EV menor para blindar sua equidade no torneio (CSTE).</p>

                        <div className="bg-accent-emerald/5 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
                            <h4 className="mt-0 text-accent-emerald-light font-bold text-lg mb-2 font-heading">A Assimetria do Confronto</h4>
                            <p className="text-text-main m-0 leading-relaxed text-sm">
                                Se o BTN tem 40BB e o BB tem 70BB, um C-Bet do BTN que em ChipEV seria 100% de sizings mistos torna-se 100% de small sizing sob ICM. Em contrapartida, o BB capitaliza aumentando sua taxa de defesa e adotando posturas que seriam fatais em ChipEV.
                            </p>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="03"
                label="Laboratório Integrado"
                title="Simulador de Regret Matching e Sizing"
                description="Interaja com a malha matemática para visualizar a contração geométrica e o equilíbrio de Nash."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <Suspense fallback={ <div className="p-12 text-center text-text-muted">Carregando Malha Geométrica...</div> }>
                    <GtoCfrContent />
                </Suspense>
            </div>

            <div className="max-w-300 mx-auto px-6 pb-24">
                <ContentFooter
                    shareTitle={ pageTitle }
                    shareUrl={ pageUrl }
                    backLinkHref="/biblioteca"
                    backLinkText="Voltar para Biblioteca"
                />
            </div>
        </div>
    );
}
