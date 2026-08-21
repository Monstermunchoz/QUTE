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
      className="icon"
      width={20}
      height={20}
      aria-hidden
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
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
    function onClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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
    <div className="absolute right-4" ref={panelRef}>
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
        <div className="absolute right-0 z-50 mt-2 w-[min(90vw,320px)] rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-white">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-bold text-[#FF2D87]"
              >
                Tout marquer comme lu
              </button>
            ) : null}
          </div>
          {visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#888888]">
              Rien pour l&apos;instant.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void markRead(item)}
                    className={`w-full rounded-[12px] px-3 py-3 text-left ${
                      item.lu ? "opacity-60" : "border-l-[3px] border-[#FF2D87]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">{item.titre}</p>
                    {item.contenu ? (
                      <p className="mt-1 text-xs text-[#888888]">{item.contenu}</p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
