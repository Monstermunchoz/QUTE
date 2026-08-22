import { redirect } from "next/navigation";
import { abonnementLabel } from "@/lib/abonnement";
import { createClient } from "@/lib/supabase/server";

const PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    items: [
      "Profil et photos",
      "Exploration illimitée",
      "20 QRUSH par jour",
      "Matchs et messages",
    ],
  },
  {
    name: "QUTE+",
    price: "4,99€",
    items: [
      "Tout le gratuit",
      "Voir qui t'a QRUSHé",
      "QRUSH illimités",
      "Badge QUTE+",
    ],
  },
  {
    name: "QUTE Club",
    price: "12,99€",
    items: [
      "Tout QUTE+",
      "Profil mis en avant",
      "Événements exclusifs",
      "Badge Club",
    ],
  },
];

export default async function AbonnementPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement")
    .eq("id", user.id)
    .maybeSingle();

  const current = abonnementLabel(
    (profile as { abonnement?: string } | null)?.abonnement,
  );

  return (
    <main className="flex flex-col gap-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Mon abonnement</h1>
        <p className="mt-1 text-sm text-[#888888]">
          Plan actuel : <span className="font-bold text-white">{current}</span>
        </p>
      </header>

      {PLANS.map((plan) => (
        <article
          key={plan.name}
          className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-white">{plan.name}</h2>
            <p className="text-sm text-[#888888]">
              <span className="font-bold text-white">{plan.price}</span>/mois
            </p>
          </div>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-[#CCCCCC]">
            {plan.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {plan.name !== "Gratuit" ? (
            <button
              type="button"
              disabled
              className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#1E1E1E] text-sm font-bold text-[#888888]"
            >
              Passer à {plan.name}
            </button>
          ) : null}
        </article>
      ))}
    </main>
  );
}
