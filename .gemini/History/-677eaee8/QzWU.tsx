/**
 * IDENTITY: A Amortização da Edge (A Falácia da Superioridade)
 * PATH: src/app/biblioteca/voce-aprende-poker-errado/page.tsx
 * ROLE: Artigo aprofundado sobre a compressão da vantagem técnica em stacks curtas.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel, ResurrectionRiskSimulator]
 */

import ContentFooter from '@/components/content/ContentFooter';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';
import ResurrectionRiskSimulator from './ResurrectionRiskSimulator';

export const metadata = {
    title: 'A Amortização da Edge | Raphael Vitoi',
    description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente quando a árvore de decisões é podada. O paradoxo da stack curta.',
};

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'A Amortização da Edge: O Paradoxo da Stack Curta',
    description: 'Uma investigação sobre como a profundidade da stack condiciona a vantagem técnica e como o ICM neutraliza a superioridade estratégica.',
    author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function AmortizacaoEdgePage () {
    const articleUrl = "https://www.pokerracional.com/biblioteca/voce-aprende-poker-errado";
    const articleTitle = "A Amortização da Edge | Raphael Vitoi";

    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
            <JsonLd data={ articleSchema } />

            {/* Header Central de Página */ }
            <div className="max-w-300 mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
                            Amortização da Edge
                        </h1>
                        <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
                            Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                Teoria da Resiliência
                                { ' ' }Teoria da Resiliência
                            </span>
                            <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                                Paradoxo da Competência
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Link href="/biblioteca" className="px-4 py-2 rounded-xl bg-bg-elevated/40 border border-white/5 text-text-muted text-[0.75rem] font-bold flex items-center gap-2 transition-all hover:text-text-bright hover:bg-bg-elevated">
                            <i className="fa-solid fa-arrow-left text-[0.7rem]" /> BIBLIOTECA
                        </Link>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="01"
                label="Fenomenologia"
                title="O Colapso da Árvore Fractal"
                description="A complexidade é a arma do forte. A simplicidade forçada é o escudo do fraco."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>Com 100 big blinds, o poker é uma árvore fractal. Cada street é um universo de possibilidades onde o jogador de elite prospera pela <strong className="text-text-bright text-shadow-glow">Superioridade Processual</strong>. Ele navega o labirinto; o amador se perde nele.</p>
                        <p>Com 10 big blinds, essa árvore é podada com um machado. O jogo regride para decisões binárias pré-flop. O amador é <strong className="text-text-bright">protegido de sua própria inabilidade</strong> pela pobreza de suas opções. Ele não pode errar no river se nunca chega lá.</p>

                        <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
                            <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">O Paradoxo da Vulnerabilidade</h4>
                            <p className="text-text-main m-0 leading-relaxed text-sm">
                                O short stack não tem &quot;fichas para pensar&quot;. Sua vulnerabilidade força uma simplicidade que amortiza a edge do oponente. Tentar esmagar um short stack com manobras complexas é como tentar usar um supercomputador para jogar jogo da velha: o poder extra é inútil.
                            </p>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="02"
                label="Simulação"
                title="O Risco da Ressurreição"
                description="O ganho marginal em ChipEV não precifica a ressurreição de um oponente taticamente neutralizado."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>Imagine o Chip Leader (100bb) pagando um all-in de 10bb do Short Stack. O ChipEV diz que é lucrativo. A <strong className="text-text-bright">Perspectiva Matemática</strong> discorda: ao pagar e perder, você devolve a complexidade (stack) ao oponente que estava neutralizado.</p>
                    </div>
                </GlassPanel>
                <div className="mt-12">
                    <ResurrectionRiskSimulator />
                </div>
            </div>

            <SectionHeader
                step="03"
                label="Veredito"
                title="Responsabilidade Sistêmica"
                description="A maestria não está em ter uma edge, mas em entender a topografia onde ela pode ser aplicada."
            />
            <div className="max-w-300 mx-auto px-6 pb-24">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body text-center">
                        <p className="text-2xl font-light leading-relaxed max-w-3xl mx-auto italic text-text-bright">
                            &quot;Sua tarefa não é provar superioridade; é evitar as colisões de variância pura onde sua habilidade é amortizada e o resultado se aproxima de um cara ou coroa.&quot;
                        </p>
                    </div>
                </GlassPanel>
            </div>

            <div className="max-w-300 mx-auto px-6 pb-12">
                <ContentFooter
                    shareTitle={ articleTitle }
                    shareUrl={ articleUrl }
                    backLinkHref="/biblioteca"
                    backLinkText="Voltar para Biblioteca"
                />
            </div>
        </div>
    );
}
