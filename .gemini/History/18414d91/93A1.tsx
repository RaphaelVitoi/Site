export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer id="contato" className="footer-premium">
      <div className="footer-social">
        <a href="https://www.twitch.tv/RaphaelVitoiPoker" target="_blank" rel="noopener" className="social-icon" aria-label="Twitch">
          <span className="fa-brands fa-twitch"></span>
        </a>
        <a href="https://www.youtube.com/@RaphaelVitoiPoker" target="_blank" rel="noopener" className="social-icon" aria-label="YouTube">
          <span className="fa-brands fa-youtube"></span>
        </a>
        <a href="https://www.instagram.com/raphaelvitoi/" target="_blank" rel="noopener" className="social-icon" aria-label="Instagram">
          <span className="fa-brands fa-instagram"></span>
        </a>
      </div>
      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.6 }}>
        &copy; {currentYear} Raphael Vitoi. Todos os direitos reservados.
      </p>
    </footer>
  );
}
