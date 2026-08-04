import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="wordmark" style={{ color: "var(--ivory)" }}>
              MARIADAMAVI
            </p>
            <p className="footer-signature">
              Não vendemos apenas Apple. Entregamos tranquilidade pra quem leva a vida a sério.
            </p>
          </div>
          <ul className="footer-links">
            <li><Link href="/#como-funciona">Como funciona</Link></li>
            <li><Link href="/#produtos">Produtos</Link></li>
            <li><Link href="/#seguranca">Segurança</Link></li>
            <li><Link href="/faq">Dúvidas</Link></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="https://wa.me/5521920184210">WhatsApp</a></li>
            <li><a href="#">Política de privacidade</a></li>
          </ul>
        </div>
        <p className="footer-note">
          Apple e os nomes de seus produtos são marcas de seus respectivos titulares. A Mavi é uma operação independente.
        </p>
      </div>
    </footer>
  );
}
