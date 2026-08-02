export interface Step {
  key: string;
  label: string;
}

export function Stepper({ steps, current }: { steps: Step[]; current: string }) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <ol className="flex flex-wrap gap-2 text-xs font-semibold">
      {steps.map((step, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={step.key}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${
              state === "current"
                ? "border-accent-strong bg-accent-soft"
                : state === "done"
                  ? "border-border-strong bg-silver-wash text-muted"
                  : "border-border text-muted"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${
                state === "current" ? "bg-accent text-ink-fixed" : state === "done" ? "bg-border-strong" : "border border-border"
              }`}
            >
              {state === "done" ? "✓" : i + 1}
            </span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
