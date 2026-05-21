/**
 * IDENTITY: Root Layout (A Espinha Dorsal)
 * PATH: src/app/layout.tsx
 * ROLE: Prover a estrutura HTML unificada, injetar o globals.css, fontes (JetBrains Mono/Heading) e prover o contexto escuro (Dark/Cyber) da aplicação.
 * BINDING: [src/app/page.tsx, src/app/tools/icm/page.tsx, globals.css]
 * TELEOLOGY: Manter-se leve e estático. No futuro, deverá suportar Providers globais de estado (Context API/Zustand) para sincronização de configurações de usuário (ex: preferências do Simulador ICM) sem causar re-renders pesados.
 */
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Raphael Vitoi | Masterclass Elite',
  description: 'A Geometria do Risco - ICM e Teoria dos Jogos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
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
