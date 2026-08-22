"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/types";

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="bell-icon"
      width={22}
      height={22}
      aria-hidden
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

function formatNotifDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [isSheet, setIsSheet] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 56, right: 16 });

  const unreadCount = items.filter((item) => !item.lu).length;

  const visible = useMemo(() => {
    const unread = items.filter((item) => !item.lu);
    const read = items.filter((item) => item.lu).slice(0, 20);
    return [...unread, ...read].slice(0, 20);
  }, [items]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    function sync() {
      setIsSheet(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open || isSheet || !bellRef.current) {
      return;
    }

    const rect = bellRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, [open, isSheet]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(40);

      setItems((data ?? []) as AppNotification[]);
    }

    void load();
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setItems((current) => [payload.new as AppNotification, ...current]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as AppNotification;
          setItems((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const removed = payload.old as { id?: string };
          if (!removed.id) {
            return;
          }
          setItems((current) => current.filter((item) => item.id !== removed.id));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function markRead(notification: AppNotification) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ lu: true })
      .eq("id", notification.id);

    setItems((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, lu: true } : item,
      ),
    );

    if (notification.lien) {
      setOpen(false);
      router.push(notification.lien);
    }
  }

  async function markAllRead() {
    if (!userId) {
      return;
    }

    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ lu: true })
      .eq("user_id", userId)
      .eq("lu", false);

    setItems((current) => current.map((item) => ({ ...item, lu: true })));
  }

  function markLeaving(ids: string[]) {
    setLeaving((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function removeItems(ids: string[]) {
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => !ids.includes(item.id)));
      setLeaving((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, 200);
  }

  async function deleteOne(event: MouseEvent<HTMLButtonElement>, notificationId: string) {
    event.stopPropagation();
    markLeaving([notificationId]);

    try {
      const response = await fetch("/api/notifications/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (!response.ok) {
        console.error("[notifications/delete]", response.status);
        setLeaving((current) => {
          const next = new Set(current);
          next.delete(notificationId);
          return next;
        });
        return;
      }

      removeItems([notificationId]);
    } catch (error) {
      console.error("[notifications/delete]", error);
      setLeaving((current) => {
        const next = new Set(current);
        next.delete(notificationId);
        return next;
      });
    }
  }

  async function deleteAll() {
    const ids = items.map((item) => item.id);
    markLeaving(ids);

    try {
      const response = await fetch("/api/notifications/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      if (!response.ok) {
        console.error("[notifications/delete-all]", response.status);
        setLeaving(new Set());
        setConfirmClear(false);
        return;
      }

      setConfirmClear(false);
      removeItems(ids);
    } catch (error) {
      console.error("[notifications/delete-all]", error);
      setLeaving(new Set());
      setConfirmClear(false);
    }
  }

  const panel =
    open && mounted
      ? createPortal(
          <div
            className={`fixed inset-0 z-[60] ${
              isSheet ? "flex items-end" : ""
            }`}
          >
            <button
              type="button"
              aria-label="Fermer les notifications"
              className="absolute inset-0 bg-black/70"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="notif-modal-title"
              className={`relative z-10 ${isSheet ? "notif-sheet" : "notif-dropdown"}`}
              style={
                isSheet
                  ? undefined
                  : { top: dropdownPos.top, right: dropdownPos.right }
              }
            >
              {isSheet ? <div className="notif-grab" /> : null}
              <div className="modal-header bg-[#111111]">
                <div className="flex items-center justify-between px-4 py-2">
                  <p
                    id="notif-modal-title"
                    className="text-[15px] font-bold text-white"
                  >
                    Notifications
                  </p>
                  <button
                    type="button"
                    aria-label="Fermer"
                    onClick={() => setOpen(false)}
                    className="flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center text-xl text-[#CCCCCC] hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                {items.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pb-3">
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => void markAllRead()}
                        className="text-sm font-bold text-[#FF2D87]"
                      >
                        Tout marquer comme lu
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className="text-sm font-bold text-[#FF4444]"
                    >
                      Tout supprimer
                    </button>
                  </div>
                ) : null}
                {confirmClear ? (
                  <div className="px-5 pb-3">
                    <p className="text-sm text-[#CCCCCC]">
                      Supprimer toutes les notifications ?
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void deleteAll()}
                        className="rounded-[10px] bg-[#FF4444] px-3 py-2 text-sm font-bold text-white"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClear(false)}
                        className="rounded-[10px] border border-[#1E1E1E] px-3 py-2 text-sm font-bold text-white"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              {visible.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-[#888888]">
                  Aucune notification pour le moment.
                </p>
              ) : (
                <ul>
                  {visible.map((item) => (
                    <li
                      key={item.id}
                      className={`notif-row flex items-stretch border-t border-white/5 ${
                        leaving.has(item.id) ? "is-leaving" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void markRead(item)}
                        className={`min-w-0 flex-1 px-5 py-4 text-left ${
                          item.lu
                            ? "opacity-65"
                            : "border-l-[3px] border-[#FF2D87] bg-[rgba(255,45,135,0.06)]"
                        }`}
                      >
                        <p className="text-[15px] font-bold text-white">
                          {item.titre}
                        </p>
                        {item.contenu ? (
                          <p className="mt-1 text-sm text-[#888888]">
                            {item.contenu}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-[#666666]">
                          {formatNotifDate(item.created_at)}
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label="Supprimer la notification"
                        onClick={(event) => void deleteOne(event, item.id)}
                        className="notif-delete-hit flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center self-center"
                      >
                        <span className="notif-delete" aria-hidden>
                          ✕
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={bellRef}
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-8 w-8 items-center justify-center text-white"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF2D87] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>
      {panel}
    </>
  );
}
