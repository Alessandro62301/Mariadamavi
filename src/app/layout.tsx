import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Header, ScrollToTop } from "@/components/Header";
import { createWhatsAppLink } from "@/lib/storefront";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mavi Imports | Catalogo Apple Premium",
  description:
    "iPhones, iPads e MacBooks com atendimento direto no WhatsApp, garantia funcional e entrega segura pela Mavi Imports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} antialiased`}>
      <body>
        <Header />
        {children}
        <footer className="site-footer">
          <div className="container footer-inner">
            <div>© 2025 Mavi Imports</div>
            <div className="footer-center">
              <a href="https://instagram.com/maviimports_" target="_blank" rel="noreferrer">
                @maviimports_
              </a>
            </div>
            <div className="footer-right">
              <a
                href={createWhatsAppLink("Ola! Quero falar com a Mavi Imports.")}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </footer>
        <ScrollToTop />
      </body>
    </html>
  );
}
