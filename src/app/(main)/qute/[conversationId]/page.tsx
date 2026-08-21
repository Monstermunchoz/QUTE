import { notFound, redirect } from "next/navigation";
import { ChatRoom } from "./chat-room";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, Conversation, Match, Profile } from "@/types";

type ChatPageProps = {
  params: { conversationId: string };
};

export default async function ConversationPage({ params }: ChatPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversationRow } = await supabase
    .from("conversations")
    .select("id, match_id, statut, initiateur_id, destinataire_id")
    .eq("id", params.conversationId)
    .maybeSingle();

  if (!conversationRow) {
    notFound();
  }

  const conversation = conversationRow as Conversation;

  let otherId: string | null = null;

  if (conversation.match_id) {
    const { data: matchRow } = await supabase
      .from("matchs")
      .select("*")
      .eq("id", conversation.match_id)
      .maybeSingle();

    const match = matchRow as Match | null;

    if (
      match &&
      (match.user1_id === user.id || match.user2_id === user.id)
    ) {
      otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    }
  }

  if (!otherId) {
    const isParty =
      conversation.initiateur_id === user.id ||
      conversation.destinataire_id === user.id;

    if (!isParty) {
      notFound();
    }

    otherId =
      conversation.initiateur_id === user.id
        ? conversation.destinataire_id
        : conversation.initiateur_id;
  }

  if (!otherId) {
    notFound();
  }

  if (conversation.statut === "ignoree") {
    notFound();
  }

  const { data: otherRow } = await supabase
    .from("profiles")
    .select("id, pseudo, photo_url")
    .eq("id", otherId)
    .maybeSingle();

  if (!otherRow) {
    notFound();
  }

  const { data: messageRows } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  return (
    <ChatRoom
      conversationId={conversation.id}
      currentUserId={user.id}
      other={otherRow as Pick<Profile, "id" | "pseudo" | "photo_url">}
      initialMessages={(messageRows ?? []) as ChatMessage[]}
      pending={conversation.statut === "en_attente"}
    />
  );
}
