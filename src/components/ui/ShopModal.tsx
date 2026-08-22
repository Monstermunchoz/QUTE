"use client";

import { useEffect } from "react";

type ShopModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ShopModal({ open, onClose }: ShopModalProps) {
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
        className="modal-shell relative rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-10"
      >
        <div className="modal-header -mx-10 -mt-10 mb-2 flex justify-end bg-[#111111] px-4 py-3">
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="text-xl text-[#888888] hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt=""
            height={56}
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
