import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://qute-olive.vercel.app"),

  title: {
    default:
      "QUTE — Le réseau social queer de Lyon | Rencontres, sorties, communauté LGBTQIA+",
    template: "%s | QUTE",
  },

  description:
    "QUTE réunit la communauté LGBTQIA+ de Lyon : rencontres, salons de discussion, carte des lieux queer-friendly, agenda des soirées et fonction JE SORS en temps réel. Gratuit, réservé aux 18 ans et plus.",

  keywords: [
    "réseau social LGBTQIA Lyon",
    "application queer Lyon",
    "rencontres LGBT Lyon",
    "communauté gay Lyon",
    "communauté trans Lyon",
    "communauté lesbienne Lyon",
    "sortir Lyon LGBT",
    "bars gays Lyon",
    "clubs queer Lyon",
    "soirées LGBT Lyon",
    "événements queer Lyon",
    "associations LGBT Lyon",
    "lieux queer friendly Lyon",
    "application rencontre queer France",
    "QUTE",
  ],

  authors: [{ name: "QUTE" }],
  creator: "QUTE",
  publisher: "QUTE",

  applicationName: "QUTE",
  category: "social",

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://qute-olive.vercel.app",
    siteName: "QUTE",
    title: "QUTE — Qui · Où · Ce soir",
    description:
      "Le réseau social queer de Lyon. Rencontres, salons, lieux queer-friendly, événements et JE SORS en temps réel. Gratuit, +18.",
  },

  twitter: {
    card: "summary_large_image",
    title: "QUTE — Qui · Où · Ce soir",
    description:
      "Le réseau social queer de Lyon. Rencontres, salons, lieux, événements. Gratuit, +18.",
    creator: "@qute",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://qute-olive.vercel.app",
  },

  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },

  other: {
    rating: "adult",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg)] font-sans text-[var(--text)] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
