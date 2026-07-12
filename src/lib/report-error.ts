/**
 * Single choke point for error reporting. Today it emits a structured line to
 * stderr, which Vercel captures in Runtime Logs (filter for "[app-error]").
 * To add Sentry/Logtail/etc. later, wire the call in one place - here.
 */
type ErrorContext = Record<string, unknown>;

export function reportError(error: unknown, context?: ErrorContext): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    tag: "[app-error]",
    name: err.name,
    message: err.message,
    stack: err.stack,
    at: new Date().toISOString(),
    ...context,
  };
  console.error("[app-error] " + JSON.stringify(payload));
}
