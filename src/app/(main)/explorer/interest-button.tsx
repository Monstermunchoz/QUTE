"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ParticipationStatut } from "@/types";

type InterestButtonProps = {
  evenementId: string;
  currentUserId: string;
  initialStatut: ParticipationStatut | null;
};

export function InterestButton({
  evenementId,
  currentUserId,
  initialStatut,
}: InterestButtonProps) {
  const router = useRouter();
  const [statut, setStatut] = useState(initialStatut);
  const [loading, setLoading] = useState(false);

  async function markInterested() {
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("participations").upsert(
      {
        evenement_id: evenementId,
        user_id: currentUserId,
        statut: "interesse",
      },
      { onConflict: "evenement_id,user_id" },
    );

    setLoading(false);

    if (!error) {
      setStatut("interesse");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void markInterested();
      }}
      className="flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-sm font-bold text-white disabled:opacity-50"
    >
      {statut === "interesse" || statut === "participe"
        ? "Intéressé·e ✓"
        : "Je suis intéressé·e"}
    </button>
  );
}
