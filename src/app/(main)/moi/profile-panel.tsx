"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AvatarUpload } from "./avatar-upload";
import { PhotoAlbum } from "./photo-album";
import { JeSorsBlock } from "./je-sors-block";
import { createClient } from "@/lib/supabase/client";
import type { AlbumPhoto, JeSors, Profile } from "@/types";

type FormValues = {
  pseudo: string;
  bio: string;
  ville: string;
  age_visible: boolean;
  ce_que_je_cherche: string;
};

type ProfilePanelProps = {
  profile: Profile;
  qrushCount: number;
  matchCount: number;
  jeSors: JeSors | null;
  photos: AlbumPhoto[];
};

export function ProfilePanel({
  profile,
  qrushCount,
  matchCount,
  jeSors,
  photos,
}: ProfilePanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      pseudo: profile.pseudo ?? "",
      bio: profile.bio ?? "",
      ville: profile.ville ?? "",
      age_visible: Boolean(profile.age_visible),
      ce_que_je_cherche: profile.ce_que_je_cherche ?? "",
    },
  });

  const ageVisible = watch("age_visible");
  const bio = watch("bio");
  const location = [profile.ville, profile.zone].filter(Boolean).join(" · ");

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setSuccess(null);

    if (values.pseudo.trim().length < 3) {
      setFormError("Pseudo : 3 caractères minimum.");
      return;
    }

    if (values.bio.length > 300) {
      setFormError("Bio : 300 caractères maximum.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        pseudo: values.pseudo.trim(),
        bio: values.bio.trim() || null,
        ville: values.ville.trim() || null,
        age_visible: values.age_visible,
        ce_que_je_cherche: values.ce_que_je_cherche.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      setFormError(error.message);
      return;
    }

    setSuccess("Profil mis à jour. T'es prêt·e à faire des ravages.");
    setEditing(false);
    router.refresh();
  }

  return (
    <main className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <AvatarUpload
          userId={profile.id}
          pseudo={profile.pseudo}
          photoUrl={profile.photo_url}
          photoStatus={profile.photo_status}
        />
        <h1 className="text-2xl font-bold text-white">{profile.pseudo}</h1>
        <p className="text-[#888888]">{location || "Lyon Métropole"}</p>
        <p className="text-sm text-[#888888]">
          {qrushCount} QRUSH{qrushCount === 1 ? "" : "s"} reçu
          {qrushCount === 1 ? "" : "s"} · {matchCount} match
          {matchCount === 1 ? "" : "s"}
        </p>
      </div>

      <PhotoAlbum userId={profile.id} photos={photos} />

      <JeSorsBlock current={jeSors} />

      {!editing ? (
        <Button
          type="button"
          label="Modifier mon profil"
          onClick={() => {
            setSuccess(null);
            setEditing(true);
          }}
        />
      ) : (
        <form
          method="post"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void handleSubmit(onSubmit)(event);
          }}
          className="flex flex-col gap-4 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
        >
          <Input
            label="Pseudo"
            error={errors.pseudo?.message}
            register={register("pseudo", {
              required: "Le pseudo est obligatoire.",
              minLength: { value: 3, message: "Pseudo : 3 caractères minimum." },
            })}
          />

          <div className="flex w-full flex-col gap-2">
            <label htmlFor="bio" className="text-[14px] text-[#888888]">
              Bio
            </label>
            <textarea
              id="bio"
              maxLength={300}
              rows={4}
              className="w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 py-3 text-white outline-none placeholder:text-[#555555] focus:border-[#FF2D87]"
              {...register("bio")}
            />
            <p className="text-right text-xs text-[#888888]">
              {bio?.length ?? 0}/300
            </p>
          </div>

          <Input label="Ville" register={register("ville")} />

          <button
            type="button"
            role="switch"
            aria-checked={ageVisible}
            onClick={() => setValue("age_visible", !ageVisible)}
            className="flex h-[52px] items-center justify-between rounded-[12px] border border-[#1E1E1E] bg-[#111111] px-4"
          >
            <span className="text-[14px] text-[#888888]">Âge visible</span>
            <span className="font-bold text-white">
              {ageVisible ? "Oui" : "Non"}
            </span>
          </button>

          <Input
            label="Ce que je cherche"
            placeholder="Rencontres, soirées, amitiés…"
            register={register("ce_que_je_cherche")}
          />

          {formError ? (
            <p className="text-sm text-[#FF4444]">{formError}</p>
          ) : null}

          <Button type="submit" label="Enregistrer" loading={isSubmitting} />
          <Button
            type="button"
            label="Annuler"
            variant="ghost"
            onClick={() => setEditing(false)}
          />
        </form>
      )}

      {success ? (
        <p className="text-center text-sm text-[#FF2D87]">{success}</p>
      ) : null}
    </main>
  );
}
