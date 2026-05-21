/**
 * IDENTITY: Root Layout (A Espinha Dorsal)
 * PATH: src/app/layout.tsx
 * ROLE: Prover a estrutura HTML unificada, injetar o globals.css, fontes e prover o contexto Dark/Cyber.
 * BINDING: [src/app/page.tsx, globals.css]
 */
import ScrollToTop from '@/components/content/ScrollToTop';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { SotaGlobalSyncProvider } from '@/components/simulator/hooks/useSotaSync';
import SotaBackground from '@/components/ui/SotaBackground';
import '@fortawesome/fontawesome-free/css/all.min.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import './globals.css';

const inter = Inter( {
    subsets: [ "latin" ],
    variable: "--font-inter",
    display: 'swap',
} );

const jetbrainsMono = JetBrains_Mono( {
    subsets: [ "latin" ],
    variable: "--font-mono",
    display: 'swap',
} );

const montserrat = Montserrat( {
    subsets: [ "latin" ],
    variable: "--font-heading",
    display: 'swap',
} );

const rootSchema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            "@id": "https://www.pokerracional.com/#person",
            "name": "Raphael Vitoi",
            "jobTitle": "Estrategista de Poker e Arquiteto de Sistemas Complexos",
            "description": "Especialista em ICM Pós-Flop e Teoria dos Jogos. Criador do framework de Perspectiva Matemática.",
            "url": "https://www.pokerracional.com",
            "sameAs": [
                "https://www.instagram.com/raphaelvitoi/",
                "https://www.twitch.tv/RaphaelVitoiPoker",
                "https://www.youtube.com/@RaphaelVitoiPoker"
            ]
        },
        {
            "@type": "WebSite",
            "@id": "https://www.pokerracional.com/#website",
            "url": "https://www.pokerracional.com",
            "name": "Raphael Vitoi | Nexus",
            "description": "A Nova Fronteira do Edge: Inteligência SOTA, ICM Pós-Flop e Risk Premium.",
            "publisher": { "@id": "https://www.pokerracional.com/#person" }
        }
    ]
};

export const metadata: Metadata = {
    title: {
        default: 'Raphael Vitoi | Nexus - Inteligência em Poker',
        template: '%s | Raphael Vitoi'
    },
    description: 'A Geometria do Risco: ICM Pós-Flop, Risk Premium e a Fronteira SOTA do Edge no Poker.',
    metadataBase: new URL( 'https://www.pokerracional.com' ),
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: 'https://www.pokerracional.com',
        siteName: 'PokerRacional.com',
        title: 'Raphael Vitoi | Nexus - Inteligência SOTA em Poker',
        description: 'A Geometria do Risco: ICM Pós-Flop e o Paradigma da Perspectiva Matemática.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Raphael Vitoi | Nexus',
        description: 'A Nova Fronteira do Edge no Poker: ICM Pós-Flop e Inteligência Quantum.',
        creator: '@raphaelvitoi',
    },
};

export default function RootLayout ( {
    children,
}: Readonly<{
    children: React.ReactNode;
}> )
{
    return (
        <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className={ `${ inter.variable } ${ jetbrainsMono.variable } ${ montserrat.variable } font-body antialiased bg-bg-base text-text-main flex flex-col min-h-screen selection:bg-accent-indigo/30 selection:text-text-bright` } suppressHydrationWarning>
                <SotaBackground />
                <SotaGlobalSyncProvider>
                    <script type="application/ld+json" dangerouslySetInnerHTML={ { __html: JSON.stringify( rootSchema ) } } />
                    <Header />
                    <main className="grow pt-20 flex flex-col relative">{ children }</main>
                    <Footer />
                    <ScrollToTop />
                </SotaGlobalSyncProvider>
            </body>
        </html>
    );
}
