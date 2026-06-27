/** Georgian mobile: 9 digits, typically starting with 5 */
const GEORGIAN_MOBILE = /^5\d{8}$/;

export const GEORGIA_DIAL_CODE = "+995";

export function normalizeGeorgianDigits(input: string): string {
  return input.replace(/\D/g, "").slice(-9);
}

export function isValidGeorgianMobile(digits: string): boolean {
  return GEORGIAN_MOBILE.test(digits);
}

export function toE164(digits: string): string {
  const d = normalizeGeorgianDigits(digits);
  return `${GEORGIA_DIAL_CODE}${d}`;
}

export function formatDisplayPhone(digits: string): string {
  const d = normalizeGeorgianDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}
