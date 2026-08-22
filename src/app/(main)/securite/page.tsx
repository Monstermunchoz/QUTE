import { redirect } from "next/navigation";
import { BlockedList } from "./blocked-list";
import { SecurityControls } from "./security-controls";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export default async function SecuritePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: blocks } = await supabase
    .from("blocages")
    .select("bloque_id")
    .eq("bloqueur_id", user.id);

  const blockedIds = (blocks ?? []).map((row) => row.bloque_id as string);
  let blockedProfiles: Pick<Profile, "id" | "pseudo" | "photo_url">[] = [];

  if (blockedIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, pseudo, photo_url")
      .in("id", blockedIds);

    blockedProfiles = (data ?? []) as Pick<
      Profile,
      "id" | "pseudo" | "photo_url"
    >[];
  }

  return (
    <main className="flex flex-col gap-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">
          Sécurité et confidentialité
        </h1>
      </header>

      <section className="rounded-[16px] border border-[#1E1E1E] bg-[#111111]">
        <h2 className="px-4 pt-4 text-sm font-bold text-white">
          Profils bloqués
        </h2>
        <BlockedList profiles={blockedProfiles} />
      </section>

      <SecurityControls />
    </main>
  );
}
