"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Show a flash message (driven by a URL ?message/?error param) that auto-hides
 * after `ms`. Pass the message identity as `key` (e.g. the error/message code):
 * a new key shows again and restarts the timer. With `stripUrl` the query param
 * is removed on hide so a refresh won't resurface it — skip it where other UI
 * reads the param (e.g. the signup-confirm/resend flow). Returns whether to render.
 */
export function useFlash(key: string | null | undefined | false, ms = 6000, stripUrl = true): boolean {
  const router = useRouter();
  const pathname = usePathname();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => {
      setDismissedKey(key);
      if (stripUrl) router.replace(pathname, { scroll: false });
    }, ms);
    return () => clearTimeout(t);
  }, [key, ms, stripUrl, router, pathname]);

  return Boolean(key) && key !== dismissedKey;
}
