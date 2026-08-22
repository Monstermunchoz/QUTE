import { redirect } from "next/navigation";
import { CreateSalonForm } from "./create-salon-form";
import { isQutePlus } from "@/lib/abonnement";
import { createClient } from "@/lib/supabase/server";

export default async function CreateSalonPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement")
    .eq("id", user.id)
    .maybeSingle();

  if (!isQutePlus((profile as { abonnement?: string } | null)?.abonnement)) {
    redirect("/abonnement");
  }

  return (
    <main className="flex flex-col gap-4 pb-4">
      <h1 className="text-2xl font-bold text-white">Créer un salon</h1>
      <CreateSalonForm />
    </main>
  );
}
