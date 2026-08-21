import { redirect } from "next/navigation";
import { CreateEventForm } from "./create-event-form";
import { createClient } from "@/lib/supabase/server";
import type { Lieu } from "@/types";

export default async function CreerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: lieuRows } = await supabase
    .from("lieux")
    .select("id, nom, adresse")
    .order("nom", { ascending: true });

  return (
    <main className="flex flex-col gap-4 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Créer un événement</h1>
        <p className="text-sm text-[#888888]">
          Ouvert à tous. Publication après validation.
        </p>
      </header>
      <CreateEventForm
        lieux={(lieuRows ?? []) as Pick<Lieu, "id" | "nom" | "adresse">[]}
      />
    </main>
  );
}
