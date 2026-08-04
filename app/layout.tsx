import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mavi | O Apple certo para o seu momento",
  description:
    "Escolha seu próximo iPhone, iPad ou MacBook com orientação pessoal, contrato, nota fiscal e acompanhamento até a entrega em todo o Brasil.",
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
