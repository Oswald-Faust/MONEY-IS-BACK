import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs Edwin | La meilleure solution au meilleur prix",
  description: "Découvrez nos forfaits adaptés à toutes les tailles d'équipes. Commencez gratuitement et passez à la vitesse supérieure avec Edwin Pro ou Team.",
  openGraph: {
    title: "Tarifs Edwin | La meilleure solution au meilleur prix",
    description: "Découvrez nos forfaits adaptés à toutes les tailles d'équipes. Commencez gratuitement et passez à la vitesse supérieure avec Edwin Pro ou Team.",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
