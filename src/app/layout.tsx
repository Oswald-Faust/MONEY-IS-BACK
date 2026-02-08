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
  title: "Project Hub | Gestion de Projets",
  description: "Plateforme de gestion de projets ultra-personnalisée pour centraliser vos business",
  keywords: ["gestion de projet", "saas", "productivité", "tâches", "collaboration"],
  authors: [{ name: "Mathias MERCIER" }],
  openGraph: {
    title: "Project Hub | Gestion de Projets",
    description: "Plateforme de gestion de projets ultra-personnalisée",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a24',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
