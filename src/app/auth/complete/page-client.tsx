"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const OTP_FALLBACK_TYPES: EmailOtpType[] = [
  "magiclink",
  "signup",
  "invite",
  "recovery",
  "email_change",
  "email",
];

export default function AuthCompleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => searchParams.get("next") ?? "/app", [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        if (isMounted) {
          setError("Missing Supabase configuration.");
        }
        return;
      }

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? searchParams.get("token");
      const providedType = searchParams.get("type") as EmailOtpType | null;

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
          router.replace(nextPath);
          return;
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            throw sessionError;
          }
          router.replace(nextPath);
          return;
        }

        if (tokenHash) {
          const types = providedType ? [providedType] : OTP_FALLBACK_TYPES;
          let lastError: Error | null = null;

          for (const type of types) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type,
            });
            if (!verifyError) {
              router.replace(nextPath);
              return;
            }
            lastError = verifyError;
          }

          throw lastError ?? new Error("OTP verification failed.");
        }

        throw new Error("Missing auth parameters in callback URL.");
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Authentication callback failed.";
          setError(message);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [nextPath, router, searchParams]);

  return (
    <>
      <h1 className="headline-gradient text-2xl font-bold">Completing sign-in...</h1>
      <p className="text-muted mt-3 text-sm">
        We are verifying your secure email link and creating your session.
      </p>
      {error ? (
        <p className="mt-5 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error} Please request a fresh link and try again.
        </p>
      ) : (
        <p className="mt-5 text-sm text-cyan-200">Please wait, this usually takes a second.</p>
      )}
    </>
  );
}
