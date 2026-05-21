import './globals.css';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-editorial' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-slate-950 text-slate-300 flex flex-col min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        <Header />
        <main className="flex-grow pt-8 pb-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
