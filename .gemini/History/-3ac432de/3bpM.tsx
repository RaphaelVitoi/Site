import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Minha Aplicação Next.js',
  description: 'Infraestrutura base de front-end',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex flex-col min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <Header />
        <main className="flex-grow pt-8 pb-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
