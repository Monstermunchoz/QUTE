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
      <div className="mx-auto w-full max-w-[900px] overflow-x-hidden px-5 pb-[calc(100px+env(safe-area-inset-bottom))] pt-[calc(88px+env(safe-area-inset-top))] md:px-8">
        {children}
      </div>
      <Suspense fallback={null}>
        <BottomBar />
      </Suspense>
    </div>
  );
}
