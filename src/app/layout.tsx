import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Edwin - Votre plateforme de tout-en-un pour vos projets",
  description: "Gérez votre équipe, vos tâches, vos objectifs et bien plus.",
  keywords: ["gestion de projet", "saas", "productivity", "tâches", "collaboration"],
  authors: [{ name: "Mathias MERCIER" }],
  openGraph: {
    title: "Edwin - Votre plateforme de tout-en-un pour vos projets",
    description: "Gérez votre équipe, vos tâches, vos objectifs et bien plus.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edwin - Votre plateforme de tout-en-un pour vos projets",
    description: "Gérez votre équipe, vos tâches, vos objectifs et bien plus.",
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
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
