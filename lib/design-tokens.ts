export type LegacyDesignTokens = Record<string, string>;

export function applyDesignTokens(tokens: LegacyDesignTokens) {
  if (typeof window === "undefined") return;

  for (const [key, value] of Object.entries(tokens)) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }
}
