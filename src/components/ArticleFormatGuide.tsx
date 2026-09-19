import type { ReactNode } from "react";

type IconName = "document" | "layout" | "type" | "quote" | "list" | "page" | "book" | "download" | "check";

const GENERAL_RULES = [
  { label: "Qog‘oz o‘lchami", value: "A4 (210 × 297 mm)" },
  { label: "Orientation", value: "Portrait" },
  { label: "Top margin", value: "2.5 cm" },
  { label: "Bottom margin", value: "2.5 cm" },
  { label: "Left margin", value: "3.0 cm" },
  { label: "Right margin", value: "2.0 cm" },
  { label: "Font", value: "Times New Roman" },
  { label: "Asosiy matn", value: "12 pt" },
  { label: "Satr oralig‘i", value: "1.5" },
  { label: "Abzas", value: "1.25 cm first line indent" },
  { label: "Matn rangi", value: "Black" },
  { label: "Hujjat tili", value: "Ingliz tili" },
  { label: "Sahifa raqami", value: "Pastki o‘rtada" },
  { label: "Header / Footer", value: "Header yo‘q, footerda faqat raqam" },
] as const;

const ARTICLE_STRUCTURE = [
  "Title (Sarlavha)",
  "Author(s) va Affiliation",
  "Abstract",
  "Keywords",
  "Introduction",
  "Literature Review",
  "Research Methods",
  "Result and Discussion",
  "Conclusions",
  "References",
] as const;

const SECTION_HEADINGS = [
  "Introduction.",
  "Literature Review.",
  "Research Methods.",
  "Result and Discussion.",
  "Conclusions.",
] as const;

const CHECKLIST_ITEMS = [
  "Times New Roman, 12 pt",
  "Satr oralig‘i 1.5",
  "Abzas 1.25 cm",
  "Bo‘limlar Bold",
  "Bullet va Number list formatlari",
  "Citations: (Author, Year)",
  "References: raqamli ro‘yxat",
  "Sahifa raqami pastki o‘rtada",
] as const;

const REFERENCES = [
  "Rismanto, H., & Judijanto, L. (2025). Digital research practices in higher education. Journal of Academic Studies, 18(2), 41–57.",
  "Creswell, J. W., & Creswell, J. D. (2018). Research Design: Qualitative, Quantitative, and Mixed Methods Approaches. SAGE Publications.",
  "Swales, J. M., & Feak, C. B. (2012). Academic Writing for Graduate Students. University of Michigan Press.",
] as const;

const EXPORT_FORMATS = [
  { extension: ".docx", label: "Word", tone: "bg-[#e8f1fb] text-[#24548a] dark:bg-[#1b3045] dark:text-[#9bc7f5]" },
  { extension: ".pdf", label: "PDF", tone: "bg-[#faecec] text-[#a43d3d] dark:bg-[#3a2225] dark:text-[#f2a7a7]" },
  { extension: ".txt", label: "TXT", tone: "bg-[#edf2f4] text-[#465b68] dark:bg-[#24323a] dark:text-[#b8c8d0]" },
  { extension: ".html", label: "HTML", tone: "bg-[#fff1e8] text-[#a84b21] dark:bg-[#3b2a21] dark:text-[#f4ad81]" },
] as const;

export function ArticleFormatGuide() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#cbd8e6] bg-[#f3f8fc] shadow-[0_18px_55px_rgba(31,65,101,0.08)] dark:border-border dark:bg-[#111f28]">
      <div className="border-b border-[#cfdeea] bg-[linear-gradient(135deg,#f8fbfe_0%,#e8f3fa_100%)] px-5 py-7 sm:px-8 lg:px-10 dark:border-border dark:bg-[linear-gradient(135deg,#182a35_0%,#12212a_100%)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2a628d] dark:text-[#91c4e7]">
              <GuideIcon name="document" className="h-4 w-4" /> Academic document standard
            </p>
            <h2 className="max-w-4xl font-serif text-2xl font-bold leading-tight text-[#173b60] sm:text-3xl dark:text-[#d8ecfa]">
              ARTICLE EDIT MODULI UCHUN FORMAT TAHLILI
            </h2>
            <p className="mt-2 text-sm font-semibold tracking-wide text-[#42637e] dark:text-[#9eb7c9]">
              (0 DAN YOZISH / TAHRIRLASH / YUKLAB OLISH)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#42637e] dark:text-[#9eb7c9]">
            <span className="h-2 w-2 rounded-full bg-green" aria-hidden="true" />
            Export bilan sinxron format
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#9ed5b0] bg-[#eaf8ef] p-4 text-sm font-semibold leading-6 text-[#176638] dark:border-[#2d6d45] dark:bg-[#173326] dark:text-[#a7e9bd]">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#238a4b] text-white">
            <GuideIcon name="check" className="h-3.5 w-3.5" />
          </span>
          <p>Maqola foydalanuvchi tomonidan 0 dan yozilganda yoki tahrirlanganda va yuklab olinganda HUDDI SHU FORMATDA BO‘LISHI SHART</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-12 lg:p-8">
        <FormatSection number="01" title="UMUMIY FORMAT" icon="layout" className="lg:col-span-7">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {GENERAL_RULES.map((rule) => (
              <RuleCard key={rule.label} label={rule.label} value={rule.value} />
            ))}
          </div>
        </FormatSection>

        <FormatSection number="02" title="MAQOLA TUZILMASI" icon="document" className="lg:col-span-5">
          <ol className="space-y-2.5">
            {ARTICLE_STRUCTURE.map((item, index) => (
              <li key={item} className="flex items-center gap-3 rounded-lg bg-[#f4f8fb] px-3 py-2.5 text-sm dark:bg-[#142630]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#244f75] text-xs font-bold text-white dark:bg-[#74add3] dark:text-[#11212b]">
                  {index + 1}
                </span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ol>
        </FormatSection>

        <FormatSection number="03" title="SARLAVHA VA MUALLIFLAR FORMATI" icon="type" className="lg:col-span-7">
          <div className="rounded-xl border border-[#cdd6df] bg-white px-5 py-7 text-center text-black shadow-[0_8px_24px_rgba(22,46,70,0.08)] sm:px-10" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <p className="text-base font-bold sm:text-lg">MAQOLA SARLAVHASI</p>
            <p className="mt-1 text-xs text-slate-500">(Bold, 12–14 pt, Center)</p>
            <p className="mt-6 text-sm font-bold">Kucharova Shaxlo Sobir qizi</p>
            <p className="mt-1 text-xs text-slate-500">(Bold, Center)</p>
            <p className="mt-5 text-sm">Doctorate (PhD) student</p>
            <p className="mt-1 text-sm">Institute for advanced training of personnel and statistical research, Uzbekistan</p>
            <a className="mt-3 inline-block text-sm text-blue-700 underline" href="mailto:example@email.com">E-mail: example@email.com</a>
          </div>
        </FormatSection>

        <FormatSection number="04" title="ABSTRACT VA KEYWORDS" icon="quote" className="lg:col-span-5">
          <div className="space-y-3">
            <RuleBlock title="Abstract.">
              Label bold, body normal, 1 paragraph, taxminan 150–250 so‘z va 1.5 satr oralig‘i.
            </RuleBlock>
            <RuleBlock title="Keywords:">
              3–10 ta kalit so‘z, vergul bilan ajratiladi va 1.5 satr oralig‘ida yoziladi.
            </RuleBlock>
          </div>
        </FormatSection>

        <FormatSection number="05" title="BO‘LIMLAR SARLAVHASI" icon="type" className="lg:col-span-4">
          <div className="space-y-2">
            {SECTION_HEADINGS.map((heading) => (
              <div key={heading} className="border-l-4 border-[#315f86] bg-[#f2f7fb] px-3 py-2.5 text-sm font-bold dark:bg-[#142630]">
                {heading}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">Bold · 12 pt · chap tomonga tekislangan · raqamlash shart emas</p>
        </FormatSection>

        <FormatSection number="06" title="LIST FORMATLARI" icon="list" className="lg:col-span-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <ListExample title="Bullet List" ordered={false} />
            <ListExample title="Numbered List" ordered />
          </div>
        </FormatSection>

        <div className="grid gap-5 lg:col-span-3">
          <FormatSection number="07" title="IQTIBOS USLUBI" icon="quote">
            <p className="text-sm text-muted">Matnda muallif–yil ko‘rinishida:</p>
            <blockquote className="mt-3 rounded-lg border-l-4 border-[#315f86] bg-[#f2f7fb] px-4 py-3 font-serif text-base font-semibold text-[#173b60] dark:bg-[#142630] dark:text-[#c8e2f4]">
              (Rismanto &amp; Judijanto, 2025).
            </blockquote>
          </FormatSection>
          <FormatSection number="08" title="SAHIFA RAQAMI" icon="page">
            <div className="rounded-lg bg-[#f2f7fb] p-4 text-center dark:bg-[#142630]">
              <p className="font-serif text-xl font-semibold">1, 2, 3, ...</p>
              <p className="mt-2 text-xs font-medium text-muted">Bottom center · footer center aligned</p>
            </div>
          </FormatSection>
        </div>

        <FormatSection number="09" title="MAQOLA NAMUNASI (PREVIEW)" icon="document" className="lg:col-span-12">
          <ArticlePreview />
        </FormatSection>

        <FormatSection number="10" title="REFERENCES" icon="book" className="lg:col-span-8">
          <p className="mb-4 text-sm leading-6 text-muted">Heading centered va bold; ro‘yxat raqamli, Times New Roman 12 pt, 1.5 interval hamda 1.25 cm hanging indent bilan.</p>
          <div className="rounded-xl border border-[#d6dee6] bg-white p-5 text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <h4 className="mb-4 text-center text-base font-bold">References</h4>
            <ol className="space-y-3 text-sm leading-[1.5]">
              {REFERENCES.map((reference, index) => (
                <li key={reference} className="grid grid-cols-[1.6rem_1fr] gap-1">
                  <span>{index + 1}.</span><span>{reference}</span>
                </li>
              ))}
            </ol>
          </div>
        </FormatSection>

        <FormatSection number="11" title="EXPORT FORMATLARI" icon="download" className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            {EXPORT_FORMATS.map((format) => (
              <ExportFormatCard key={format.extension} {...format} />
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">Word va PDF akademik sahifa formatini saqlaydi. TXT faqat matnni, HTML esa brauzerga mos formatni beradi.</p>
        </FormatSection>

        <FormatSection number="12" title="ASOSIY QOIDALAR" icon="check" className="lg:col-span-12">
          <Checklist items={CHECKLIST_ITEMS} />
        </FormatSection>

        <div className="lg:col-span-12 flex items-start gap-3 rounded-xl border border-[#9ed5b0] bg-[#eaf8ef] p-4 text-sm font-semibold leading-6 text-[#176638] dark:border-[#2d6d45] dark:bg-[#173326] dark:text-[#a7e9bd]">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#238a4b] text-white">
            <GuideIcon name="check" className="h-3.5 w-3.5" />
          </span>
          <p>Foydalanuvchi 0 dan yozgan yoki tahrirlagan maqolasi eksport qilinganda – yuqoridagi barcha format va uslublarga avtomatik moslashishi kerak.</p>
        </div>
      </div>
    </div>
  );
}

export function FormatSection({ number, title, icon, className = "", children }: { number: string; title: string; icon: IconName; className?: string; children: ReactNode }) {
  return (
    <section className={`rounded-xl border border-[#d5e0e9] bg-surface p-4 shadow-[0_8px_25px_rgba(31,65,101,0.05)] sm:p-5 dark:border-border ${className}`}>
      <div className="mb-4 flex items-center gap-3 border-b border-[#dbe5ed] pb-3 dark:border-border">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f0f7] text-[#28597f] dark:bg-[#1d3443] dark:text-[#95c6e6]">
          <GuideIcon name={icon} className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#6f8aa0] dark:text-[#86a3b7]">SECTION {number}</p>
          <h3 className="font-serif text-base font-bold text-[#173b60] sm:text-lg dark:text-[#cfe7f7]">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

export function RuleCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e0e8ee] bg-[#f7fafc] px-3 py-2.5 dark:border-border dark:bg-[#142630]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#71889a] dark:text-[#88a1b1]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 rounded-lg bg-[#f0f8f3] px-3 py-3 text-sm font-semibold dark:bg-[#173326]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green text-white">
            <GuideIcon name="check" className="h-3 w-3" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ArticlePreview() {
  return (
    <div className="rounded-xl bg-[#dfe9f0] p-3 sm:p-5 dark:bg-[#0f1c24]">
      <div className="grid gap-5 xl:grid-cols-2">
        <PreviewPage pageNumber="1">
          <div className="text-center">
            <h4 className="text-[13px] font-bold uppercase leading-tight">Digital Research Practices in Higher Education</h4>
            <p className="mt-3 text-[10px] font-bold">Kucharova Shaxlo Sobir qizi</p>
            <p className="mt-1 text-[9px]">Doctorate (PhD) student</p>
            <p className="text-[9px]">Institute for advanced training of personnel and statistical research, Uzbekistan</p>
            <p className="mt-1 text-[9px] text-blue-700 underline">E-mail: example@email.com</p>
          </div>
          <PreviewParagraph heading="Abstract." compact>
            This article examines how digital research tools influence academic writing practices in higher education. The study considers research organization, source evaluation, collaborative drafting, and the consistent application of scholarly formatting standards.
          </PreviewParagraph>
          <p className="text-[9px] leading-[1.5]"><strong>Keywords:</strong> academic writing, digital research, higher education, scholarly communication</p>
          <PreviewParagraph heading="Introduction.">
            Academic writing requires a clear structure, reliable evidence, and consistent document formatting. Digital workflows can support each stage of the research process when they preserve the conventions expected by scholarly journals and institutions.
          </PreviewParagraph>
          <p className="text-justify text-[9px] leading-[1.5] indent-[12.5mm]">A unified formatting model also reduces the time spent correcting margins, typography, citations, and reference lists before submission.</p>
        </PreviewPage>

        <PreviewPage pageNumber="2">
          <p className="text-justify text-[9px] leading-[1.5] indent-[12.5mm]">The findings indicate that researchers benefit most when writing and export tools share the same formatting specification across every stage of the article lifecycle.</p>
          <PreviewParagraph heading="Literature Review.">
            Previous studies connect structured writing environments with improved clarity, revision discipline, and more consistent scholarly presentation. Standardized templates are particularly valuable for early-career researchers.
          </PreviewParagraph>
          <PreviewParagraph heading="Research Methods.">
            A qualitative review of academic workflow practices was combined with a comparative analysis of document-formatting requirements. The analysis focused on typography, page geometry, section hierarchy, lists, citations, and references.
          </PreviewParagraph>
          <PreviewParagraph heading="Result and Discussion.">
            The proposed format creates a predictable reading experience and produces submission-ready documents across Word and PDF exports. Consistency between the editor and exported file remains the central requirement.
          </PreviewParagraph>
        </PreviewPage>
      </div>
    </div>
  );
}

export function ExportFormatCard({ extension, label, tone }: { extension: string; label: string; tone: string }) {
  return (
    <div className="group rounded-xl border border-[#dde5eb] bg-[#f9fbfc] p-3 transition-transform hover:-translate-y-0.5 dark:border-border dark:bg-[#142630]">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><GuideIcon name="download" className="h-4 w-4" /></div>
      <p className="mt-3 text-sm font-bold">{label}</p>
      <p className="text-xs text-muted">{extension}</p>
    </div>
  );
}

function RuleBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[#dfe7ed] bg-[#f5f9fb] p-4 text-sm leading-6 dark:border-border dark:bg-[#142630]">
      <p className="font-serif font-bold text-[#173b60] dark:text-[#cfe7f7]">{title}</p>
      <p className="mt-1 text-muted">{children}</p>
    </div>
  );
}

function ListExample({ title, ordered }: { title: string; ordered: boolean }) {
  const items = ["Matn 1", "Matn 2", "Matn 3"];
  return (
    <div className="rounded-lg border border-[#dfe7ed] bg-[#f5f9fb] p-4 dark:border-border dark:bg-[#142630]">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#466984] dark:text-[#9ab8cc]">{title}</p>
      {ordered ? (
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ol>
      ) : (
        <ul className="list-disc space-y-1.5 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ul>
      )}
    </div>
  );
}

function PreviewPage({ pageNumber, children }: { pageNumber: string; children: ReactNode }) {
  return (
    <article className="relative mx-auto aspect-[210/297] w-full max-w-[460px] overflow-hidden border border-[#c8d0d7] bg-white px-[9.5%] pb-[9%] pt-[10%] text-black shadow-[0_10px_30px_rgba(31,55,75,0.18)]" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="space-y-2.5">{children}</div>
      <span className="absolute bottom-[4.2%] left-1/2 -translate-x-1/2 text-[9px]">{pageNumber}</span>
    </article>
  );
}

function PreviewParagraph({ heading, compact = false, children }: { heading: string; compact?: boolean; children: ReactNode }) {
  return (
    <div className={compact ? "mt-3" : "mt-2.5"}>
      <p className="text-justify text-[9px] leading-[1.5]">
        <strong>{heading}</strong>{" "}<span className={compact ? "" : "indent-[12.5mm]"}>{children}</span>
      </p>
    </div>
  );
}

function GuideIcon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    document: <><path d="M6 2.75h7l5 5V21.25H6z" /><path d="M13 2.75v5h5M9 12h6M9 15.5h6" /></>,
    layout: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 3v18M8 9h13" /></>,
    type: <><path d="M5 5h14M12 5v14M8 19h8" /></>,
    quote: <><path d="M9.5 10H5.75A2.75 2.75 0 0 0 3 12.75v1.5A2.75 2.75 0 0 0 5.75 17H7a2.5 2.5 0 0 0 2.5-2.5V10ZM21 10h-3.75a2.75 2.75 0 0 0-2.75 2.75v1.5A2.75 2.75 0 0 0 17.25 17h1.25a2.5 2.5 0 0 0 2.5-2.5V10Z" /><path d="M5 10c0-2.5 1.3-4.2 3.5-5M16.5 10c0-2.5 1.3-4.2 3.5-5" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" /></>,
    page: <><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h6M9 10h6M11 17h2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 1 2.5 2.5z" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
