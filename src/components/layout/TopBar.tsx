import { Logo } from "@/components/ui/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#1E1E1E] bg-[#0A0A0A]">
      <div className="relative mx-auto flex h-14 w-full max-w-lg items-center justify-center px-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.png" alt="" height={28} className="logo-icon-bar" />
          <Logo className="text-lg" />
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
