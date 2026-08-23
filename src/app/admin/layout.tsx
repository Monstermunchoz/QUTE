import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#000000] text-white md:flex-row">
      <AdminNav pseudo={(profile?.pseudo as string) ?? "Staff"} />
      <div className="min-w-0 flex-1 overflow-x-hidden p-5">
        {children}
      </div>
    </div>
  );
}
