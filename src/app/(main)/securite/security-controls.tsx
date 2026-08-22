"use client";

import { useState } from "react";

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
      <section className="rounded-[16px] border border-[#1E1E1E] bg-[#111111]">
        <h2 className="px-4 pt-4 text-sm font-bold text-white">
          Visibilité du profil
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked={visible}
          onClick={() => setVisible((value) => !value)}
          className="flex h-[52px] w-full items-center justify-between px-4"
        >
          <span className="text-sm text-[#CCCCCC]">Profil visible</span>
          <span className="font-bold text-white">
            {visible ? "Oui" : "Non"}
          </span>
        </button>
      </section>

      <section className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4">
        <h2 className="text-sm font-bold text-white">Supprimer mon compte</h2>
        <p className="mt-2 text-sm text-[#888888]">
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
          <p className="mt-3 text-sm text-[#888888]">{message}</p>
        ) : null}
      </section>
    </>
  );
}
