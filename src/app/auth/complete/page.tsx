import { Suspense } from "react";
import AuthCompleteClient from "@/app/auth/complete/page-client";

export default function AuthCompletePage() {
  return (
    <main className="app-shell-bg min-h-screen px-6 py-12 text-slate-100">
      <div className="glass-panel mx-auto max-w-xl rounded-xl p-8">
        <Suspense fallback={<p className="text-sm text-cyan-200">Verifying sign-in link...</p>}>
          <AuthCompleteClient />
        </Suspense>
      </div>
    </main>
  );
}
