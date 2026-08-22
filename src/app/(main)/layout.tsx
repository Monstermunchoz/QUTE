import { Suspense } from "react";
import { BottomBar } from "@/components/layout/BottomBar";
import { TopBar } from "@/components/layout/TopBar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <TopBar />
      <div className="mx-auto w-full max-w-lg px-5 pb-[100px] pt-[88px] md:px-8">
        {children}
      </div>
      <Suspense fallback={null}>
        <BottomBar />
      </Suspense>
    </div>
  );
}
