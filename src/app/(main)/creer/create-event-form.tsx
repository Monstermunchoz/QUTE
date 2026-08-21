"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EVENT_CATEGORIES } from "@/lib/events/categories";
import { createClient } from "@/lib/supabase/client";
import type { EvenementCategorie, Lieu } from "@/types";

type FormValues = {
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  lieu_id: string;
  lieu_nom: string;
  adresse: string;
  categorie: EvenementCategorie | "";
  max_participants: string;
};

const fieldClassName =
  "h-[52px] w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-white outline-none focus:border-[#FF2D87]";

type CreateEventFormProps = {
  lieux: Pick<Lieu, "id" | "nom" | "adresse">[];
};

export function CreateEventForm({ lieux }: CreateEventFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      titre: "",
      description: "",
      date_debut: "",
      date_fin: "",
      lieu_id: "",
      lieu_nom: "",
      adresse: "",
      categorie: "",
      max_participants: "",
    },
  });

  const lieuId = watch("lieu_id");

  async function onSubmit(values: FormValues) {
    setError(null);

    if (!values.titre.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    if (!values.date_debut) {
      setError("La date de début est obligatoire.");
      return;
    }

    const dateDebut = new Date(values.date_debut);
    const dateFin = values.date_fin ? new Date(values.date_fin) : null;

    if (dateFin && dateFin.getTime() <= dateDebut.getTime()) {
      setError("La date de fin doit être après le début.");
      return;
    }

    const selectedLieu = lieux.find((lieu) => lieu.id === values.lieu_id);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const maxParticipants = values.max_participants.trim()
      ? Number(values.max_participants)
      : null;

    const { error: insertError } = await supabase.from("evenements").insert({
      titre: values.titre.trim(),
      description: values.description.trim() || null,
      date_debut: dateDebut.toISOString(),
      date_fin: dateFin ? dateFin.toISOString() : null,
      lieu_id: selectedLieu?.id ?? null,
      lieu_nom: selectedLieu?.nom ?? (values.lieu_nom.trim() || null),
      adresse: selectedLieu?.adresse ?? (values.adresse.trim() || null),
      categorie: values.categorie || null,
      max_participants:
        maxParticipants && Number.isFinite(maxParticipants) && maxParticipants > 0
          ? maxParticipants
          : null,
      createur_id: user.id,
      statut: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4">
        <p className="text-white">
          Ton événement est en attente de validation. On te prévient dès
          qu&apos;il est publié !
        </p>
        <Button
          type="button"
          label="Retour vers l'accueil"
          onClick={() => router.push("/accueil")}
        />
      </div>
    );
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
        label="Titre"
        placeholder="Soirée Queer Techno"
        error={errors.titre?.message}
        register={register("titre", { required: "Le titre est obligatoire." })}
      />
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="description" className="text-[14px] text-[#888888]">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Dis-nous ce qui QUTE…"
          className="w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 py-3 text-white outline-none placeholder:text-[#555555] focus:border-[#FF2D87]"
          {...register("description")}
        />
      </div>
      <Input
        label="Date et heure de début"
        type="datetime-local"
        error={errors.date_debut?.message}
        register={register("date_debut", {
          required: "La date de début est obligatoire.",
        })}
      />
      <Input
        label="Date et heure de fin (optionnel)"
        type="datetime-local"
        register={register("date_fin")}
      />
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="lieu_id" className="text-[14px] text-[#888888]">
          Lieu
        </label>
        <select id="lieu_id" className={fieldClassName} {...register("lieu_id")}>
          <option value="">Saisie libre</option>
          {lieux.map((lieu) => (
            <option key={lieu.id} value={lieu.id}>
              {lieu.nom}
            </option>
          ))}
        </select>
      </div>
      {!lieuId ? (
        <>
          <Input
            label="Nom du lieu"
            placeholder="Le Sucre"
            register={register("lieu_nom")}
          />
          <Input
            label="Adresse (optionnel)"
            placeholder="50 Quai Rambaud, Lyon"
            register={register("adresse")}
          />
        </>
      ) : null}
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="categorie" className="text-[14px] text-[#888888]">
          Catégorie
        </label>
        <select
          id="categorie"
          className={fieldClassName}
          {...register("categorie")}
        >
          <option value="">Choisir</option>
          {EVENT_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Nombre max de participants (optionnel)"
        type="number"
        min={1}
        placeholder="120"
        register={register("max_participants")}
      />
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
      <Button type="submit" label="Créer l'événement" loading={isSubmitting} />
    </form>
  );
}
