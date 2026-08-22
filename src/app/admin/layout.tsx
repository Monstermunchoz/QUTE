import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("pseudo, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = typeof profile?.role === "string" ? profile.role.trim() : "";

  if (role !== "admin" && role !== "moderateur") {
    redirect("/accueil");
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#000000] text-white">
      <AdminNav pseudo={(profile?.pseudo as string) ?? "Staff"} />
      <div className="min-w-0 flex-1 overflow-x-hidden px-5 py-6 md:px-8">
        {children}
      </div>
    </div>
  );
}
