import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950 text-slate-400 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="font-medium text-slate-300">
            <span className="font-bold text-white tracking-wide">R.VITOI</span>
            <span className="text-indigo-500 font-black">.</span> Masterclass
          </p>
          <p className="text-sm mt-1">&copy; {currentYear} Raphael Vitoi. Todos os direitos reservados.</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/blog" className="hover:text-indigo-400 transition-colors">Manifesto</Link>
          <Link href="/tools/icm" className="hover:text-indigo-400 transition-colors">Ferramentas</Link>
        </div>
      </div>
    </footer>
  );
}
