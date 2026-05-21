import './globals.css';
import { Header, Footer } from '@/components';

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
    <html lang="pt-BR">
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
