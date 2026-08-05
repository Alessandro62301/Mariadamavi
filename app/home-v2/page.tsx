import type { Metadata } from "next";

import HomeReplica from "@/components/HomeReplica";
import { PoemAnimation } from "@/components/ui/3d-animation";

export const metadata: Metadata = {
  title: "Maria da Mavi | Seu próximo Apple",
  description: "Uma nova experiência Mavi para escolher seu próximo Apple com clareza e acompanhamento pessoal.",
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
