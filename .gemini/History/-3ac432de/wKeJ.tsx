import './globals.css';
import Link from 'next/link';

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
      <body className="font-sans antialiased flex flex-col min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        <header className="fixed top-0 w-full z-50 glass-panel border-b-0 shadow-lg !rounded-none">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <h1 className="text-white font-bold tracking-tight text-lg">
                    <Link href="/" className="hover:text-indigo-400 transition-colors">Raphael Vitoi</Link> 
                    <span className="text-slate-500 font-normal ml-1">/ ICM Masterclass</span>
                </h1>
                <nav>
                    <ul className="flex gap-6 text-sm font-medium text-slate-400">
                        <li><Link href="/" className="hover:text-white transition-colors"><i className="fa-solid fa-arrow-left mr-1"></i> Hub</Link></li>
                        <li><Link href="#conteudo" className="hover:text-white transition-colors">Conteúdo</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
        <main className="flex-grow pt-24 pb-20">
          {children}
        </main>
        <footer className="max-w-4xl mx-auto px-6 border-t border-slate-800 pt-10 pb-12 text-center w-full mt-auto">
            <div className="flex justify-center gap-6 mb-6">
                <Link href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#9146FF] hover:border-[#9146FF] transition-all"><i className="fa-brands fa-twitch"></i></Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#FF0000] hover:border-[#FF0000] transition-all"><i className="fa-brands fa-youtube"></i></Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#E1306C] hover:border-[#E1306C] transition-all"><i className="fa-brands fa-instagram"></i></Link>
            </div>
            <p className="text-xs text-slate-600">© 2026 Raphael Vitoi Poker. Todos os direitos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
