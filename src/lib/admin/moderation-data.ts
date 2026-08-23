import { createServiceClient } from "@/lib/supabase/admin";

export type FlaggedMessage = {
  id: string;
  source: "prive" | "salon";
  auteurId: string;
  pseudo: string;
  photoUrl: string | null;
  extrait: string;
  contenu: string;
  categorie: string | null;
  score: number;
  createdAt: string;
  conversationId: string | null;
  salonId: string | null;
  lieu: string;
};

export type QuarantineItem = {
  id: string;
  auteurId: string;
  pseudo: string;
  photoUrl: string | null;
  extrait: string;
  contenu: string;
  categorie: string | null;
  score: number;
  createdAt: string;
  conversationId: string | null;
  salonId: string | null;
  lieu: string;
};

type ProfileLite = {
  id: string;
  pseudo: string;
  photo_url: string | null;
};

type MessageRow = {
  id: string;
  auteur_id: string;
  contenu: string;
  trust_categorie: string | null;
  trust_score: number | null;
  created_at: string;
  conversation_id?: string | null;
  salon_id?: string | null;
  masque: boolean | null;
  a_verifier: boolean | null;
};

type QuarantineRow = {
  id: string;
  auteur_id: string;
  contenu: string;
  trust_categorie: string | null;
  trust_score: number | null;
  created_at: string;
  conversation_id: string | null;
  salon_id: string | null;
};

function excerpt(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function isFlagged(row: Pick<MessageRow, "a_verifier" | "masque">) {
  return row.a_verifier === true && row.masque !== true;
}

async function loadProfiles(
  admin: ReturnType<typeof createServiceClient>,
  ids: string[],
) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const map: Record<string, ProfileLite> = {};

  if (unique.length === 0) {
    return map;
  }

  const { data } = await admin
    .from("profiles")
    .select("id, pseudo, photo_url")
    .in("id", unique);

  for (const row of (data ?? []) as ProfileLite[]) {
    map[row.id] = row;
  }

  return map;
}

async function conversationLabels(
  admin: ReturnType<typeof createServiceClient>,
  conversationIds: string[],
  authorByConv: Record<string, string>,
  profiles: Record<string, ProfileLite>,
) {
  const labels: Record<string, string> = {};
  const unique = Array.from(new Set(conversationIds.filter(Boolean)));

  if (unique.length === 0) {
    return labels;
  }

  const { data: convRows } = await admin
    .from("conversations")
    .select("id, match_id, initiateur_id, destinataire_id")
    .in("id", unique);

  const convs = (convRows ?? []) as {
    id: string;
    match_id: string | null;
    initiateur_id: string | null;
    destinataire_id: string | null;
  }[];

  const matchIds = Array.from(
    new Set(convs.map((row) => row.match_id).filter(Boolean) as string[]),
  );

  let matches: Record<string, { user1_id: string; user2_id: string }> = {};
  if (matchIds.length > 0) {
    const { data: matchRows } = await admin
      .from("matchs")
      .select("id, user1_id, user2_id")
      .in("id", matchIds);
    matches = Object.fromEntries(
      (
        (matchRows ?? []) as {
          id: string;
          user1_id: string;
          user2_id: string;
        }[]
      ).map((row) => [row.id, row]),
    );
  }

  const extraIds: string[] = [];
  for (const conv of convs) {
    extraIds.push(conv.initiateur_id ?? "", conv.destinataire_id ?? "");
    const match = conv.match_id ? matches[conv.match_id] : undefined;
    if (match) {
      extraIds.push(match.user1_id, match.user2_id);
    }
  }

  const missing = extraIds.filter((id) => id && !profiles[id]);
  Object.assign(profiles, await loadProfiles(admin, missing));

  for (const conv of convs) {
    const authorId = authorByConv[conv.id];
    const match = conv.match_id ? matches[conv.match_id] : undefined;
    const peers = [
      conv.initiateur_id,
      conv.destinataire_id,
      match?.user1_id,
      match?.user2_id,
    ].filter((id): id is string => Boolean(id) && id !== authorId);
    const otherPseudo = peers[0] ? profiles[peers[0]]?.pseudo : null;
    labels[conv.id] = otherPseudo ? `Chat avec ${otherPseudo}` : "Chat privé";
  }

  return labels;
}

async function salonLabels(
  admin: ReturnType<typeof createServiceClient>,
  salonIds: string[],
) {
  const labels: Record<string, string> = {};
  const unique = Array.from(new Set(salonIds.filter(Boolean)));

  if (unique.length === 0) {
    return labels;
  }

  const { data } = await admin.from("salons").select("id, nom").in("id", unique);

  for (const row of (data ?? []) as { id: string; nom: string }[]) {
    labels[row.id] = row.nom;
  }

  return labels;
}

export async function fetchModerationCounts() {
  const admin = createServiceClient();

  const [prive, salon, quarantaine] = await Promise.all([
    admin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("a_verifier", true)
      .not("masque", "is", true),
    admin
      .from("salon_messages")
      .select("id", { count: "exact", head: true })
      .eq("a_verifier", true)
      .not("masque", "is", true),
    admin
      .from("messages_quarantaine")
      .select("id", { count: "exact", head: true })
      .eq("statut", "en_attente"),
  ]);

  return {
    aVerifier: (prive.count ?? 0) + (salon.count ?? 0),
    quarantaine: quarantaine.count ?? 0,
    error:
      prive.error?.message ||
      salon.error?.message ||
      quarantaine.error?.message ||
      null,
  };
}

export async function fetchFlaggedMessages() {
  const admin = createServiceClient();

  const [priveRes, salonRes] = await Promise.all([
    admin
      .from("messages")
      .select(
        "id, auteur_id, contenu, trust_categorie, trust_score, created_at, conversation_id, masque, a_verifier",
      )
      .eq("a_verifier", true)
      .not("masque", "is", true)
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("salon_messages")
      .select(
        "id, auteur_id, contenu, trust_categorie, trust_score, created_at, salon_id, masque, a_verifier",
      )
      .eq("a_verifier", true)
      .not("masque", "is", true)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const error = priveRes.error?.message || salonRes.error?.message || null;
  const prive = ((priveRes.data ?? []) as MessageRow[]).filter(isFlagged);
  const salon = ((salonRes.data ?? []) as MessageRow[]).filter(isFlagged);

  const profiles = await loadProfiles(admin, [
    ...prive.map((row) => row.auteur_id),
    ...salon.map((row) => row.auteur_id),
  ]);

  const convAuthor: Record<string, string> = {};
  for (const row of prive) {
    if (row.conversation_id) {
      convAuthor[row.conversation_id] = row.auteur_id;
    }
  }

  const [lieuxConv, lieuxSalon] = await Promise.all([
    conversationLabels(
      admin,
      prive.map((row) => row.conversation_id ?? ""),
      convAuthor,
      profiles,
    ),
    salonLabels(
      admin,
      salon.map((row) => row.salon_id ?? ""),
    ),
  ]);

  const flagged: FlaggedMessage[] = [
    ...prive.map((row) => {
      const profile = profiles[row.auteur_id];
      return {
        id: row.id,
        source: "prive" as const,
        auteurId: row.auteur_id,
        pseudo: profile?.pseudo ?? "QUTE",
        photoUrl: profile?.photo_url ?? null,
        extrait: excerpt(row.contenu, 50),
        contenu: row.contenu,
        categorie: row.trust_categorie,
        score: row.trust_score ?? 0,
        createdAt: row.created_at,
        conversationId: row.conversation_id ?? null,
        salonId: null,
        lieu: row.conversation_id
          ? (lieuxConv[row.conversation_id] ?? "Chat privé")
          : "Chat privé",
      };
    }),
    ...salon.map((row) => {
      const profile = profiles[row.auteur_id];
      return {
        id: row.id,
        source: "salon" as const,
        auteurId: row.auteur_id,
        pseudo: profile?.pseudo ?? "QUTE",
        photoUrl: profile?.photo_url ?? null,
        extrait: excerpt(row.contenu, 50),
        contenu: row.contenu,
        categorie: row.trust_categorie,
        score: row.trust_score ?? 0,
        createdAt: row.created_at,
        conversationId: null,
        salonId: row.salon_id ?? null,
        lieu: row.salon_id ? (lieuxSalon[row.salon_id] ?? "Salon") : "Salon",
      };
    }),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return { flagged, error };
}

export async function fetchQuarantineItems() {
  const admin = createServiceClient();

  const { data, error } = await admin
    .from("messages_quarantaine")
    .select(
      "id, auteur_id, contenu, trust_categorie, trust_score, created_at, conversation_id, salon_id",
    )
    .eq("statut", "en_attente")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as QuarantineRow[];
  const profiles = await loadProfiles(
    admin,
    rows.map((row) => row.auteur_id),
  );

  const convAuthor: Record<string, string> = {};
  for (const row of rows) {
    if (row.conversation_id) {
      convAuthor[row.conversation_id] = row.auteur_id;
    }
  }

  const [lieuxConv, lieuxSalon] = await Promise.all([
    conversationLabels(
      admin,
      rows.map((row) => row.conversation_id ?? ""),
      convAuthor,
      profiles,
    ),
    salonLabels(
      admin,
      rows.map((row) => row.salon_id ?? ""),
    ),
  ]);

  const quarantaine: QuarantineItem[] = rows.map((row) => {
    const profile = profiles[row.auteur_id];
    const lieu = row.salon_id
      ? (lieuxSalon[row.salon_id] ?? "Salon")
      : row.conversation_id
        ? (lieuxConv[row.conversation_id] ?? "Chat privé")
        : "Message";

    return {
      id: row.id,
      auteurId: row.auteur_id,
      pseudo: profile?.pseudo ?? "QUTE",
      photoUrl: profile?.photo_url ?? null,
      extrait: excerpt(row.contenu, 100),
      contenu: row.contenu,
      categorie: row.trust_categorie,
      score: row.trust_score ?? 0,
      createdAt: row.created_at,
      conversationId: row.conversation_id,
      salonId: row.salon_id,
      lieu,
    };
  });

  return { quarantaine, error: error?.message ?? null };
}
