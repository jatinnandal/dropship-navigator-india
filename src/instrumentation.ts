import type { Instrumentation } from "next";

/**
 * Server-side error capture. Next calls this for errors thrown while rendering
 * Server Components, route handlers, and server actions. Routed through the
 * central reporter so prod errors land in Vercel Runtime Logs.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const { reportError } = await import("@/lib/report-error");
  reportError(err, {
    source: "onRequestError",
    path: request.path,
    method: request.method,
    routeType: context?.routeType,
    routePath: context?.routePath,
  });
};
