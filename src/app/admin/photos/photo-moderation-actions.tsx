"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PhotoModerationActionsProps = {
  kind: "avatar" | "album";
  profileId: string;
  photoId?: string;
};

export function PhotoModerationActions({
  kind,
  profileId,
  photoId,
}: PhotoModerationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function moderate(action: "approuver" | "rejeter") {
    setLoading(action);
    setError(null);

    try {
      const response = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, profileId, photoId, action }),
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
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void moderate("approuver")}
          className="h-[52px] w-full rounded-[12px] bg-[#22C55E] px-4 text-base font-bold text-white disabled:opacity-50"
        >
          Approuver
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void moderate("rejeter")}
          className="h-[52px] w-full rounded-[12px] bg-[#FF4444] px-4 text-base font-bold text-white disabled:opacity-50"
        >
          Rejeter
        </button>
      </div>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
