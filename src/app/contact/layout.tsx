import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contactez Edwin | Parlons de votre projet",
  description: "Une question ? Un partenariat ? Notre équipe est à votre écoute. Envoyez-nous un message et construisons ensemble l'avenir de vos projets.",
  openGraph: {
    title: "Contactez Edwin | Parlons de votre projet",
    description: "Une question ? Un partenariat ? Notre équipe est à votre écoute. Envoyez-nous un message et construisons ensemble l'avenir de vos projets.",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
