/**
 * IDENTITY: Root Layout (A Espinha Dorsal)
 * PATH: src/app/layout.tsx
 * ROLE: Prover a estrutura HTML unificada, injetar o globals.css, fontes e prover o contexto Dark/Cyber.
 * BINDING: [src/app/page.tsx, globals.css]
 */
import ScrollToTop from '@/components/content/ScrollToTop';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import JsonLd from '@/components/seo/JsonLd';
import { SotaGlobalSyncProvider } from '@/components/simulator/hooks/useSotaSync';
import '@fortawesome/fontawesome-free/css/all.min.css';
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
      "jobTitle": "Estrategista de Poker e Especialista em Sistemas Complexos",
      "description": "Educador e Profissional de Poker, focado em ICM Pós-Flop e Teoria dos Jogos.",
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
      "name": "Poker Racional",
      "description": "A Nova Fronteira do Edge: ICM Pós-Flop e Risk Premium.",
      "publisher": { "@id": "https://www.pokerracional.com/#person" }
    }
  ]
};

export const metadata = {
  title: 'Raphael Vitoi | Masterclass de ICM e Teoria dos Jogos',
  description: 'A Geometria do Risco: ICM Pós-Flop, Risk Premium e a Nova Fronteira do Edge no Poker.',
  metadataBase: new URL( 'https://pokerracional.com' ),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://pokerracional.com',
    siteName: 'PokerRacional',
    title: 'Raphael Vitoi | Masterclass de ICM e Teoria dos Jogos',
    description: 'A Geometria do Risco: ICM Pós-Flop, Risk Premium e a Nova Fronteira do Edge no Poker.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raphael Vitoi | Masterclass de ICM e Teoria dos Jogos',
    description: 'A Geometria do Risco: ICM Pós-Flop, Risk Premium e a Nova Fronteira do Edge no Poker.',
    creator: '@raphaelvitoi',
  },
};

export default function RootLayout ( {
  children,
}: Readonly<{
  children: React.ReactNode;
}> ) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={ `${inter.variable} ${jetbrainsMono.variable} ${montserrat.variable} font-body antialiased bg-bg-base text-text-main flex flex-col min-h-screen selection:bg-accent-indigo/30 selection:text-text-bright` }>
        <SotaGlobalSyncProvider>
          <JsonLd data={ rootSchema } />
          <Header />
          <main className="grow">{ children }</main>
          <Footer />
          <ScrollToTop />
        </SotaGlobalSyncProvider>
      </body>
    </html>
  );
}
