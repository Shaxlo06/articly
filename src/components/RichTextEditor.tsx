"use client";

import { useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";

const HEADING_OPTIONS = [
  { value: "normal", label: "Normal matn" },
  { value: "1", label: "H1" },
  { value: "2", label: "H2" },
  { value: "3", label: "H3" },
] as const;

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`h-8 min-w-8 px-1.5 rounded-md flex items-center justify-center text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? "bg-accent-soft text-accent-strong" : "text-foreground hover:bg-tint"
      }`}
    >
      {children}
    </button>
  );
}

function UrlPopover({ label, onSubmit }: { label: string; onSubmit: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <ToolbarButton onClick={() => setOpen((v) => !v)} label={label}>
        {label === "Havola" ? <LinkIcon /> : <ImageIcon />}
      </ToolbarButton>
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSubmit(value.trim());
            setValue("");
            setOpen(false);
          }}
          className="absolute left-0 top-full mt-1 z-20 flex gap-1 rounded-md border border-border bg-surface p-1.5 shadow-lg"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://..."
            className="w-48 rounded border border-border-strong px-2 py-1 text-xs outline-none focus:border-accent-strong"
          />
          <button type="submit" className="rounded bg-accent px-2 text-xs font-semibold text-ink-fixed">
            Qo&apos;sh
          </button>
        </form>
      )}
    </div>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8H4V5" />
      <path d="M4 8c1.8-2.8 4.8-4.5 8-4.5a8.5 8.5 0 1 1-8.2 10.5" />
    </svg>
  );
}
function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h3V5" />
      <path d="M20 8c-1.8-2.8-4.8-4.5-8-4.5a8.5 8.5 0 1 0 8.2 10.5" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function OrderedListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <text x="1" y="8" fontSize="6" fill="currentColor" stroke="none">1</text>
      <text x="1" y="14" fontSize="6" fill="currentColor" stroke="none">2</text>
      <text x="1" y="20" fontSize="6" fill="currentColor" stroke="none">3</text>
    </svg>
  );
}
function AlignIcon({ align }: { align: "left" | "center" | "right" | "justify" }) {
  const lines: Record<string, string> = {
    left: "M4 6h16M4 12h10M4 18h14",
    center: "M4 6h16M7 12h10M5 18h14",
    right: "M4 6h16M10 12h10M6 18h14",
    justify: "M4 6h16M4 12h16M4 18h16",
  };
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={lines[align]} />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5l1.4-1.4a3.5 3.5 0 0 1 5 5L16 11.5M13 17.5l-1.4 1.4a3.5 3.5 0 0 1-5-5L8 12.5" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 3 3 4-4 4 4" />
    </svg>
  );
}
function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
      <path d="M3.5 10h17M3.5 15h17M10 4.5v15" />
    </svg>
  );
}
function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8.5A2.5 2.5 0 0 0 4.5 11v2A2.5 2.5 0 0 0 7 15.5V17a2.5 2.5 0 0 1-2.5 2.5" />
      <path d="M16 8.5a2.5 2.5 0 0 0-2.5 2.5v2a2.5 2.5 0 0 0 2.5 2.5V17a2.5 2.5 0 0 1-2.5 2.5" />
    </svg>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : "normal";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo">
        <UndoIcon />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo">
        <RedoIcon />
      </ToolbarButton>

      <select
        value={headingValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "normal") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().setHeading({ level: Number(v) as 1 | 2 | 3 }).run();
        }}
        className="h-8 rounded-md border border-border-strong bg-surface px-1.5 text-xs font-medium mx-1"
      >
        {HEADING_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold">
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic">
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline">
        <span className="underline">U</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">
        <ListIcon />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">
        <OrderedListIcon />
      </ToolbarButton>

      {(["left", "center", "right", "justify"] as const).map((align) => (
        <ToolbarButton
          key={align}
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
          active={editor.isActive({ textAlign: align })}
          label={`Align ${align}`}
        >
          <AlignIcon align={align} />
        </ToolbarButton>
      ))}

      <UrlPopover label="Havola" onSubmit={(url) => editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()} />
      <UrlPopover label="Rasm" onSubmit={(url) => editor.chain().focus().setImage({ src: url }).run()} />

      <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} label="Jadval">
        <TableIcon />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Iqtibos">
        <QuoteIcon />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  content,
  onUpdate,
  onBlur,
  placeholder,
}: {
  content: string;
  onUpdate: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose-editor min-h-32 outline-none px-3 py-2.5 text-sm",
      },
    },
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // `content` is only used to seed the editor once, by useEditor's own
  // `content` option — the caller passes a stable, already-migrated initial
  // value (see SectionEditor), so no re-sync effect is needed here.
  if (!editor) return null;

  return (
    <div className="rounded-md border border-border-strong overflow-hidden bg-surface">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
