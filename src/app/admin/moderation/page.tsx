import { ModerationHub } from "./moderation-hub";
import {
  fetchFlaggedMessages,
  fetchQuarantineItems,
} from "@/lib/admin/moderation-data";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RuleItem = {
  id: string;
  pattern: string;
  categorie: string;
  poids: number;
  actif: boolean;
};

export default async function AdminModerationPage() {
  const admin = createServiceClient();

  const [{ flagged, error: flaggedError }, { quarantaine, error: quarError }, rulesRes] =
    await Promise.all([
      fetchFlaggedMessages(),
      fetchQuarantineItems(),
      admin
        .from("trust_rules")
        .select("id, pattern, categorie, poids, actif, created_at")
        .order("created_at", { ascending: false }),
    ]);

  const rules = (rulesRes.data ?? []) as RuleItem[];
  const error = flaggedError || quarError || rulesRes.error?.message || null;

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-white md:text-2xl">Modération</h1>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
      <ModerationHub
        flagged={flagged}
        quarantaine={quarantaine}
        rules={rules}
      />
    </main>
  );
}
