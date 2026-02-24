import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Edwin | Insights sur la productivité et le futur du travail",
  description: "Retrouvez nos derniers articles, conseils et réflexions sur la gestion de projet, l'IA et l'efficacité au quotidien.",
  openGraph: {
    title: "Blog Edwin | Insights sur la productivité et le futur du travail",
    description: "Retrouvez nos derniers articles, conseils et réflexions sur la gestion de projet, l'IA et l'efficacité au quotidien.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
