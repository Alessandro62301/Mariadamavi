"use client";

import { useState } from "react";
import Link from "next/link";
import { WhatsAppIcon, MenuIcon } from "./icons";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/siteCta";

const NAV_LINKS = [
  { hash: "seguranca", label: "Segurança" },
  { hash: "guia", label: "Sobre a Mavi" },
  { hash: "como-funciona", label: "Como funciona" },
  { hash: "produtos", label: "Produtos" },
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
          href={PRIMARY_CTA_HREF}
        >
          {PRIMARY_CTA_LABEL}
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
