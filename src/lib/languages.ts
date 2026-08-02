// Standalone (no server-only deps) so client components can import it
// without pulling the Anthropic SDK into the browser bundle.
export const SUPPORTED_LANGUAGES = [
  { code: "uz", label: "Uzbek", flag: "🇺🇿" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
