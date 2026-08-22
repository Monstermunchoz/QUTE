"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LieuLikeButtonProps = {
  lieuId: string;
  initialCount: number;
  initialLiked: boolean;
};

export function LieuLikeButton({
  lieuId,
  initialCount,
  initialLiked,
}: LieuLikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) {
      return;
    }

    const nextLiked = !liked;
    const previousCount = count;
    const previousLiked = liked;

    setLiked(nextLiked);
    setCount((current) =>
      nextLiked ? current + 1 : Math.max(0, current - 1),
    );
    setPending(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLiked(previousLiked);
      setCount(previousCount);
      setPending(false);
      return;
    }

    const { error } = nextLiked
      ? await supabase.from("likes_lieux").insert({
          lieu_id: lieuId,
          user_id: user.id,
        })
      : await supabase
          .from("likes_lieux")
          .delete()
          .eq("lieu_id", lieuId)
          .eq("user_id", user.id);

    if (error && !error.message.toLowerCase().includes("duplicate")) {
      setLiked(previousLiked);
      setCount(previousCount);
    }

    setPending(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[#888888]">
        ❤️ {count} personnes aiment ce lieu
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => void toggle()}
        className="flex h-[52px] w-full items-center justify-center rounded-[12px] text-sm font-bold disabled:opacity-50"
        style={
          liked
            ? { background: "#FF2D87", color: "#FFFFFF", border: "none" }
            : {
                background: "transparent",
                color: "#FF2D87",
                border: "1px solid #FF2D87",
              }
        }
      >
        {liked ? "❤️ J'aime" : "J'aime ce lieu ❤️"}
      </button>
    </div>
  );
}
