const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";

export const ADMIN_WHITELIST = raw
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return ADMIN_WHITELIST.includes(normalized);
}
