type LogoProps = {
  className?: string;
};

export function Logo({ className = "text-3xl" }: LogoProps) {
  return (
    <p className={`font-bold tracking-widest text-white ${className}`}>QUTE</p>
  );
}
