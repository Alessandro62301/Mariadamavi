import type { Metadata } from "next";
import TrackingExperience from "@/components/TrackingExperience";

export const metadata: Metadata = {
  title: "Acompanhe sua jornada | Mavi",
  description: "Veja cada etapa da entrega do seu Apple com a Mavi.",
};

export default function RastreioPage() {
  return <TrackingExperience />;
}
