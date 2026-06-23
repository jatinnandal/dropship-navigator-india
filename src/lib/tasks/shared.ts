import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";

export function stateLabel(state: string): string {
  return state.trim().length > 0 ? state.trim() : "your state";
}

export function channelLabel(channel: OnboardingProfile["primaryChannel"]): string {
  switch (channel) {
    case "amazon":
      return "Amazon";
    case "flipkart":
      return "Flipkart";
    case "shopify":
      return "Shopify";
    default:
      return "Meesho";
  }
}

export function identityDocsForBusiness(profile: OnboardingProfile): string[] {
  switch (profile.businessType) {
    case "private_limited":
      return [
        "Company PAN + Certificate of Incorporation (from MCA)",
        "MoA and AoA",
        "Board resolution naming the authorized signatory + that person's PAN, Aadhaar and photo",
        "PAN, Aadhaar and photo of each director",
      ];
    case "llp":
      return [
        "LLP PAN + LLP incorporation certificate",
        "LLP agreement",
        "Authorized signatory PAN, Aadhaar and photo",
        "PAN, Aadhaar and photo of each designated partner",
      ];
    case "partnership":
      return [
        "Firm PAN + partnership deed",
        "PAN, Aadhaar and photo of every partner",
        "Authorized signatory proof (letter of authorization)",
      ];
    default:
      return [
        "Your PAN card",
        "Your Aadhaar card (mobile number must be linked for OTP)",
        "One recent passport-style photo (JPEG, under 100 KB)",
      ];
  }
}

export function needsDsc(profile: OnboardingProfile): boolean {
  return profile.businessType === "private_limited" || profile.businessType === "llp";
}

export function nameMismatchWarning(workspace: Workspace): string | null {
  if (!workspace.legalBusinessName || !workspace.bankAccountName) {
    return null;
  }
  const legal = workspace.legalBusinessName.trim().toLowerCase();
  const bank = workspace.bankAccountName.trim().toLowerCase();
  if (legal !== bank) {
    return `Your legal name "${workspace.legalBusinessName}" does not match bank name "${workspace.bankAccountName}". Fix this before marketplace onboarding.`;
  }
  return null;
}
