import { describe, expect, it } from "vitest";
import { getGstEventsForMonth, quarterlyGstr3bDueDay } from "@/lib/gst-calendar-data";

describe("quarterlyGstr3bDueDay", () => {
  it("category A (south/west) states file by the 22nd", () => {
    for (const s of ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Kerala", "Telangana", "Goa", "Madhya Pradesh", "Chhattisgarh", "Andhra Pradesh"]) {
      expect(quarterlyGstr3bDueDay(s)).toBe(22);
    }
  });

  it("category B (north/east) states file by the 24th", () => {
    for (const s of ["Delhi", "Uttar Pradesh", "West Bengal", "Bihar", "Rajasthan", "Punjab", "Haryana", "Assam", "Odisha", "Jharkhand"]) {
      expect(quarterlyGstr3bDueDay(s)).toBe(24);
    }
  });

  it("defaults to the 22nd when state is unknown", () => {
    expect(quarterlyGstr3bDueDay(undefined)).toBe(22);
    expect(quarterlyGstr3bDueDay("Narnia")).toBe(22);
  });
});

describe("getGstEventsForMonth quarterly GSTR-3B", () => {
  it("uses the state-resolved due day for QRMP filers", () => {
    // April = filing month for the Jan-Mar quarter
    const mh = getGstEventsForMonth(2026, 3, true, "Maharashtra").find((e) => e.filing.id === "gstr3b-quarterly");
    const up = getGstEventsForMonth(2026, 3, true, "Uttar Pradesh").find((e) => e.filing.id === "gstr3b-quarterly");
    expect(mh?.dueDate.getDate()).toBe(22);
    expect(up?.dueDate.getDate()).toBe(24);
  });
});
