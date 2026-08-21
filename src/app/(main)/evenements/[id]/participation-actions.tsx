"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ParticipationStatut } from "@/types";

type ParticipationActionsProps = {
  evenementId: string;
  currentUserId: string;
  initialStatut: ParticipationStatut | null;
};

const ACTIONS: { id: ParticipationStatut; label: string }[] = [
  { id: "interesse", label: "Intéressé·e" },
  { id: "participe", label: "Je participe" },
  { id: "absent", label: "Absent·e" },
];

export function ParticipationActions({
  evenementId,
  currentUserId,
  initialStatut,
}: ParticipationActionsProps) {
  const router = useRouter();
  const [statut, setStatut] = useState(initialStatut);
  const [loading, setLoading] = useState<ParticipationStatut | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setParticipation(next: ParticipationStatut) {
    setLoading(next);
    setError(null);

    const supabase = createClient();
    const { error: upsertError } = await supabase.from("participations").upsert(
      {
        evenement_id: evenementId,
        user_id: currentUserId,
        statut: next,
      },
      { onConflict: "evenement_id,user_id" },
    );

    setLoading(null);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setStatut(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {ACTIONS.map((action) => {
        const active = statut === action.id;
        const isParticipate = action.id === "participe";

        return (
          <button
            key={action.id}
            type="button"
            disabled={loading !== null}
            onClick={() => void setParticipation(action.id)}
            className={`flex h-[52px] w-full items-center justify-center rounded-[12px] text-sm font-bold text-white disabled:opacity-50 ${
              isParticipate
                ? ""
                : active
                  ? "border border-[#FF2D87]"
                  : "border border-[#1E1E1E]"
            }`}
            style={
              isParticipate
                ? { background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }
                : undefined
            }
          >
            {loading === action.id
              ? "…"
              : active && !isParticipate
                ? `${action.label} ✓`
                : action.label}
          </button>
        );
      })}
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
