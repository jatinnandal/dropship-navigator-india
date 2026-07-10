import { describe, expect, it } from "vitest";
import {
  extractPanFromGstin,
  matchGstinPan,
  validateGSTIN,
  validatePAN,
} from "@/lib/validators";

// Publicly documented sample GSTINs with valid check digits.
const VALID_GSTINS = ["27AAPFU0939F1ZV", "29AAGCB7383J1Z4"];

describe("GSTIN validation", () => {
  it("accepts known-valid GSTINs", () => {
    for (const g of VALID_GSTINS) {
      expect(validateGSTIN(g).valid, g).toBe(true);
    }
  });

  it("rejects a corrupted check digit", () => {
    const g = VALID_GSTINS[0];
    const corrupted = g.slice(0, 14) + (g[14] === "A" ? "B" : "A");
    expect(validateGSTIN(corrupted).valid).toBe(false);
  });

  it("rejects invalid state codes", () => {
    expect(validateGSTIN("00AAPFU0939F1ZV").valid).toBe(false);
  });

  it("rejects wrong length and format", () => {
    expect(validateGSTIN("27AAPFU0939F1Z").valid).toBe(false);
    expect(validateGSTIN("27aapfu0939f1zv").valid).toBe(false);
  });
});

describe("PAN validation and cross-check", () => {
  it("accepts a well-formed PAN", () => {
    expect(validatePAN("AAPFU0939F").valid).toBe(true);
  });

  it("rejects unknown entity type at position 4", () => {
    expect(validatePAN("AAXQU0939F").valid).toBe(false);
  });

  it("extracts the embedded PAN from a GSTIN", () => {
    expect(extractPanFromGstin("27AAPFU0939F1ZV")).toBe("AAPFU0939F");
  });

  it("cross-checks GSTIN against PAN", () => {
    expect(matchGstinPan("27AAPFU0939F1ZV", "AAPFU0939F")).toBe(true);
    expect(matchGstinPan("27AAPFU0939F1ZV", "AAPFU0939A")).toBe(false);
  });
});
