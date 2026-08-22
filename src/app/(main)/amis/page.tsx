import { redirect } from "next/navigation";
import { AmisHub } from "./amis-hub";
import { otherAmiId } from "@/lib/amis";
import { createClient } from "@/lib/supabase/server";
import type { Ami, Profile } from "@/types";

export default async function AmisPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: relationRows } = await supabase
    .from("amis")
    .select("*")
    .or(`demandeur_id.eq.${user.id},destinataire_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const relations = (relationRows ?? []) as Ami[];
  const otherIds = relations.map((item) => otherAmiId(item, user.id));

  let profilesById: Record<
    string,
    Pick<Profile, "id" | "pseudo" | "ville" | "photo_url">
  > = {};

  if (otherIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo, ville, photo_url")
      .in("id", Array.from(new Set(otherIds)));

    profilesById = Object.fromEntries(
      (
        (profiles ?? []) as Pick<
          Profile,
          "id" | "pseudo" | "ville" | "photo_url"
        >[]
      ).map((profile) => [profile.id, profile]),
    );
  }

  return (
    <AmisHub
      currentUserId={user.id}
      relations={relations}
      profilesById={profilesById}
    />
  );
}
