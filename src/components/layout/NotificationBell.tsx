"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [items, setItems] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((item) => !item.lu).length;

  const visible = useMemo(() => {
    const unread = items.filter((item) => !item.lu);
    const read = items.filter((item) => item.lu).slice(0, 20);
    return [...unread, ...read].slice(0, 20);
  }, [items]);

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

    function onClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
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

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
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

      {open ? (
        <>
          <button
            type="button"
            aria-label="Fermer les notifications"
            className="fixed inset-0 z-40 bg-black/60 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="notif-sheet fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-hidden rounded-t-[20px] border border-[#1E1E1E] bg-[#111111] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[500px] sm:w-[380px] sm:rounded-[16px]">
            <div className="flex justify-center pt-3 sm:hidden">
              <span className="h-1 w-10 rounded bg-[#333333]" />
            </div>
            <div className="modal-header flex items-center justify-between bg-[#111111] px-5 py-4">
              <p className="text-[15px] font-bold text-white">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-sm font-bold text-[#FF2D87]"
                >
                  Tout marquer comme lu
                </button>
              ) : null}
            </div>
            {visible.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-[#888888]">
                Aucune notification pour le moment.
              </p>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto sm:max-h-[420px]">
                {visible.map((item) => (
                  <li key={item.id} className="border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => void markRead(item)}
                      className={`w-full px-5 py-4 text-left ${
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
