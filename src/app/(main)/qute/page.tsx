import { redirect } from "next/navigation";
import { QuteHub } from "./qute-hub";
import { createClient } from "@/lib/supabase/server";
import type { Conversation, Match, Profile } from "@/types";

export default async function QutePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: matchRows }, { data: pendingRows }] = await Promise.all([
    supabase
      .from("matchs")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("*")
      .eq("destinataire_id", user.id)
      .eq("statut", "en_attente")
      .order("created_at", { ascending: false }),
  ]);

  const matches = (matchRows ?? []) as Match[];
  const pending = (pendingRows ?? []) as Conversation[];

  const otherIds = [
    ...matches.map((match) =>
      match.user1_id === user.id ? match.user2_id : match.user1_id,
    ),
    ...pending.map((conversation) => conversation.initiateur_id).filter(Boolean),
  ] as string[];

  let profilesById: Record<string, Profile> = {};

  if (otherIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", Array.from(new Set(otherIds)));

    profilesById = Object.fromEntries(
      ((profiles ?? []) as Profile[]).map((profile) => [profile.id, profile]),
    );
  }

  return (
    <QuteHub
      currentUserId={user.id}
      matches={matches}
      pending={pending}
      profilesById={profilesById}
    />
  );
}
