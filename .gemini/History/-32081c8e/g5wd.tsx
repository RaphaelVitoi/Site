import Link from 'next/link';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Site branding */}
          <div className="flex-shrink-0 mr-4">
            <Link href="/" className="flex items-center group">
              <span className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">R.VITOI</span>
              <span className="text-indigo-500 font-black text-xl ml-1">.</span>
            </Link>
          </div>

          {/* Site navigation */}
          <nav className="flex flex-grow">
            <ul className="flex flex-grow justify-end flex-wrap items-center">
              <li>
                <Link href="/" className="font-medium text-slate-400 hover:text-indigo-400 px-4 py-3 flex items-center transition duration-150 ease-in-out">
                  Masterclass
                </Link>
              </li>
              <li>
                <Link href="/blog" className="font-medium text-slate-400 hover:text-indigo-400 px-4 py-3 flex items-center transition duration-150 ease-in-out">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/tools/icm" className="font-medium text-slate-400 hover:text-indigo-400 px-4 py-3 flex items-center transition duration-150 ease-in-out">
                  Ferramentas
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