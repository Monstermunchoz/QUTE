import { notFound, redirect } from "next/navigation";
import { SalonRoom } from "./salon-room";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Salon, SalonMessage } from "@/types";

type SalonPageProps = {
  params: { id: string };
};

export default async function SalonPage({ params }: SalonPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: salonRow } = await supabase
    .from("salons")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!salonRow) {
    notFound();
  }

  const salon = salonRow as Salon;

  const { data: messageRows } = await supabase
    .from("salon_messages")
    .select("*")
    .eq("salon_id", salon.id)
    .order("created_at", { ascending: true });

  const messages = (messageRows ?? []) as SalonMessage[];
  const authorIds = Array.from(
    new Set(messages.map((message) => message.auteur_id)),
  );

  let authors: Record<
    string,
    Pick<Profile, "id" | "pseudo" | "photo_url" | "abonnement" | "role">
  > = {};

  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo, photo_url, abonnement, role")
      .in("id", authorIds);

    authors = Object.fromEntries(
      ((profiles ?? []) as Pick<
        Profile,
        "id" | "pseudo" | "photo_url" | "abonnement" | "role"
      >[]).map(
        (profile) => [profile.id, profile],
      ),
    );
  }

  return (
    <SalonRoom
      salon={salon}
      currentUserId={user.id}
      initialMessages={messages}
      authors={authors}
    />
  );
}
