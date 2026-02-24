import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partenaires Edwin | Grandissons ensemble",
  description: "Rejoignez notre programme de partenariat et créez de la valeur pour vos clients avec l'infrastructure Edwin. Devenez partenaire dès aujourd'hui.",
  openGraph: {
    title: "Partenaires Edwin | Grandissons ensemble",
    description: "Rejoignez notre programme de partenariat et créez de la valeur pour vos clients avec l'infrastructure Edwin.",
    type: "website",
  },
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
