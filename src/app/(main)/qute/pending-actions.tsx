"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type PendingActionsProps = {
  conversationId: string;
};

export function PendingActions({ conversationId }: PendingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"acceptee" | "ignoree" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatut(statut: "acceptee" | "ignoree") {
    setLoading(statut);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ statut })
      .eq("id", conversationId);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (statut === "acceptee") {
      router.push(`/qute/${conversationId}`);
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        label="Accepter"
        loading={loading === "acceptee"}
        onClick={() => void updateStatut("acceptee")}
      />
      <Button
        type="button"
        label="Ignorer"
        variant="secondary"
        loading={loading === "ignoree"}
        onClick={() => void updateStatut("ignoree")}
      />
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
