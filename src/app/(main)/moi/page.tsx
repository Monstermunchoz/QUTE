import { redirect } from "next/navigation";
import { ProfilePanel } from "./profile-panel";
import { createClient } from "@/lib/supabase/server";
import type { JeSors, Profile } from "@/types";

export default async function MoiPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    redirect("/login");
  }

  const profile = data as Profile;

  const [{ count: qrushCount }, { count: matchCount }, { data: jeSorsRow }] =
    await Promise.all([
    supabase
      .from("qrushs")
      .select("*", { count: "exact", head: true })
      .eq("receveur_id", user.id),
    supabase
      .from("matchs")
      .select("*", { count: "exact", head: true })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
    supabase.from("je_sors").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const jeSors = (jeSorsRow as JeSors | null) ?? null;

  return (
    <ProfilePanel
      profile={profile}
      qrushCount={qrushCount ?? 0}
      matchCount={matchCount ?? 0}
      jeSors={jeSors}
    />
  );
}
