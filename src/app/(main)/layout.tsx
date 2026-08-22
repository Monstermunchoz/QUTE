import { Suspense } from "react";
import { BottomBar } from "@/components/layout/BottomBar";
import { TopBar } from "@/components/layout/TopBar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#000000]">
      <TopBar />
      <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-16">{children}</div>
      <Suspense fallback={null}>
        <BottomBar />
      </Suspense>
    </div>
  );
}
