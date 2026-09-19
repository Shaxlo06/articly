import type { ReactNode } from "react";

type IconName = "paper" | "portrait" | "margin" | "type" | "spacing" | "align" | "globe" | "page" | "document" | "quote" | "list" | "book" | "download" | "check";

const GENERAL_RULES: { icon: IconName; label: string; value: ReactNode }[] = [
  { icon: "paper", label: "Qog‘oz o‘lchami", value: "A4 (210 × 297 mm)" },
  { icon: "portrait", label: "Orientation", value: "Portrait" },
  { icon: "margin", label: "Margins (Chegaralar)", value: <span>Top: 2.5 cm · Bottom: 2.5 cm<br />Left: 3.0 cm · Right: 2.0 cm</span> },
  { icon: "type", label: "Font", value: "Times New Roman" },
  { icon: "type", label: "Asosiy matn o‘lchami", value: "12 pt" },
  { icon: "spacing", label: "Satr oralig‘i (Line spacing)", value: "1.5" },
  { icon: "align", label: "Abzas (Paragraph)", value: "1.25 cm (First line indent)" },
  { icon: "type", label: "Matn rangi", value: "Black" },
  { icon: "globe", label: "Hujjat tili", value: "Ingliz tili" },
  { icon: "page", label: "Sahifa raqami", value: "Pastki o‘rtada (Center)" },
  { icon: "document", label: "Header / Footer", value: "Yo‘q" },
];

const ARTICLE_STRUCTURE = [
  "Title (Sarlavha)",
  "Author(s) va Affiliation (Muallif va tashkilot)",
  "Abstract",
  "Keywords",
  "Introduction",
  "Literature Review",
  "Research Methods",
  "Result and Discussion",
  "Conclusions",
  "References",
] as const;

const HEADINGS = ["Introduction.", "Literature Review.", "Research Methods.", "Result and Discussion.", "Conclusions."] as const;

const RULES = [
  "Times New Roman, 12 pt",
  "Satr oralig‘i 1.5",
  "Abzas 1.25 cm",
  "Bo‘limlar Bold",
  "Bullet va Number list formatlari",
  "Citations: (Author, Year)",
  "References: Raqamli ro‘yxat",
  "Sahifa raqami pastki o‘rtada",
] as const;

const EXPORTS = [
  { label: "Word", extension: ".docx", mark: "W", color: "bg-[#185abd]" },
  { label: "PDF", extension: ".pdf", mark: "PDF", color: "bg-[#c93632]" },
  { label: "TXT", extension: ".txt", mark: "TXT", color: "bg-[#566b7e]" },
  { label: "HTML", extension: ".html", mark: "</>", color: "bg-[#e26722]" },
] as const;

export function ArticleFormatGuide({ actions }: { actions?: ReactNode }) {
  return (
    <div className="relative left-1/2 w-[min(1600px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-[#b9d0e5] bg-[#f6f8fa] p-2.5 text-[#18304f] sm:p-4 dark:bg-[#f6f8fa]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,48fr)_minmax(0,52fr)]">
        <div className="min-w-0 space-y-3">
          <header className="rounded-md bg-[#123f7d] px-4 py-5 text-center text-white sm:px-6">
            <h2 className="text-base font-extrabold uppercase leading-tight tracking-[0.055em] sm:text-xl">
              ARTICLE EDIT MODULI UCHUN FORMAT TAHLILI
            </h2>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.13em] sm:text-sm">
              (0 DAN YOZISH / TAHRIRLASH / YUKLAB OLISH)
            </p>
          </header>

          <SuccessNotice>
            <span className="block text-[#25475f]">Maqola foydalanuvchi tomonidan 0 dan yozilganda yoki tahrirlanganda va yuklab olinganda</span>
            <strong className="mt-0.5 block uppercase text-[#1f7a38]">HUDDI SHU FORMATDA BO‘LISHI SHART</strong>
          </SuccessNotice>

          {actions && <div className="rounded-md border border-[#b9d0e5] bg-white p-2.5">{actions}</div>}

          <div className="grid items-start gap-3 md:grid-cols-2">
            <div className="space-y-3">
              <FormatCard number="1" title="UMUMIY FORMAT">
                <div className="divide-y divide-[#d9e4ed]">
                  {GENERAL_RULES.map((rule) => <FormatRow key={rule.label} {...rule} />)}
                </div>
              </FormatCard>

              <FormatCard number="2" title="MAQOLA TUZILMASI" subtitle="SECTION STRUCTURE">
                <ArticleStructure />
              </FormatCard>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                <FormatCard number="7" title="IQTIBOS (CITATION) USLUBI" compact>
                  <p className="text-xs leading-5 text-[#4b6074]">Matnda muallif–yil ko‘rinishida:</p>
                  <p className="mt-2 border-l-3 border-[#123f7d] bg-[#eef5fb] px-3 py-2 font-serif text-sm font-bold text-[#123f7d]">(Rismanto &amp; Judijanto, 2025).</p>
                </FormatCard>
                <FormatCard number="8" title="SAHIFA RAQAMI" compact>
                  <p className="text-center font-serif text-base font-bold text-[#123f7d]">1, 2, 3, ...</p>
                  <p className="mt-2 text-center text-xs leading-5 text-[#4b6074]">Pastki o‘rtada<br />(Footer’da, Center alignment)</p>
                </FormatCard>
              </div>
            </div>

            <div className="space-y-3">
              <FormatCard number="3" title="SARLAVHA VA MUALLIFLAR FORMATI">
                <div className="border border-[#c9d6e1] bg-white px-3 py-5 text-center text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <p className="text-[15px] font-bold">MAQOLA Sarlavhasi</p>
                  <p className="mt-1 text-[11px] text-[#617080]">(Bosh harflar, Bold, 12–14 pt, Center)</p>
                  <p className="mt-4 text-[13px] font-bold">Kucharova Shaxlo Sobir qizi</p>
                  <p className="mt-0.5 text-[11px] text-[#617080]">(Bold, Center)</p>
                  <p className="mt-3 text-xs leading-[1.45]">Doctorate (PhD) student Institute for advanced training of personnel<br />and statistical research, Uzbekistan</p>
                  <a href="mailto:shaxlosobirovna06@gmail.com" className="mt-2 inline-block text-xs text-[#1456a0] underline">E-mail: shaxlosobirovna06@gmail.com</a>
                </div>
              </FormatCard>

              <FormatCard number="4" title="ABSTRACT VA KEYWORDS">
                <div className="space-y-2">
                  <RuleBlock title="Abstract.">Matn italic emas. 1 paragraf. 150–250 so‘z.<br />Satr oralig‘i 1.5.</RuleBlock>
                  <RuleBlock title="Keywords:" green>3–10 ta kalit so‘z vergul bilan ajratilgan.<br />Satr oralig‘i 1.5.</RuleBlock>
                </div>
              </FormatCard>

              <FormatCard number="5" title="BO‘LIMLAR Sarlavhasi" subtitle="HEADING STYLE">
                <p className="mb-2 text-xs font-semibold text-[#4b6074]">Asosiy bo‘limlar:</p>
                <ul className="space-y-1.5 text-xs">
                  {HEADINGS.map((heading, index) => (
                    <li key={heading} className="flex gap-2"><span className="text-[#123f7d]">•</span><strong>{heading}</strong>{index === 0 && <span className="text-[#5c6f80]">(Bold, 12 pt, matn bilan bir qatorda)</span>}</li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-[#d9e4ed] pt-2 text-[11px] leading-5 text-[#4b6074]">Heading uslubi: <strong>Bold.</strong><br />Barcha bo‘limlar matn ichida (chapdan boshlanadi). Raqamlanmaydi.</p>
              </FormatCard>

              <FormatCard number="6" title="LIST (RO‘YXAT) FORMATLARI">
                <div className="grid grid-cols-2 gap-2">
                  <ListBox title="Belgili ro‘yxat" subtitle="Bullet List" ordered={false} />
                  <ListBox title="Raqamli ro‘yxat" subtitle="Numbered List" ordered />
                </div>
              </FormatCard>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <FormatCard number="9" title="MAQOLA NAMUNASI (PREVIEW)" strong>
            <ArticlePreview />
          </FormatCard>

          <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(210px,.75fr)]">
            <FormatCard number="10" title="REFERENCES" subtitle="ADABIYOTLAR RO‘YXATI">
              <div className="grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
                <ul className="space-y-2 text-[11px] leading-5 text-[#334e66]">
                  <li>• Sarlavha: <strong>References</strong> (Bold, 12 pt, Center)</li>
                  <li>• Ro‘yxat raqamli (1., 2., 3., ...)</li>
                  <li>• Har bir manba: Hanging indent (1.25 cm)</li>
                  <li>• Font: Times New Roman, 12 pt</li>
                  <li>• Satr oralig‘i: 1.5</li>
                </ul>
                <ReferencePreview />
              </div>
            </FormatCard>

            <RulesChecklist />
          </div>

          <FormatCard number="11" title="EXPORT" subtitle="YUKLAB OLISH FORMATLARI">
            <ExportFormats />
          </FormatCard>
        </div>
      </div>

      <div className="mt-4">
        <SuccessNotice full>
          Foydalanuvchi 0 dan yozgan yoki tahrirlagan maqolasi eksport qilinganda – yuqoridagi barcha format va uslublarga avtomatik moslashishi kerak.
        </SuccessNotice>
      </div>
    </div>
  );
}

export function FormatCard({ number, title, subtitle, children, compact = false, strong = false }: { number: string; title: string; subtitle?: string; children: ReactNode; compact?: boolean; strong?: boolean }) {
  return (
    <section className="overflow-hidden rounded-md border border-[#b9d0e5] bg-white">
      <SectionHeader number={number} title={title} subtitle={subtitle} strong={strong} />
      <div className={compact ? "p-3" : "p-3 sm:p-3.5"}>{children}</div>
    </section>
  );
}

export function SectionHeader({ number, title, subtitle, strong = false }: { number: string; title: string; subtitle?: string; strong?: boolean }) {
  return (
    <div className={`flex items-center gap-2 border-b px-3 py-2 ${strong ? "border-[#123f7d] bg-[#123f7d] text-white" : "border-[#b9d0e5] bg-[#eef5fb] text-[#123f7d]"}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${strong ? "bg-white text-[#123f7d]" : "bg-[#123f7d] text-white"}`}>{number}</span>
      <h3 className="text-[11px] font-extrabold uppercase leading-tight tracking-[0.035em] sm:text-xs">{title}{subtitle && <span className="ml-1 font-semibold">({subtitle})</span>}</h3>
    </div>
  );
}

export function FormatRow({ icon, label, value }: { icon: IconName; label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[22px_minmax(0,.95fr)_minmax(0,1.05fr)] items-center gap-2 py-2 text-[11px] leading-4">
      <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#eef5fb] text-[#123f7d]"><GuideIcon name={icon} className="h-3.5 w-3.5" /></span>
      <span className="font-semibold text-[#334e66]">{label}:</span>
      <span className="font-bold text-[#172f49]">{value}</span>
    </div>
  );
}

export function ArticleStructure() {
  return (
    <ol className="space-y-1.5">
      {ARTICLE_STRUCTURE.map((item, index) => (
        <li key={item} className="flex items-center gap-2 text-[11px] leading-4">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#123f7d] text-[10px] font-bold text-white">{index + 1}</span>
          <span className="font-semibold text-[#2e475f]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function ArticlePreview() {
  return (
    <div className="bg-[#e9eef2] p-2.5">
      <div className="grid gap-3 md:grid-cols-2">
        <PreviewColumn label="1-SAHIFA NAMUNASI">
          <PreviewPage pageNumber="1">
            <div className="text-center">
              <h4 className="text-[8.5px] font-bold uppercase leading-[1.25] sm:text-[9.5px]">DESIGN AND SIMULATION PLANNING OF AN AI AND WEB-GIS INTEGRATED SYSTEM FOR REAL-TIME LOGISTICS ROUTE OPTIMIZATION</h4>
              <p className="mt-2 text-[8px] font-bold sm:text-[9px]">Kucharova Shaxlo Sobir qizi</p>
              <p className="mt-0.5 text-[7px] leading-[1.35] sm:text-[8px]">Doctorate (PhD) student Institute for advanced training of personnel and statistical research, Uzbekistan</p>
              <p className="mt-0.5 text-[7px] text-blue-700 underline sm:text-[8px]">E-mail: shaxlosobirovna06@gmail.com</p>
            </div>
            <PreviewParagraph heading="Abstract.">This study proposes the design and simulation of an integrated artificial intelligence and Web-GIS platform for real-time logistics route optimization. The model combines live traffic data, vehicle location, delivery constraints, and predictive analytics to improve route selection and operational visibility across transportation networks.</PreviewParagraph>
            <p className="text-justify text-[7px] leading-[1.5] sm:text-[8px]"><strong>Keywords:</strong> logistics, digital transformation, real-time monitoring, transportation, IoT, GPS, supply chain management, logistics analytics.</p>
            <PreviewParagraph heading="Introduction.">The rapid growth of e-commerce and urban freight movement has increased the demand for adaptive logistics systems. Conventional planning methods cannot always respond to congestion, weather, or changing customer priorities in real time. Integrating AI with spatial data provides a practical framework for dynamic routing and evidence-based transport decisions.</PreviewParagraph>
          </PreviewPage>
        </PreviewColumn>

        <PreviewColumn label="KEYINGI SAHIFALAR NAMUNASI">
          <PreviewPage pageNumber="2">
            <p className="text-justify text-[7px] leading-[1.5] indent-[7mm] sm:text-[8px]">Modern logistics platforms increasingly use predictive models to estimate travel time and select efficient routes. AI-based optimization can reduce empty mileage while responding to new delivery requests and unexpected traffic conditions (Badrinarayanan, 2024).</p>
            <p className="text-justify text-[7px] leading-[1.5] indent-[7mm] sm:text-[8px]">Web-GIS technologies connect analytical results with geographic context, allowing dispatchers to observe vehicle movement and compare alternative routes on an interactive map (Dikshit et al., 2023). IoT and GPS data further improve the timeliness of operational decisions (Sihotang et al., 2024).</p>
            <PreviewParagraph heading="Literature Review.">Recent studies emphasize the value of combining intelligent optimization with geospatial platforms. Existing solutions demonstrate improvements in delivery time, fuel consumption, and supply-chain transparency. However, many models analyze static datasets and provide limited support for continuous route recalculation under real-world operational constraints.</PreviewParagraph>
            <p className="text-justify text-[7px] leading-[1.5] indent-[7mm] sm:text-[8px]">The proposed architecture addresses this gap through a modular simulation environment that joins traffic feeds, vehicle telemetry, order priorities, and spatial network data within one decision-support workflow.</p>
          </PreviewPage>
        </PreviewColumn>
      </div>
    </div>
  );
}

export function ReferencePreview() {
  return (
    <div className="border border-[#c9d6e1] bg-[#fbfcfd] p-3 text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <h4 className="text-center text-[12px] font-bold">References</h4>
      <ol className="mt-2 space-y-2 text-[9px] leading-[1.5]">
        <li className="grid grid-cols-[14px_1fr]"><span>1.</span><span>Badrinarayanan, A. (2024). AI-driven optimization of last-mile delivery. <em>International Journal for Multidisciplinary Research.</em> <a className="text-blue-700 underline" href="https://doi.org/10.36948/ijfmr.2024.v06i06.31750">https://doi.org/10.36948/ijfmr.2024.v06i06.31750</a></span></li>
        <li className="grid grid-cols-[14px_1fr]"><span>2.</span><span>Banu, D. (2025). A scalable AI-driven framework for sustainable ride-sharing and intelligent logistics using advanced route optimization. <a className="text-blue-700 underline" href="https://doi.org/10.5281/zenodo.14987621">https://doi.org/10.5281/zenodo.14987621</a></span></li>
      </ol>
      <p className="mt-1 pl-[14px] text-[10px]">...</p>
    </div>
  );
}

export function RulesChecklist() {
  return (
    <section className="overflow-hidden rounded-md border border-[#9dccaa] bg-[#f2fbf4]">
      <div className="border-b border-[#9dccaa] bg-[#e5f5e9] px-3 py-2 text-center text-xs font-extrabold uppercase text-[#1f7a38]">ASOSIY QOIDALAR</div>
      <ul className="space-y-2 p-3">
        {RULES.map((rule) => (
          <li key={rule} className="flex items-start gap-2 text-[11px] font-semibold leading-4 text-[#28543a]"><span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1f7a38] text-white"><GuideIcon name="check" className="h-2.5 w-2.5" /></span>{rule}</li>
        ))}
      </ul>
    </section>
  );
}

export function ExportFormats() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {EXPORTS.map((format) => (
        <div key={format.extension} className="flex items-center justify-center gap-2 border-r-0 border-[#d4e0ea] px-2 py-1.5 sm:border-r sm:last:border-r-0">
          <span className={`flex h-9 w-8 items-center justify-center rounded-sm text-[9px] font-black text-white ${format.color}`}>{format.mark}</span>
          <span><strong className="block text-xs">{format.label}</strong><span className="block text-[10px] text-[#63788a]">({format.extension})</span></span>
        </div>
      ))}
    </div>
  );
}

export function SuccessNotice({ children, full = false }: { children: ReactNode; full?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-md border border-[#9dccaa] bg-white px-3 py-2.5 text-xs leading-5 ${full ? "font-semibold text-[#28543a]" : "text-center sm:justify-center"}`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1f7a38] text-white"><GuideIcon name="check" className="h-3.5 w-3.5" /></span>
      <p>{children}</p>
    </div>
  );
}

function RuleBlock({ title, children, green = false }: { title: string; children: ReactNode; green?: boolean }) {
  return <div className={`border p-2.5 text-xs leading-5 ${green ? "border-[#b6d9bf] bg-[#f2fbf4]" : "border-[#d2e0eb] bg-[#f8fbfd]"}`}><strong className={green ? "text-[#1f7a38]" : "text-[#123f7d]"}>{title}</strong><p className="mt-0.5 text-[#405970]">{children}</p></div>;
}

function ListBox({ title, subtitle, ordered }: { title: string; subtitle: string; ordered: boolean }) {
  const items = ["Matn 1", "Matn 2", "Matn 3"];
  return <div className="border border-[#d2e0eb] bg-[#f8fbfd] p-2.5"><p className="text-[10px] font-bold text-[#123f7d]">{title}</p><p className="text-[9px] text-[#6b7e8d]">({subtitle})</p>{ordered ? <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px]">{items.map((item) => <li key={item}>{item}</li>)}</ol> : <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px]">{items.map((item) => <li key={item}>{item}</li>)}</ul>}</div>;
}

function PreviewColumn({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-0"><div className="mb-2 rounded-sm bg-[#1f7a38] px-2 py-1.5 text-center text-[10px] font-extrabold tracking-wide text-white">{label}</div>{children}</div>;
}

function PreviewPage({ pageNumber, children }: { pageNumber: string; children: ReactNode }) {
  return <article className="relative mx-auto aspect-[210/297] w-full overflow-hidden border border-[#b9c3cb] bg-white px-[9.5%] pb-[9%] pt-[8%] text-black shadow-[0_2px_8px_rgba(20,45,70,.12)]" style={{ fontFamily: "'Times New Roman', Times, serif" }}><div className="space-y-2">{children}</div><span className="absolute bottom-[3.7%] left-1/2 -translate-x-1/2 text-[8px]">{pageNumber}</span></article>;
}

function PreviewParagraph({ heading, children }: { heading: string; children: ReactNode }) {
  return <p className="text-justify text-[7px] leading-[1.5] sm:text-[8px]"><strong>{heading}</strong> {children}</p>;
}

function GuideIcon({ name, className }: { name: IconName; className?: string }) {
  const icons: Record<IconName, ReactNode> = {
    paper: <><path d="M6 2.5h9l3 3v16H6z" /><path d="M15 2.5v3h3" /></>,
    portrait: <><rect x="6" y="3" width="12" height="18" rx="1" /><path d="M9 6h6" /></>,
    margin: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M7 4v16M17 4v16" /></>,
    type: <><path d="M5 5h14M12 5v14M8 19h8" /></>,
    spacing: <><path d="M7 5h12M7 12h12M7 19h12M3 5v14m0-14L1.5 7M3 5l1.5 2M3 19l-1.5-2M3 19l1.5-2" /></>,
    align: <><path d="M4 6h16M4 10h11M4 14h16M4 18h9" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" /></>,
    page: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M10 17h4" /></>,
    document: <><path d="M6 2.5h9l3 3v16H6z" /><path d="M9 10h6M9 14h6" /></>,
    quote: <><path d="M9 10H5a2 2 0 0 0-2 2v4h6zM21 10h-4a2 2 0 0 0-2 2v4h6z" /></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 20h14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}
