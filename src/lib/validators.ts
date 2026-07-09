export type ValidationResult = { valid: boolean; error?: string };

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const VALID_STATE_CODES = new Set([
  "01","02","03","04","05","06","07","08","09","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30",
  "31","32","33","34","35","36","37","97",
]);
const PAN_ENTITY_TYPES = new Set(["C","P","H","F","A","T","B","L","J","G"]);
const LUHN36_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function luhnMod36Check(input: string): boolean {
  let factor = 2;
  let sum = 0;
  const n = 36;
  for (let i = input.length - 2; i >= 0; i--) {
    let codePoint = LUHN36_CHARS.indexOf(input[i]);
    let addend = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / n) + (addend % n);
    sum += addend;
  }
  const remainder = sum % n;
  const checkCodePoint = (n - remainder) % n;
  return LUHN36_CHARS[checkCodePoint] === input[input.length - 1];
}

export function validateGSTIN(gstin: string): ValidationResult {
  if (gstin.length !== 15) return { valid: false, error: "Must be 15 characters" };
  if (!GSTIN_RE.test(gstin)) return { valid: false, error: "Invalid format" };
  if (!VALID_STATE_CODES.has(gstin.substring(0, 2))) return { valid: false, error: "Invalid state code" };
  if (!luhnMod36Check(gstin)) return { valid: false, error: "Check digit mismatch" };
  return { valid: true };
}

export function validatePAN(pan: string): ValidationResult {
  if (pan.length !== 10) return { valid: false, error: "Must be 10 characters" };
  if (!PAN_RE.test(pan)) return { valid: false, error: "Invalid format" };
  if (!PAN_ENTITY_TYPES.has(pan[3])) return { valid: false, error: "Unknown entity type at position 4" };
  return { valid: true };
}

export function extractPanFromGstin(gstin: string): string | null {
  const result = validateGSTIN(gstin);
  if (!result.valid) return null;
  return gstin.substring(2, 12);
}

export function matchGstinPan(gstin: string, pan: string): boolean {
  const extracted = extractPanFromGstin(gstin);
  if (!extracted) return false;
  return extracted === pan;
}
