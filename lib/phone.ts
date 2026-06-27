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

/** Internal Firebase email for phone + password sign-in */
const PHONE_AUTH_DOMAIN = "phone.sportmate.app";

export function phoneToAuthEmail(digits: string): string {
  return `${normalizeGeorgianDigits(digits)}@${PHONE_AUTH_DOMAIN}`;
}

export function phoneFromAuthEmail(email: string): string | null {
  const lower = email.toLowerCase();
  const suffix = `@${PHONE_AUTH_DOMAIN}`;
  if (!lower.endsWith(suffix)) return null;
  const digits = lower.slice(0, -suffix.length);
  if (!isValidGeorgianMobile(digits)) return null;
  return toE164(digits);
}

export function resolveAuthPhone(
  phone: string | undefined | null,
  email: string | undefined | null
): string {
  if (phone) return phone;
  return phoneFromAuthEmail(email ?? "") ?? "";
}
