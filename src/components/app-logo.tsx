import Link from "next/link";

type AppLogoProps = {
  href?: string;
  subtitle?: string;
};

export function NavigatorGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1 L14 14 L8 10.5 L2 14 Z" fill="#ffffff" />
    </svg>
  );
}

export function AppLogo({ href = "/", subtitle }: AppLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 group">
      <span className="grid place-items-center h-[30px] w-[30px] rounded-lg border border-white/[0.18] bg-[#0c0c0c] shadow-[0_0_18px_-4px_rgba(255,255,255,0.2)]">
        <NavigatorGlyph />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-[-0.01em] text-white">
          Navigator
        </span>
        {subtitle ? <span className="block text-[11px] text-[var(--text-faintest)]">{subtitle}</span> : null}
      </span>
    </Link>
  );
}
