/**
 * IDENTITY: Root Layout (A Espinha Dorsal)
 * PATH: src/app/layout.tsx
 * ROLE: Prover a estrutura HTML unificada, injetar o globals.css, fontes (JetBrains Mono/Heading) e prover o contexto escuro (Dark/Cyber) da aplicação.
 * BINDING: [src/app/page.tsx, src/app/tools/icm/page.tsx, globals.css]
 * TELEOLOGY: Manter-se leve e estático. No futuro, deverá suportar Providers globais de estado (Context API/Zustand) para sincronização de configurações de usuário (ex: preferências do Simulador ICM) sem causar re-renders pesados.
 */
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Raphael Vitoi | Masterclass de ICM e Teoria dos Jogos',
  description: 'A Geometria do Risco: ICM Pós-Flop, Risk Premium e a Nova Fronteira do Edge no Poker.',
  metadataBase: new URL('https://pokerracional.com'),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" as="style" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="font-sans antialiased bg-slate-950 text-slate-300 flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
