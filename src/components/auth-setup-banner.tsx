import { getAuthSetupIssuesWithRemoteChecks } from "@/lib/auth-setup";

export async function AuthSetupBanner() {
  const issues = await getAuthSetupIssuesWithRemoteChecks();
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="banner-deadline rounded-lg px-4 py-3 text-sm text-rose-100">
      <p className="font-semibold text-rose-50">Auth setup needs attention</p>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        {issues.map((issue) => (
          <li key={issue.id}>
            <span className="font-medium">{issue.title}</span>
            <span className="text-rose-100/90"> — {issue.fix}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
