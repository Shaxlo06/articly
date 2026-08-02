import { getCurrentUser } from "@/lib/session";
import { PlanSwitcher } from "@/components/PlanSwitcher";

export default async function AccountPage() {
  const user = await getCurrentUser();
  const sub = user.subscription;

  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Account</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">{user.name}</h1>
        <p className="text-muted mt-1">{user.email} · {user.field}</p>
      </div>

      <div>
        <h2 className="font-serif text-lg font-semibold mb-4">Plan</h2>
        {sub && <PlanSwitcher current={sub.plan} />}
        <p className="text-xs text-muted mt-3">
          Demo only — plan changes apply instantly here instead of going through a real billing provider.
        </p>
      </div>

      {sub && (
        <div>
          <h2 className="font-serif text-lg font-semibold mb-4">Usage this month</h2>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Humanize runs" value={sub.humanizeRunsThisMonth} />
            <Stat label="Translations" value={sub.translateRunsThisMonth} />
            <Stat label="Plagiarism checks" value={sub.plagiarismChecksThisMonth} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-2xl font-serif font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
