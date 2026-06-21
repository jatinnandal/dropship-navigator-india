import Link from "next/link";

type AppLogoProps = {
  href?: string;
  subtitle?: string;
};

export function AppLogo({ href = "/", subtitle }: AppLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 group">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-md border border-amber-300/40 bg-slate-900/75">
        <span className="absolute h-3 w-3 -translate-x-1.5 -translate-y-1.5 rounded-sm bg-amber-300" />
        <span className="absolute h-3 w-3 translate-x-1.5 translate-y-1.5 rounded-sm bg-cyan-300" />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-wide text-slate-100 transition-colors group-hover:text-amber-100">
          Dropship Navigator India
        </span>
        {subtitle ? <span className="text-xs text-muted">{subtitle}</span> : null}
      </span>
    </Link>
  );
}
