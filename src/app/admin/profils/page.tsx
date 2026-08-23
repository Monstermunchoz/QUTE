import { redirect } from "next/navigation";
import { ProfilsTable } from "./profils-table";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export default async function AdminProfilsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("profiles")
    .select("id, pseudo, ville, role, compte_verifie, photo_status")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-white md:text-2xl">Profils</h1>
      <ProfilsTable
        currentUserId={user.id}
        initialQuery={searchParams.q ?? ""}
        profiles={
          (rows ?? []) as Pick<
            Profile,
            "id" | "pseudo" | "ville" | "role" | "compte_verifie" | "photo_status"
          >[]
        }
      />
    </main>
  );
}
