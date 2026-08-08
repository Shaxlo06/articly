function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l1-4.2L15.8 5 19 8.2 8.2 19 4 20Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h8M8 4v2c0 4-2 7-5 8.5" />
      <path d="M5 10c1 2 3 3.5 5 4" />
      <path d="M15 20l4-9 4 9" />
      <path d="M16.3 17h5.4" />
    </svg>
  );
}

function JournalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5Z" />
      <path d="M5 17.5h13" />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
    </svg>
  );
}

export const NAV_TABS = [
  { href: "/dashboard", key: "dashboard", Icon: HomeIcon, match: (p: string) => p === "/dashboard" },
  { href: "/editor/new", key: "editArticle", Icon: PencilIcon, match: (p: string) => p.startsWith("/editor") },
  { href: "/translate/new", key: "translate", Icon: TranslateIcon, match: (p: string) => p.startsWith("/translate") },
  { href: "/journals/new", key: "journals", Icon: JournalIcon, match: (p: string) => p.startsWith("/journals") },
  { href: "/indexing/new", key: "indexing", Icon: GraduationCapIcon, match: (p: string) => p.startsWith("/indexing") },
] as const;
