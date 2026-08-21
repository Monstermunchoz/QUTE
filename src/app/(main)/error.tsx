"use client";

import { Button } from "@/components/ui/Button";

export default function MainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center gap-4 pt-16 text-center">
      <p className="text-white">Une erreur est survenue.</p>
      <p className="text-sm text-[#888888]">Réessaie, ou reviens à l&apos;accueil.</p>
      <Button type="button" label="Réessayer" onClick={() => reset()} />
    </main>
  );
}
