import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rejoindre Edwin | Inventons le futur du travail",
  description: "Nous recrutons des esprits curieux et des bâtisseurs passionnés pour transformer la manière dont le monde travaille. Découvrez nos offres d'emploi.",
  openGraph: {
    title: "Rejoindre Edwin | Inventons le futur du travail",
    description: "Découvrez nos postes ouverts et rejoignez l'aventure Edwin pour bâtir l'avenir de la productivité.",
    type: "website",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
