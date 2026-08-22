"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EventModerationActionsProps = {
  evenementId: string;
};

export function EventModerationActions({
  evenementId,
}: EventModerationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatut(action: "publier" | "refuser") {
    setLoading(action);
    setError(null);

    try {
      const response = await fetch("/api/admin/evenements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evenementId, action }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Action impossible.");
        setLoading(null);
        return;
      }

      setLoading(null);
      router.refresh();
    } catch {
      setError("Action impossible.");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("publier")}
          className="h-11 w-full rounded-[12px] bg-[#22C55E] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
        >
          Publier
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("refuser")}
          className="h-11 w-full rounded-[12px] bg-[#FF4444] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
        >
          Refuser
        </button>
      </div>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
