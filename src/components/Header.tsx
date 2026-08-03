"use client";

import Link from "next/link";
import { ChevronUp, MessageCircle, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/browser-store";
import { createWhatsAppLink } from "@/lib/storefront";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const syncCart = () => {
      const cart = readCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantidade, 0));
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 48);
    };

    syncCart();
    onScroll();
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navItems = [
    { href: "/catalogo/iphones-lacrados", label: "iPhones Lacrados" },
    { href: "/catalogo/iphones-seminovos", label: "Seminovos" },
    { href: "/catalogo/ipads", label: "iPads" },
    { href: "/catalogo/macbooks", label: "MacBooks" },
  ];

  return (
    <>
      <div className="announcement-bar">
        <div className="marquee">
          Entrega hoje em Niteroi, Sao Goncalo e Marica · Serial verificavel · Pague so
          depois de testar · Atendimento direto no WhatsApp
        </div>
      </div>

      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="container header-inner">
          <Link href="/" className="brand-mark">
            <span className="brand-badge">M</span>
            <span className="brand-copy">
              Mavi <strong>Imports</strong>
            </span>
          </Link>

          <nav className="header-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link href="/carrinho" className="cart-link" aria-label="Abrir carrinho">
              <ShoppingBag size={18} />
              {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
            </Link>

            <a
              href={createWhatsAppLink(
                "Ola! Quero falar com a Mavi Imports sobre os produtos disponiveis.",
              )}
              target="_blank"
              rel="noreferrer"
              className="whatsapp-link"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`scroll-to-top ${visible ? "visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
    >
      <ChevronUp size={22} />
    </button>
  );
}
