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
                    <li><Link href="#contato">Contato</Link></li>
                    <li>
                        <Link href="/tools/icm" className="card-cta" style={{ marginTop: 0, padding: '0.4rem 0.8rem', border: '1px solid var(--accent-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            <i className="fa-solid fa-microchip"></i> Simulador
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
  );
};

export default Header;