import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { createClient } from "@/lib/supabase/server";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "QUTE",
  alternateName: "QUTE — Qui, Où, Ce soir",
  url: "https://qute-olive.vercel.app",
  description:
    "Réseau social communautaire LGBTQIA+ de Lyon : rencontres, salons, lieux queer-friendly, événements et statut de sortie en temps réel.",
  applicationCategory: "SocialNetworkingApplication",
  operatingSystem: "Web",
  inLanguage: "fr-FR",
  isAccessibleForFree: true,
  audience: {
    "@type": "Audience",
    audienceType: "LGBTQIA+",
    suggestedMinAge: 18,
  },
  areaServed: {
    "@type": "City",
    name: "Lyon",
    addressRegion: "Auvergne-Rhône-Alpes",
    addressCountry: "FR",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Gratuit",
      price: "0",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "QUTE+",
      price: "9.99",
      priceCurrency: "EUR",
      description: "Abonnement mensuel QUTE+",
    },
    {
      "@type": "Offer",
      name: "QUTE Club",
      price: "19.99",
      priceCurrency: "EUR",
      description: "Abonnement mensuel QUTE Club",
    },
  ],
};

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/accueil");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
