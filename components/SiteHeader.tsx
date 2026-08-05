"use client";

import { useState } from "react";
import Link from "next/link";
import { WhatsAppIcon, MenuIcon } from "./icons";

const WHATSAPP_BASE = "https://wa.me/5521920184210";

const NAV_LINKS = [
  { hash: "como-funciona", label: "Como funciona" },
  { hash: "produtos", label: "Produtos" },
  { hash: "seguranca", label: "Segurança" },
  { hash: "guia", label: "Sobre a Mavi" },
  { href: "/faq", label: "Dúvidas" },
];

export default function SiteHeader({ homePath = "/" }: { homePath?: string }) {
  const [open, setOpen] = useState(false);
  const resolveHref = (link: (typeof NAV_LINKS)[number]) =>
    "hash" in link ? `${homePath}#${link.hash}` : link.href;

  return (
    <header>
      <div className="header-bar">
        <Link className="wordmark" href={`${homePath}#topo`}>
          MARIADAMAVI
        </Link>
        <nav className="primary-nav" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={resolveHref(link)}>
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
          <Link key={link.label} href={resolveHref(link)} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
