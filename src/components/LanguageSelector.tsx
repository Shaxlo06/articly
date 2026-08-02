"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/languages";

export function LanguageSelector({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold">{label}</span>
      <div className="flex flex-wrap gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            className={`rounded-md border px-3 py-2 flex items-center gap-2 transition-colors ${
              value === lang.code
                ? "border-accent-strong bg-accent-soft font-semibold"
                : "border-border-strong hover:border-accent-strong"
            }`}
          >
            <span aria-hidden>{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>
    </label>
  );
}
