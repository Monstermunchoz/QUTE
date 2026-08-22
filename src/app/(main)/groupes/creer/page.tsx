import { redirect } from "next/navigation";
import { CreateGroupeForm } from "./create-groupe-form";
import { PageTitle } from "@/components/ui/BackButton";
import { createClient } from "@/lib/supabase/server";

export default async function CreateGroupePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("compte_verifie")
    .eq("id", user.id)
    .maybeSingle();

  const verified = Boolean(profile?.compte_verifie);

  return (
    <main className="flex flex-col gap-4 pb-4">
      <PageTitle title="Créer un groupe" />
      {verified ? (
        <CreateGroupeForm />
      ) : (
        <p className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4 text-[#888888]">
          Fonctionnalité réservée aux comptes vérifiés
        </p>
      )}
    </main>
  );
}
