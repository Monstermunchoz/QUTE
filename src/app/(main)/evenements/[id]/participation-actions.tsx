"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveParticipation } from "@/app/(main)/evenements/actions";
import type { ParticipationStatut } from "@/types";

type ParticipationActionsProps = {
  evenementId: string;
  currentUserId: string;
  initialStatut: ParticipationStatut | null;
  initialCount: number;
};

const ACTIONS: { id: ParticipationStatut; label: string }[] = [
  { id: "interesse", label: "Intéressé·e" },
  { id: "participe", label: "Je participe" },
  { id: "absent", label: "Absent·e" },
];

function isGoing(statut: ParticipationStatut | null) {
  return statut === "interesse" || statut === "participe";
}

export function ParticipationActions({
  evenementId,
  initialStatut,
  initialCount,
}: ParticipationActionsProps) {
  const router = useRouter();
  const [statut, setStatut] = useState(initialStatut);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState<ParticipationStatut | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setParticipation(next: ParticipationStatut) {
    setLoading(next);
    setError(null);

    const result = await saveParticipation(evenementId, next);

    setLoading(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setCount((current) => {
      const was = isGoing(statut);
      const now = isGoing(next);
      if (!was && now) {
        return current + 1;
      }
      if (was && !now) {
        return Math.max(0, current - 1);
      }
      return current;
    });
    setStatut(next);
    window.dispatchEvent(new Event("qute:ce-soir-changed"));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[#888888]">
        {count} participant{count > 1 ? "s" : ""}
      </p>
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
              : active
                ? `${action.label} ✓`
                : action.label}
          </button>
        );
      })}
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
