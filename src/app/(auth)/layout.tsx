import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[#1E1E1E] bg-[#0A0A0A]">
        <div className="relative mx-auto flex h-full w-full max-w-lg items-center justify-center px-4">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl leading-none text-white"
          >
            ←
          </Link>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt=""
              height={26}
              className="logo-icon-nav"
            />
            <p className="font-bold tracking-[0.15em] text-white">QUTE</p>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-10 pt-24">
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt="QUTE"
            height={72}
            className="logo-icon-auth"
          />
        </div>
        <div className="w-full max-w-md rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
