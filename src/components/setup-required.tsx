import Link from "next/link";

export function SetupRequired() {
  return (
    <main className="app-shell-bg min-h-screen px-6 py-10 text-slate-100">
      <div className="glass-panel mx-auto w-full max-w-3xl rounded-xl border-amber-500/30 p-8">
        <h1 className="text-2xl font-bold text-amber-200">Supabase setup required</h1>
        <p className="mt-3 text-sm leading-6 text-amber-100/90">
          Authentication and per-user journey persistence are enabled in the code, but this
          environment still needs Supabase keys.
        </p>
        <ol className="mt-5 list-decimal space-y-2 pl-6 text-sm text-amber-50/90">
          <li>Create a Supabase project and copy URL + anon key.</li>
          <li>Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.</li>
          <li>Run SQL from `supabase/schema.sql` in Supabase SQL editor.</li>
          <li>Restart `npm run dev` and sign in from `/login`.</li>
        </ol>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-md border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/20"
          >
            Back to landing
          </Link>
        </div>
      </div>
    </main>
  );
}
