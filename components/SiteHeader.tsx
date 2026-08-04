"use client";

import { useState } from "react";
import Link from "next/link";
import { WhatsAppIcon, MenuIcon } from "./icons";

const WHATSAPP_BASE = "https://wa.me/5521920184210";

const NAV_LINKS = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#produtos", label: "Produtos" },
  { href: "/#seguranca", label: "Segurança" },
  { href: "/#guia", label: "Sobre a Mavi" },
  { href: "/faq", label: "Dúvidas" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="header-bar">
        <Link className="wordmark" href="/#topo">
          MARIADAMAVI
        </Link>
        <nav className="primary-nav" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          className="header-cta"
          href={`${WHATSAPP_BASE}?text=${encodeURIComponent(
            "Oi, Mavi! Vim pelo site e quero ajuda para escolher meu próximo Apple."
          )}`}
        >
          Falar com a Mavi
          <span className="cta-ic" aria-hidden="true">
            <WhatsAppIcon className="ic" />
          </span>
        </a>
        <button
          className="menu-btn"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon className="ic" />
        </button>
      </div>
      <nav id="mobile-nav" hidden={!open} aria-label="Navegação mobile">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
