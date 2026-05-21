import Link from 'next/link';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
    <header className="sticky top-0 z-50 w-full glass-panel border-x-0 border-t-0 rounded-none bg-[rgba(2,6,23,0.7)] backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Site branding */}
          <div className="flex-shrink-0 mr-4">
            <Link href="/" className="flex items-center group">
              <span className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">R.VITOI</span>
              <span className="text-indigo-500 font-black text-xl ml-1">.</span>
              <span className="font-editorial text-2xl font-bold text-white group-hover:glow-text transition-all tracking-wider">R.VITOI</span>
              <span className="text-indigo-500 font-black text-2xl ml-1 group-hover:pulse-glow">.</span>
            </Link>
          </div>

          {/* Site navigation */}
          <nav className="flex flex-grow">
            <ul className="flex flex-grow justify-end flex-wrap items-center">
            <ul className="flex flex-grow justify-end flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="font-medium text-slate-400 hover:text-indigo-400 px-4 py-3 flex items-center transition duration-150 ease-in-out">
                <Link href="/" className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-white px-4 py-3 flex items-center transition-colors rounded-lg hover:bg-slate-800/50">
                  Masterclass
                </Link>
              </li>
              <li>
                <Link href="/blog" className="font-medium text-slate-400 hover:text-indigo-400 px-4 py-3 flex items-center transition duration-150 ease-in-out">
                <Link href="/blog" className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-white px-4 py-3 flex items-center transition-colors rounded-lg hover:bg-slate-800/50">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/tools/icm" className="font-medium text-slate-400 hover:text-indigo-400 px-4 py-3 flex items-center transition duration-150 ease-in-out">
                  Ferramentas
                <Link href="/tools/icm" className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-400 hover:text-indigo-300 px-4 py-3 flex items-center transition-colors rounded-lg hover:bg-indigo-500/10">
                  <i className="fa-solid fa-microchip mr-2"></i> Laboratório
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;