"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EventModerationActionsProps = {
  evenementId: string;
};

export function EventModerationActions({
  evenementId,
}: EventModerationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatut(statut: "publie" | "refuse") {
    setLoading(statut);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("evenements")
      .update({ statut })
      .eq("id", evenementId);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("publie")}
          className="h-10 rounded-[12px] bg-[#22C55E] px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          Publier
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("refuse")}
          className="h-10 rounded-[12px] bg-[#FF4444] px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          Refuser
        </button>
      </div>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
