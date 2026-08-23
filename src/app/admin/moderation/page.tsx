import { ModerationHub } from "./moderation-hub";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, SalonMessage } from "@/types";

type Flagged = {
  id: string;
  source: "prive" | "salon";
  auteurId: string;
  pseudo: string;
  extrait: string;
  contenu: string;
  categorie: string | null;
  score: number;
  createdAt: string;
  conversationId: string | null;
  salonId: string | null;
};

type QuarantineItem = {
  id: string;
  auteurId: string;
  pseudo: string;
  extrait: string;
  contenu: string;
  categorie: string | null;
  score: number;
  createdAt: string;
  conversationId: string | null;
  salonId: string | null;
};

type RuleItem = {
  id: string;
  pattern: string;
  categorie: string;
  poids: number;
  actif: boolean;
};

function excerpt(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 50 ? `${clean.slice(0, 50)}…` : clean;
}

export default async function AdminModerationPage() {
  const supabase = createClient();

  const [
    { data: priveRows },
    { data: salonRows },
    { data: quarRows },
    { data: ruleRows },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select("id, auteur_id, contenu, trust_categorie, trust_score, created_at, conversation_id, masque, a_verifier")
      .eq("a_verifier", true)
      .eq("masque", false)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("salon_messages")
      .select("id, auteur_id, contenu, trust_categorie, trust_score, created_at, salon_id, masque, a_verifier")
      .eq("a_verifier", true)
      .eq("masque", false)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("messages_quarantaine")
      .select("id, auteur_id, contenu, trust_categorie, trust_score, created_at, conversation_id, salon_id")
      .eq("statut", "en_attente")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("trust_rules")
      .select("id, pattern, categorie, poids, actif, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const prive = (priveRows ?? []) as (ChatMessage & {
    conversation_id: string;
    auteur_id: string;
  })[];
  const salon = (salonRows ?? []) as (SalonMessage & {
    salon_id: string;
    auteur_id: string;
  })[];
  const quar = (quarRows ?? []) as {
    id: string;
    auteur_id: string;
    contenu: string;
    trust_categorie: string | null;
    trust_score: number | null;
    created_at: string;
    conversation_id: string | null;
    salon_id: string | null;
  }[];

  const authorIds = Array.from(
    new Set([
      ...prive.map((row) => row.auteur_id),
      ...salon.map((row) => row.auteur_id),
      ...quar.map((row) => row.auteur_id),
    ]),
  );

  let pseudos: Record<string, string> = {};
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo")
      .in("id", authorIds);
    pseudos = Object.fromEntries(
      ((profiles ?? []) as { id: string; pseudo: string }[]).map((row) => [
        row.id,
        row.pseudo,
      ]),
    );
  }

  const flagged: Flagged[] = [
    ...prive.map((row) => ({
      id: row.id,
      source: "prive" as const,
      auteurId: row.auteur_id,
      pseudo: pseudos[row.auteur_id] ?? "QUTE",
      extrait: excerpt(row.contenu),
      contenu: row.contenu,
      categorie: row.trust_categorie ?? null,
      score: row.trust_score ?? 0,
      createdAt: row.created_at,
      conversationId: row.conversation_id,
      salonId: null,
    })),
    ...salon.map((row) => ({
      id: row.id,
      source: "salon" as const,
      auteurId: row.auteur_id,
      pseudo: pseudos[row.auteur_id] ?? "QUTE",
      extrait: excerpt(row.contenu),
      contenu: row.contenu,
      categorie: row.trust_categorie ?? null,
      score: row.trust_score ?? 0,
      createdAt: row.created_at,
      conversationId: null,
      salonId: row.salon_id,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const quarantaine: QuarantineItem[] = quar.map((row) => ({
    id: row.id,
    auteurId: row.auteur_id,
    pseudo: pseudos[row.auteur_id] ?? "QUTE",
    extrait: excerpt(row.contenu),
    contenu: row.contenu,
    categorie: row.trust_categorie,
    score: row.trust_score ?? 0,
    createdAt: row.created_at,
    conversationId: row.conversation_id,
    salonId: row.salon_id,
  }));

  const rules = (ruleRows ?? []) as RuleItem[];

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-white md:text-2xl">Modération</h1>
      <ModerationHub
        flagged={flagged}
        quarantaine={quarantaine}
        rules={rules}
      />
    </main>
  );
}
