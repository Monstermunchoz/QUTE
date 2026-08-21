export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4 py-10">
      <div className="mb-8 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-full.jpg"
          alt="QUTE"
          height={80}
          className="logo-full-auth"
        />
      </div>
      <div className="w-full max-w-md rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-8">
        {children}
      </div>
    </div>
  );
}
