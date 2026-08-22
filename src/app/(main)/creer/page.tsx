import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/ui/BackButton";
import { isQutePlus } from "@/lib/abonnement";
import { createClient } from "@/lib/supabase/server";
import { CreateEventForm } from "./create-event-form";
import type { Lieu } from "@/types";

export default async function CreerPage() {
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

  if (!isQutePlus((profile as { abonnement?: string } | null)?.abonnement)) {
    return (
      <main className="flex flex-col gap-4">
        <PageTitle title="Créer un événement" />
        <article className="mx-auto flex w-full max-w-md flex-col items-center rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-8 text-center">
          <svg
            width={48}
            height={48}
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#creer-star)"
            strokeWidth="1.6"
            aria-hidden
          >
            <defs>
              <linearGradient id="creer-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF2D87" />
                <stop offset="100%" stopColor="#7B2FFF" />
              </linearGradient>
            </defs>
            <path d="M12 4 14.2 9.2 20 10l-4 3.8.9 5.7L12 16.8 7.1 19.5 8 13.8 4 10l5.8-.8z" />
          </svg>
          <h2 className="mt-4 text-[22px] font-bold text-white">
            Organise tes événements
          </h2>
          <p className="page-copy mt-3 text-[#888888]">
            La création d&apos;événements est réservée aux membres QUTE+ et QUTE
            Club. Publie tes soirées, tes rencontres, tes projets — et fais
            venir la communauté.
          </p>
          <Link
            href="/abonnement"
            className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[12px] text-base font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
          >
            Découvrir QUTE+
          </Link>
          <Link
            href="/explorer?tab=evenements"
            className="mt-3 text-sm font-bold text-[#888888]"
          >
            Voir les événements à venir
          </Link>
        </article>
      </main>
    );
  }

  const { data: lieuRows } = await supabase
    .from("lieux")
    .select("id, nom, adresse")
    .order("nom", { ascending: true });

  return (
    <main className="flex flex-col gap-4">
      <PageTitle
        title="Créer un événement"
        subtitle="Publication après validation."
      />
      <CreateEventForm
        lieux={(lieuRows ?? []) as Pick<Lieu, "id" | "nom" | "adresse">[]}
      />
    </main>
  );
}
