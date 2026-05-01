/**
 * IDENTITY: A Amortização da Edge (A Falácia da Superioridade)
 * PATH: src/app/biblioteca/voce-aprende-poker-errado/page.tsx
 * ROLE: Artigo aprofundado sobre a compressão da vantagem técnica em stacks curtas.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel, ResurrectionRiskSimulator]
 */

import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import ResurrectionRiskSimulator from '@/components/simulator/ResurrectionRiskSimulator';

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

export default function AmortizacaoEdgePage() {
    const articleUrl = "https://www.raphaelvitoi.com/biblioteca/voce-aprende-poker-errado";
    const articleTitle = "A Amortização da Edge | Raphael Vitoi";

    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
            <JsonLd data={articleSchema} />

            <ContentPageHeader 
                title="Amortização da Edge"
                subtitle="Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds."
                category="Filosofia"
                icon="fa-infinity"
            />

            <SectionHeader
                step="01"
                label="Fenomenologia"
                title="O Colapso da Árvore Fractal"
                description="A complexidade é a arma do forte. A simplicidade forçada é o escudo do fraco."
            />
            <div className="sota-container pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>Com 100 big blinds, o poker é uma árvore fractal. Cada street é um universo de possibilidades onde o jogador de elite prospera pela <strong className="text-text-bright text-shadow-glow">Superioridade Processual</strong>. Ele navega o labirinto; o amador se perde nele.</p>
                        <p>Com 10 big blinds, essa árvore é podada com um machado. O jogo regride para decisões binárias pré-flop. O amador é <strong className="text-text-bright">protegido de sua própria inabilidade</strong> pela pobreza de suas opções. Ele não pode errar no river se nunca chega lá.</p>
                        
                        <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
                            <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading italic">O Paradoxo da Vulnerabilidade</h4>
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
            <div className="sota-container pb-12">
                <div className="mb-12">
                    <ResurrectionRiskSimulator />
                </div>
                
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>Imagine o Chip Leader (100bb) pagando um all-in de 10bb do Short Stack. O ChipEV diz que é lucrativo. A <strong className="text-text-bright">Perspectiva Matemática</strong> discorda: ao pagar e perder, você devolve a complexidade (stack) ao oponente que estava neutralizado.</p>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="03"
                label="Veredito"
                title="Responsabilidade Sistêmica"
                description="A maestria não está em ter uma edge, mas em entender a topografia onde ela pode ser aplicada."
            />
            <div className="sota-container pb-24">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body text-center">
                        <p className="text-2xl font-light leading-relaxed max-w-3xl mx-auto italic text-text-bright">
                            &quot;Sua tarefa não é provar superioridade; é evitar as colisões de variância pura onde sua habilidade é amortizada e o resultado se aproxima de um cara ou coroa.&quot;
                        </p>
                    </div>
                </GlassPanel>
            </div>

            <div className="sota-container pb-12">
                <ContentFooter
                    shareTitle={articleTitle}
                    shareUrl={articleUrl}
                    backLinkHref="/biblioteca"
                    backLinkText="Voltar para Biblioteca"
                />
            </div>
        </div>
    );
}
