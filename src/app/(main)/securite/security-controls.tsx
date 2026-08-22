"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";

export function SecurityControls() {
  const [visible, setVisible] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function requestDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setMessage(
      "La suppression de compte arrive bientôt. Écris-nous à bonjour@qute.app.",
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)]">
        <h2 className="px-4 pt-4 text-sm font-bold text-[var(--text)]">
          Visibilité du profil
        </h2>
        <Switch
          label="Profil visible"
          checked={visible}
          onToggle={() => setVisible((value) => !value)}
        />
      </section>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-bold text-[var(--text)]">
          Supprimer mon compte
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Cette action est définitive. Tes données seront effacées.
        </p>
        <button
          type="button"
          onClick={requestDelete}
          className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#FF4444] text-sm font-bold text-white"
        >
          {confirmDelete ? "Confirmer la suppression" : "Supprimer mon compte"}
        </button>
        {message ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">{message}</p>
        ) : null}
      </section>
    </>
  );
}
