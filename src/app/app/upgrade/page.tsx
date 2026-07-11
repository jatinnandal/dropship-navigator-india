import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ plan?: string }>;
};

// /app/upgrade is consolidated into /app/plans — keep the old URL working,
// preserving any ?plan intent from pricing / signup redirects.
export default async function UpgradeRedirect({ searchParams }: Props) {
  const { plan } = await searchParams;
  const suffix = plan === "starter" || plan === "growth" ? `?plan=${plan}` : "";
  redirect(`/app/plans${suffix}`);
}
