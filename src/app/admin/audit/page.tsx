import { AuditLogTable } from "./audit-log-table";
import { createClient } from "@/lib/supabase/server";

type AuditRow = {
  id: string;
  admin_id: string | null;
  action: string;
  cible_type: string | null;
  cible_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export default async function AdminAuditPage() {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("audit_log")
    .select("id, admin_id, action, cible_type, cible_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const entries = (rows ?? []) as AuditRow[];
  const adminIds = Array.from(
    new Set(entries.map((row) => row.admin_id).filter(Boolean) as string[]),
  );

  let adminsById: Record<string, string> = {};

  if (adminIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo")
      .in("id", adminIds);

    adminsById = Object.fromEntries(
      ((profiles ?? []) as { id: string; pseudo: string }[]).map((profile) => [
        profile.id,
        profile.pseudo,
      ]),
    );
  }

  const items = entries.map((row) => ({
    ...row,
    adminPseudo: row.admin_id ? (adminsById[row.admin_id] ?? "Staff") : "—",
  }));

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-white md:text-2xl">Journal</h1>
      <p className="text-[15px] text-[#888888]">
        Historique immuable des actions de modération.
      </p>
      <AuditLogTable items={items} />
    </main>
  );
}
