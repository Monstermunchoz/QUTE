"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { createClient } from "@/lib/supabase/client";

const THEMES = [
  { id: "general", label: "Général" },
  { id: "sorties", label: "Sorties" },
  { id: "musique", label: "Musique" },
  { id: "identite", label: "Identité" },
  { id: "communaute", label: "Communauté" },
];

type FormValues = {
  nom: string;
  description: string;
  theme: string;
  est_public: boolean;
};

export function CreateSalonForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      nom: "",
      description: "",
      theme: "general",
      est_public: true,
    },
  });

  const estPublic = watch("est_public");

  async function onSubmit(values: FormValues) {
    setError(null);

    if (values.nom.trim().length < 3) {
      setError("Nom : 3 caractères minimum.");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: salon, error: insertError } = await supabase
      .from("salons")
      .insert({
        nom: values.nom.trim().slice(0, 50),
        description: values.description.trim().slice(0, 200) || null,
        theme: values.theme || null,
        est_public: values.est_public,
        createur_id: user.id,
      })
      .select("id")
      .single();

    if (insertError || !salon) {
      setError(insertError?.message ?? "Impossible de créer le salon.");
      return;
    }

    router.push(`/salons/${salon.id}`);
    router.refresh();
  }

  return (
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
        label="Nom"
        maxLength={50}
        placeholder="Les nuits roses"
        error={errors.nom?.message}
        register={register("nom", {
          required: "Le nom est obligatoire.",
          maxLength: { value: 50, message: "50 caractères maximum." },
        })}
      />
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="description" className="text-[14px] text-[#888888]">
          Description
        </label>
        <textarea
          id="description"
          maxLength={200}
          rows={4}
          className="w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 py-3 text-white outline-none placeholder:text-[#555555] focus:border-[#FF2D87]"
          placeholder="De quoi on parle ici…"
          {...register("description", {
            maxLength: { value: 200, message: "200 caractères maximum." },
          })}
        />
      </div>
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="theme" className="text-[14px] text-[#888888]">
          Thème
        </label>
        <select
          id="theme"
          className="h-[52px] w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-white outline-none focus:border-[#FF2D87]"
          {...register("theme")}
        >
          {THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>
      <Switch
        label="Salon public"
        checked={estPublic}
        onToggle={() => setValue("est_public", !estPublic)}
      />
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
      <Button type="submit" label="Créer le salon" loading={isSubmitting} />
    </form>
  );
}
