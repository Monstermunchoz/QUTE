"use client";

import { useEffect } from "react";

type ShopModalProps = {
  open: boolean;
  onClose: () => void;
  club?: boolean;
};

export function ShopModal({ open, onClose, club = false }: ShopModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-modal-title"
        className="shop-modal-shell relative overflow-visible rounded-[16px] border border-[#1E1E1E] bg-[#111111] px-8 pb-8 pt-12"
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-xl text-[#888888] hover:text-white"
        >
          ✕
        </button>
        <div className="flex flex-col items-center overflow-visible text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt=""
            height={48}
            className="logo-icon-shop"
          />
          <h2
            id="shop-modal-title"
            className="mt-5 text-2xl font-bold text-white"
          >
            En cours de construction
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#888888]">
            Le QUTE Shop arrive bientôt. Vêtements et accessoires queer, livrés
            partout en France.
            {club
              ? " Ta remise Club de 10% s'appliquera automatiquement."
              : ""}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-sm font-bold text-white"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
