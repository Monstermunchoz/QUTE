"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

type AvatarUploadProps = {
  userId: string;
  pseudo: string;
  photoUrl: string | null;
  photoStatus: string;
};

export function AvatarUpload({
  userId,
  pseudo,
  photoUrl,
  photoStatus,
}: AvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const displayUrl = photoUrl;
  const pending = photoStatus === "pending";

  async function onFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);
    setMessage(null);

    if (!ALLOWED.includes(file.type)) {
      setError("Formats acceptés : jpg, png, webp.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("5 Mo maximum.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const path = `${userId}/pending.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        photo_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(
      "Photo envoyée ! En attente de validation par l'équipe QUTE.",
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="relative"
        aria-label="Changer la photo de profil"
      >
        <Avatar pseudo={pseudo} photoUrl={displayUrl} size="lg" />
        {pending ? (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-[10px] font-bold text-[#FF2D87]">
            ⏳ En attente
          </span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onFile(file);
        }}
      />
      {message ? <p className="text-sm text-[#FF2D87]">{message}</p> : null}
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
