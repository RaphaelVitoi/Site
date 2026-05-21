import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer id="contato">
        <h3>Conecte-se</h3>
        <ul>
            <li><a href="https://www.twitch.tv/RaphaelVitoiPoker" target="_blank" rel="noopener"><strong>Twitch:</strong> RaphaelVitoiPoker</a></li>
            <li><a href="https://www.youtube.com/results?search_query=Raphael+Vitoi" target="_blank" rel="noopener"><strong>YouTube:</strong> Raphael Vitoi</a></li>
            <li><a href="https://www.instagram.com/raphaelvitoi/" target="_blank" rel="noopener"><strong>Instagram:</strong> @raphaelvitoi</a></li>
        </ul>
        <p style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &copy; {currentYear} Raphael Vitoi. Todos os direitos reservados.
        </p>
    </footer>
  );
}
