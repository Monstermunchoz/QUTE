"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type JoinLeaveButtonProps = {
  groupeId: string;
  isMember: boolean;
};

export function JoinLeaveButton({ groupeId, isMember }: JoinLeaveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(isMember);

  async function toggle() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (joined) {
      const { error: deleteError } = await supabase
        .from("groupe_membres")
        .delete()
        .eq("groupe_id", groupeId)
        .eq("user_id", user.id);

      setLoading(false);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setJoined(false);
      router.refresh();
      return;
    }

    const { error: insertError } = await supabase.from("groupe_membres").insert({
      groupe_id: groupeId,
      user_id: user.id,
      role: "membre",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setJoined(true);
    router.refresh();
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        label={joined ? "Quitter" : "Rejoindre"}
        variant={joined ? "secondary" : "primary"}
        loading={loading}
        onClick={() => void toggle()}
      />
      {error ? <p className="mt-2 text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
