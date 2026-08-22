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
  abonnement?: string | null;
  role?: string | null;
};

export function AvatarUpload({
  userId,
  pseudo,
  photoUrl,
  photoStatus,
  abonnement,
  role,
}: AvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pending = photoStatus === "pending";

  function openPicker() {
    inputRef.current?.click();
  }

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
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={openPicker}
        disabled={loading}
        className="group relative"
        aria-label="Modifier la photo de profil"
      >
        <Avatar
          pseudo={pseudo}
          photoUrl={photoUrl}
          size="xl"
          abonnement={abonnement}
          role={role}
        />
        <span className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8z" />
            <circle cx="12" cy="13" r="3.2" />
          </svg>
          <span className="mt-1 text-xs font-bold text-white">Modifier</span>
        </span>
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
      <button
        type="button"
        onClick={openPicker}
        disabled={loading}
        className="rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Changer ma photo de profil"}
      </button>
      <p className="text-sm text-[#888888]">
        JPG, PNG ou WEBP — 5 Mo maximum
      </p>
      {message ? <p className="text-sm text-[#FF2D87]">{message}</p> : null}
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
