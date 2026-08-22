"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

export default function LoginPage() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError("Identifiants incorrects.");
      return;
    }

    window.location.assign("/accueil");
  }

  return (
    <form
      method="post"
      action="/login"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleSubmit(onSubmit)(event);
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white">Connexion</h1>
        <p className="text-sm text-qute-muted">Content de te revoir.</p>
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="toi@email.com"
        autoComplete="email"
        error={errors.email?.message}
        register={register("email")}
      />

      <Input
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        register={register("password")}
      />

      {formError ? <p className="text-sm text-[#FF4444]">{formError}</p> : null}

      <Button type="submit" label="Se connecter" loading={isSubmitting} />

      <p className="text-center text-sm text-qute-muted">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-[#FF2D87] underline underline-offset-4">
          Rejoins QUTE
        </Link>
      </p>
    </form>
  );
}
