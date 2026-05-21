import Link from 'next/link';

const Header = () => {
  return (
    <header className="main-header">
        <div className="container">
            <h1 className="logo">
                <Link href="/">Poker<span className="accent">Racional</span></Link>
            </h1>
            <nav>
                <ul>
                    <li><Link href="/#metodo">O Método</Link></li>
                    <li><Link href="/#autor">O Autor</Link></li>
                    <li><Link href="/#biblioteca">Biblioteca</Link></li>
                    <li><Link href="/#contato">Contato</Link></li>
                </ul>
            </nav>
        </div>
    </header>
  );
};

export default Header;