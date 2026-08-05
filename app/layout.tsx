import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.APP_URL || "https://mariadamavi.com.br";
const SITE_TITLE = "Maria da Mavi | Seu próximo Apple com orientação de verdade";
const SITE_DESCRIPTION =
  "Escolha iPhone, iPad ou MacBook com atendimento pessoal, contrato, nota fiscal e acompanhamento até a entrega em todo o Brasil.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Maria da Mavi",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Maria da Mavi",
  authors: [{ name: "Maria Victória", url: SITE_URL }],
  creator: "Maria Victória",
  publisher: "Maria da Mavi",
  category: "Tecnologia",
  keywords: [
    "Apple",
    "iPhone",
    "iPad",
    "MacBook",
    "Apple seminovo",
    "Apple CPO",
    "Maria da Mavi",
    "Mavi",
    "Niterói",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Maria da Mavi",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=League+Gothic&family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
