import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { createClient } from "@/lib/supabase/server";

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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/accueil");
  }

  return <LandingPage />;
}
