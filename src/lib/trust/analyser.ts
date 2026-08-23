import { createServiceClient } from "@/lib/supabase/admin";

export type AnalyseResult = {
  score: number;
  categorie: string | null;
  action: "autoriser" | "verifier" | "bloquer";
};

export async function analyserMessage(contenu: string): Promise<AnalyseResult> {
  const admin = createServiceClient();

  const { data: regles } = await admin
    .from("trust_rules")
    .select("pattern, categorie, poids")
    .eq("actif", true);

  if (!regles || regles.length === 0) {
    return { score: 0, categorie: null, action: "autoriser" };
  }

  let scoreTotal = 0;
  let categorieDetectee: string | null = null;
  const contenuLower = contenu.toLowerCase();

  for (const regle of regles) {
    const pattern = typeof regle.pattern === "string" ? regle.pattern : "";
    const poids = typeof regle.poids === "number" ? regle.poids : 0;
    const categorie =
      typeof regle.categorie === "string" ? regle.categorie : null;

    if (!pattern) {
      continue;
    }

    try {
      const regex = new RegExp(pattern, "i");
      if (regex.test(contenuLower)) {
        scoreTotal += poids;
        if (!categorieDetectee) {
          categorieDetectee = categorie;
        }
      }
    } catch {
      // Pattern invalide, ignoré
    }
  }

  let action: AnalyseResult["action"] = "autoriser";
  if (scoreTotal >= 4) {
    action = "bloquer";
  } else if (scoreTotal >= 2) {
    action = "verifier";
  }

  return { score: scoreTotal, categorie: categorieDetectee, action };
}

export async function notifierAdminsQuarantaine(score: number) {
  const admin = createServiceClient();
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  const ids = (admins ?? [])
    .map((row) => row.id as string)
    .filter(Boolean);

  if (ids.length === 0) {
    return;
  }

  await admin.from("notifications").insert(
    ids.map((userId) => ({
      user_id: userId,
      type: "systeme",
      titre: "Message bloqué",
      contenu: `Un message a été mis en quarantaine (score ${score})`,
      lien: "/admin/moderation",
    })),
  );
}
