"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

  async function approve() {
    setLoading("approved");
    setError(null);

    const supabase = createClient();

    if (kind === "album" && photoId) {
      const { error: updateError } = await supabase
        .from("photos")
        .update({ statut: "approved" })
        .eq("id", photoId);

      setLoading(null);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.refresh();
      return;
    }

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

    if (kind === "album" && photoId) {
      const { error: updateError } = await supabase
        .from("photos")
        .update({ statut: "rejected" })
        .eq("id", photoId);

      setLoading(null);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.refresh();
      return;
    }

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
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void approve()}
          className="h-[52px] w-full rounded-[12px] bg-[#22C55E] px-4 text-base font-bold text-white disabled:opacity-50"
        >
          Approuver
        </button>
        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() => void reject()}
          className="h-[52px] w-full rounded-[12px] bg-[#FF4444] px-4 text-base font-bold text-white disabled:opacity-50"
        >
          Rejeter
        </button>
      </div>
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
