/**
 * IDENTITY: Root Layout (A Espinha Dorsal)
 * PATH: src/app/layout.tsx
 * ROLE: Prover a estrutura HTML unificada, injetar o globals.css, fontes (JetBrains Mono/Heading) e prover o contexto escuro (Dark/Cyber) da aplicação.
 * BINDING: [src/app/page.tsx, src/app/aulas/icm-masterclass/page.tsx, globals.css]
 * TELEOLOGY: Manter-se leve e estático. No futuro, deverá suportar Providers globais de estado (Context API/Zustand) para sincronização de configurações de usuário (ex: preferências do Simulador ICM) sem causar re-renders pesados.
 */
import ScrollToTop from '@/components/content/ScrollToTop';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import './globals.css';

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
    // opengraph-image.tsx gera automaticamente a imagem OG
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
    <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        {/* SOTA: Prevencao de Render-Blocking. Carregamento assincrono do CSS externo. */ }
        <link rel="preload" as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onLoad={ ( e ) => { e.currentTarget.media = 'all'; } } />
      </head>
      <body className="font-sans antialiased bg-slate-950 text-slate-300 flex flex-col min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200 before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] before:from-indigo-900/10 before:via-slate-950/0 before:to-slate-950/0">
        <Header />
        <div className="grow">{ children }</div>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
