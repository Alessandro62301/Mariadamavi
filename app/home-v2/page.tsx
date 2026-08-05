import type { Metadata } from "next";

import HomeReplica from "@/components/HomeReplica";
import { PoemAnimation } from "@/components/ui/3d-animation";

export const metadata: Metadata = {
  title: { absolute: "Maria da Mavi | Apple para a vida real" },
  description: "Conheça uma forma mais humana e segura de escolher seu próximo iPhone, iPad ou MacBook, com acompanhamento pessoal até a entrega.",
  alternates: { canonical: "/home-v2" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/home-v2",
    siteName: "Maria da Mavi",
    title: "Maria da Mavi | Apple para a vida real",
    description: "Atendimento pessoal para escolher seu próximo Apple com clareza, segurança e acompanhamento até a entrega.",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Maria da Mavi — seu próximo Apple com orientação de verdade",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maria da Mavi | Apple para a vida real",
    description: "Atendimento pessoal para escolher seu próximo Apple com clareza, segurança e acompanhamento até a entrega.",
    images: [{
      url: "/twitter-image",
      width: 1200,
      height: 630,
      alt: "Maria da Mavi — seu próximo Apple com orientação de verdade",
    }],
  },
};

const MARQUEE_HTML = `
  <p>MARIADAMAVI&nbsp; <span>MARIADAMAVI</span>&nbsp; MARIADAMAVI&nbsp; <span>MARIADAMAVI</span>&nbsp; MARIADAMAVI&nbsp; <span>MARIADAMAVI</span>&nbsp; MARIADAMAVI&nbsp; <span>MARIADAMAVI</span>&nbsp;</p>
`;

export default function HomeV2Page() {
  return (
    <HomeReplica
      homePath="/home-v2"
      hero={(
        <PoemAnimation
          poemHTML={MARQUEE_HTML}
          backgroundImageUrl="/imgs/maria-victoria-apple-hero-v2.png"
        />
      )}
    />
  );
}
