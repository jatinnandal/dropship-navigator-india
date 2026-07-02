import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-800 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row md:px-10">
        <p className="text-sm text-neutral-500">Dropship Navigator India — vendor-neutral seller co-pilot</p>
        <div className="flex gap-4 text-sm">
          <Link href="/login" className="text-neutral-500 transition hover:text-white">
            Log in
          </Link>
          <Link href="/signup" className="text-neutral-500 transition hover:text-white">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
