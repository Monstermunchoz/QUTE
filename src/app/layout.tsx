import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QUTE — Qui • Où • Ce soir | Réseau communautaire LGBTQIA+ Lyon",
  description:
    "QUTE est le réseau social communautaire queer de Lyon. Rencontres, sorties, événements, lieux et chat — tout pour la communauté LGBTQIA+ lyonnaise.",
  keywords:
    "LGBTQIA Lyon, réseau social queer Lyon, rencontres trans Lyon, communauté gay Lyon, soirées queer Lyon, application LGBTQIA",
  openGraph: {
    title: "QUTE — Qui • Où • Ce soir",
    description: "Le réseau communautaire queer de Lyon.",
    url: "https://qute.fr",
    siteName: "QUTE",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://qute-olive.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "QUTE",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-qute-dark font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
