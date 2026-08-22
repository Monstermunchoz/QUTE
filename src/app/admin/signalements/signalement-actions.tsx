"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SignalementActionsProps = {
  signalementId: string;
  cibleId: string;
  ciblePseudo: string;
};

export function SignalementActions({
  signalementId,
  cibleId,
  ciblePseudo,
}: SignalementActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatut(action: "traiter" | "rejeter") {
    setLoading(action);
    setError(null);

    try {
      const response = await fetch("/api/admin/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalementId, action }),
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

  async function banUser() {
    if (
      !window.confirm(
        `Bannir et supprimer le compte de ${ciblePseudo} ? L'adresse email sera bloquée.`,
      )
    ) {
      return;
    }

    setLoading("ban");
    setError(null);

    try {
      const response = await fetch("/api/admin/bannir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: cibleId }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Bannissement impossible.");
        setLoading(null);
        return;
      }

      setLoading(null);
      router.refresh();
    } catch {
      setError("Bannissement impossible.");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("traiter")}
          className="h-11 w-full rounded-[12px] bg-[#22C55E] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
        >
          Traiter
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("rejeter")}
          className="h-11 w-full rounded-[12px] bg-[#FF4444] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
        >
          Rejeter
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void banUser()}
          className="h-11 w-full rounded-[12px] bg-[#FF4444] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
        >
          Bannir {ciblePseudo}
        </button>
      </div>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
