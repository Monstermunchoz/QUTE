"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AlbumPhoto } from "@/types";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

type PhotoAlbumProps = {
  userId: string;
  photos: AlbumPhoto[];
};

function extensionFor(type: string) {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export function PhotoAlbum({ userId, photos }: PhotoAlbumProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slots = Array.from({ length: MAX_PHOTOS }, (_, index) => photos[index] ?? null);

  async function onFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);

    if (photos.length >= MAX_PHOTOS) {
      setError("6 photos maximum.");
      return;
    }

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
    const path = `${userId}/album/${crypto.randomUUID()}.${extensionFor(file.type)}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    const { error: insertError } = await supabase.from("photos").insert({
      user_id: userId,
      url: signed?.signedUrl ?? path,
      ordre: photos.length,
      statut: "approved",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  async function removePhoto(photo: AlbumPhoto) {
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photo.id)
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold text-white">Mon album</h2>
        <p className="mt-1 text-sm text-[#888888]">
          Ajoute jusqu&apos;à 6 photos. Elles seront visibles sur ton profil.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((photo, index) =>
          photo ? (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-[12px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label="Supprimer la photo"
                onClick={() => void removePhoto(photo)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              key={`empty-${index}`}
              type="button"
              aria-label="Ajouter une photo"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-[12px] border border-dashed border-[#333333] text-2xl text-[#888888] disabled:opacity-50"
            >
              +
            </button>
          ),
        )}
      </div>

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

      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </section>
  );
}
