import type { Metadata } from "next";

import HomeReplica from "@/components/HomeReplica";

export const metadata: Metadata = {
  title: { absolute: "Maria da Mavi | Home antiga" },
  description: "Versão anterior da página inicial da Maria da Mavi.",
  robots: { index: false, follow: false },
};

export default function HomeAntigaPage() {
  return <HomeReplica homePath="/home-antiga" />;
}
