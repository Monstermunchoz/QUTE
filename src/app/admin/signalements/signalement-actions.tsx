"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SignalementActionsProps = {
  signalementId: string;
  cibleId: string;
};

export function SignalementActions({
  signalementId,
  cibleId,
}: SignalementActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatut(statut: "traite" | "rejete") {
    setLoading(statut);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("signalements")
      .update({ statut })
      .eq("id", signalementId);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  async function banUser() {
    setLoading("ban");
    setError(null);

    const supabase = createClient();
    const { error: banError } = await supabase
      .from("profiles")
      .update({ compte_verifie: false })
      .eq("id", cibleId);

    if (banError) {
      setLoading(null);
      setError(banError.message);
      return;
    }

    await supabase
      .from("signalements")
      .update({ statut: "traite" })
      .eq("id", signalementId);

    setLoading(null);
    window.alert("Utilisateur banni : compte non vérifié.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("traite")}
          className="h-10 rounded-[12px] bg-[#22C55E] px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          Traiter
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void setStatut("rejete")}
          className="h-10 rounded-[12px] bg-[#FF4444] px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          Rejeter
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void banUser()}
          className="h-10 rounded-[12px] bg-[#FF4444] px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          Bannir l&apos;utilisateur
        </button>
      </div>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
