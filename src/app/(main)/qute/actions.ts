"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function openConversation(matchId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: match } = await supabase
    .from("matchs")
    .select("id, user1_id, user2_id")
    .eq("id", matchId)
    .maybeSingle();

  if (
    !match ||
    (match.user1_id !== user.id && match.user2_id !== user.id)
  ) {
    redirect("/qute");
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle();

  if (existing?.id) {
    redirect(`/qute/${existing.id}`);
  }

  const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;

  const { data: pendingPair } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(initiateur_id.eq.${user.id},destinataire_id.eq.${otherId}),and(initiateur_id.eq.${otherId},destinataire_id.eq.${user.id})`,
    )
    .maybeSingle();

  if (pendingPair?.id) {
    await supabase
      .from("conversations")
      .update({ statut: "acceptee", match_id: matchId })
      .eq("id", pendingPair.id);

    redirect(`/qute/${pendingPair.id}`);
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      match_id: matchId,
      statut: "acceptee",
      initiateur_id: user.id,
      destinataire_id: otherId,
    })
    .select("id")
    .single();

  if (created?.id) {
    redirect(`/qute/${created.id}`);
  }

  if (error) {
    const { data: retry } = await supabase
      .from("conversations")
      .select("id")
      .eq("match_id", matchId)
      .maybeSingle();

    if (retry?.id) {
      redirect(`/qute/${retry.id}`);
    }
  }

  redirect("/qute");
}
