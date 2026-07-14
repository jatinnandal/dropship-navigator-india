import { describe, expect, it } from "vitest";
import { buildNotifications, rateChangeNotificationId, type NotificationInput } from "@/lib/notifications";
import { CURRENT_RATES } from "@/data/rates";
import { defaultProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";

// Amazon + fashion is a channel/category the rate card actually moved between
// versions, so computeRatesImpact returns a non-null delta (Meesho/general nets
// ~0 and stays silent - which is correct, just not useful for the "fires" case).
const rateSensitiveProfile = { ...defaultProfile, primaryChannel: "amazon" as const, productType: "fashion" as const };

function input(overrides: {
  workspace?: Partial<Workspace>;
  hasGstin?: boolean;
  rateAlertsEntitled?: boolean;
  latestSettlementUploadAt?: string | null;
}): NotificationInput {
  return {
    profile: rateSensitiveProfile,
    workspace: { ...overrides.workspace },
    hasGstin: overrides.hasGstin ?? false,
    latestSettlementUploadAt: overrides.latestSettlementUploadAt ?? null,
    rateAlertsEntitled: overrides.rateAlertsEntitled ?? false,
  };
}

// Only exercise the rate-change branch owned by this module; the crisis
// detectors have their own tests. Saved numbers make computeRatesImpact real.
const savedNumbers: Partial<Workspace> = { targetSellingPrice: 799, productCost: 250, shippingCost: 70 };

describe("buildNotifications - rate-change branch", () => {
  it("fires for an entitled Growth user with saved numbers and an unseen rate version", () => {
    const notifs = buildNotifications(input({ workspace: savedNumbers, rateAlertsEntitled: true }));
    const rate = notifs.find((n) => n.id === rateChangeNotificationId());
    expect(rate).toBeDefined();
    expect(rate?.href).toBe("/app/tools/margin-calculator");
  });

  it("does not fire when the user is not entitled (not Growth)", () => {
    const notifs = buildNotifications(input({ workspace: savedNumbers, rateAlertsEntitled: false }));
    expect(notifs.some((n) => n.id === rateChangeNotificationId())).toBe(false);
  });

  it("does not fire once the current rate version has been seen", () => {
    const notifs = buildNotifications(
      input({ workspace: { ...savedNumbers, seenRatesVersion: CURRENT_RATES.meta.version }, rateAlertsEntitled: true }),
    );
    expect(notifs.some((n) => n.id === rateChangeNotificationId())).toBe(false);
  });

  it("does not fire once dismissed (read state via dismissedWarnings)", () => {
    const notifs = buildNotifications(
      input({
        workspace: { ...savedNumbers, dismissedWarnings: { [rateChangeNotificationId()]: new Date().toISOString() } },
        rateAlertsEntitled: true,
      }),
    );
    expect(notifs.some((n) => n.id === rateChangeNotificationId())).toBe(false);
  });

  it("stays silent with no saved numbers (nothing meaningful to report)", () => {
    const notifs = buildNotifications(input({ workspace: {}, rateAlertsEntitled: true }));
    expect(notifs.some((n) => n.id === rateChangeNotificationId())).toBe(false);
  });
});
