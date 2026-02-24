import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edwinhub.com';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Edwin - Votre plateforme de tout-en-un pour vos projets",
    template: "%s | Edwin"
  },
  description: "Gérez votre équipe, vos tâches, vos objectifs et bien plus sur une seule plateforme unifiée. L'OS de votre réussite.",
  keywords: ["gestion de projet", "saas", "productivity", "tâches", "collaboration", "Edwin", "workspace", "tout-en-un"],
  authors: [{ name: "Mathias MERCIER" }],
  creator: "Mathias MERCIER",
  publisher: "Edwin Inc.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "Edwin",
    title: "Edwin - Votre plateforme de tout-en-un pour vos projets",
    description: "Gérez votre équipe, vos tâches, vos objectifs et bien plus sur une seule plateforme unifiée.",
    type: "website",
    url: appUrl,
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edwin - Votre plateforme de tout-en-un pour vos projets",
    description: "Gérez votre équipe, vos tâches, vos objectifs et bien plus sur une seule plateforme unifiée.",
    creator: "@edwinhub",
  },
  alternates: {
    canonical: "/",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                },
              }}
            />
            {children}
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
