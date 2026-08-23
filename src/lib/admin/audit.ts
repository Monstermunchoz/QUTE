import type { createServiceClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "bannir"
  | "supprimer"
  | "approuver_photo"
  | "rejeter_photo"
  | "publier_evenement"
  | "refuser_evenement"
  | "traiter_signalement"
  | "innocenter_message"
  | "masquer_message"
  | "supprimer_message"
  | "quarantaine_innocenter"
  | "quarantaine_supprimer"
  | "trust_regle";

export type AuditCible =
  | "profil"
  | "message"
  | "photo"
  | "evenement"
  | "salon"
  | "signalement";

export async function logAdminAction(
  admin: ReturnType<typeof createServiceClient>,
  input: {
    adminId: string;
    action: AuditAction;
    cibleType: AuditCible;
    cibleId?: string | null;
    details?: Record<string, unknown>;
  },
) {
  const { error } = await admin.from("audit_log").insert({
    admin_id: input.adminId,
    action: input.action,
    cible_type: input.cibleType,
    cible_id: input.cibleId ?? null,
    details: input.details ?? {},
  });

  if (error) {
    console.error("[audit_log]", error);
  }
}
