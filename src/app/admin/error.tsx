"use client";

import { Button } from "@/components/ui/Button";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center gap-4 pt-8 text-center">
      <p className="text-white">Une erreur est survenue.</p>
      <Button type="button" label="Réessayer" onClick={() => reset()} />
    </main>
  );
}
