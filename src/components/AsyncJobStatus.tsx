const LABEL: Record<string, string> = {
  QUEUED: "Queued…",
  PROCESSING: "Working on it…",
  FAILED: "Something went wrong",
};

export function AsyncJobStatus({ status, error }: { status: string; error?: string | null }) {
  if (status === "COMPLETED") return null;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
        status === "FAILED" ? "border-accent-strong bg-accent-soft" : "border-border bg-silver-wash"
      }`}
    >
      {status !== "FAILED" && (
        <span className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin motion-reduce:animate-none" />
      )}
      <div>
        <p className="font-semibold">{LABEL[status] ?? status}</p>
        {status === "FAILED" && error && <p className="text-muted mt-0.5">{error}</p>}
      </div>
    </div>
  );
}
