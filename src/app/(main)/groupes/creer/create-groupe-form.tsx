"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { createClient } from "@/lib/supabase/client";

type FormValues = {
  nom: string;
  description: string;
  est_prive: boolean;
};

export function CreateGroupeForm() {
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
      est_prive: false,
    },
  });

  const estPrive = watch("est_prive");

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

    const { data: groupe, error: insertError } = await supabase
      .from("groupes")
      .insert({
        nom: values.nom.trim(),
        description: values.description.trim() || null,
        createur_id: user.id,
        est_prive: values.est_prive,
      })
      .select("id")
      .single();

    if (insertError || !groupe) {
      setError(insertError?.message ?? "Impossible de créer le groupe.");
      return;
    }

    const { error: memberError } = await supabase.from("groupe_membres").insert({
      groupe_id: groupe.id,
      user_id: user.id,
      role: "admin",
    });

    if (memberError) {
      setError(memberError.message);
      return;
    }

    router.push(`/groupes/${groupe.id}`);
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
        placeholder="Les nuits roses"
        error={errors.nom?.message}
        register={register("nom", {
          required: "Le nom est obligatoire.",
          minLength: { value: 3, message: "Nom : 3 caractères minimum." },
        })}
      />
      <Input
        label="Description"
        placeholder="Qui on est, ce qu'on fait…"
        register={register("description")}
      />
      <Switch
        label="Groupe privé"
        checked={estPrive}
        onToggle={() => setValue("est_prive", !estPrive)}
      />
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
      <Button type="submit" label="Créer le groupe" loading={isSubmitting} />
    </form>
  );
}
