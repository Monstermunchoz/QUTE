"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PhotoModerationActionsProps = {
  profileId: string;
};

export function PhotoModerationActions({
  profileId,
}: PhotoModerationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setLoading("approved");
    setError(null);

    const supabase = createClient();
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(`${profileId}/pending.jpg`, 60 * 60 * 24 * 365);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        photo_status: "approved",
        photo_url: signed?.signedUrl ?? undefined,
      })
      .eq("id", profileId);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  async function reject() {
    setLoading("rejected");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ photo_status: "rejected", photo_url: null })
      .eq("id", profileId);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void approve()}
          className="h-11 w-full rounded-[12px] bg-[#22C55E] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
        >
          Approuver
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void reject()}
          className="h-11 w-full rounded-[12px] bg-[#FF4444] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
        >
          Rejeter
        </button>
      </div>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
