import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos d'Edwin | Bâtir l'avenir du travail collaboratif",
  description: "Découvrez l'histoire d'Edwin et notre mission : simplifier la complexité du travail moderne en centralisant tout ce qui compte au même endroit.",
  openGraph: {
    title: "À propos d'Edwin | Bâtir l'avenir du travail collaboratif",
    description: "Découvrez l'histoire d'Edwin et notre mission : simplifier la complexité du travail moderne en centralisant tout ce qui compte au même endroit.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
