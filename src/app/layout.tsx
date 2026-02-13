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
  title: "MONEY IS BACK | Gestion de Projets",
  description: "Plateforme de gestion de projets ultra-personnalisée pour centraliser vos business",
  keywords: ["gestion de projet", "saas", "productivity", "tâches", "collaboration"],
  authors: [{ name: "Mathias MERCIER" }],
  openGraph: {
    title: "MONEY IS BACK | Gestion de Projets",
    description: "Plateforme de gestion de projets ultra-personnalisée",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
