import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getEventAnalytics } from "@/features/analytics/queries";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";
import { generateEventRecapAction } from "@/features/reports/actions";
import { Button } from "@/components/ui/button";

type NewReportPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewReportPage({ params, searchParams }: NewReportPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;
  const { error } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const analytics = await getEventAnalytics(event.id);
  const generateReport = generateEventRecapAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}/reports`}>
          Back to reports
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-amber-100 text-amber-950">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase text-zinc-500">AI Event Recap</p>
                <h1 className="text-3xl font-semibold text-zinc-950">Generate recap draft</h1>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-zinc-600">
              The model receives aggregated event analytics only. It does not receive raw attendee names, emails, or ticket
              codes.
            </p>

            {error ? (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            <form action={generateReport} className="mt-8">
              <Button type="submit" className="gap-2">
                <Sparkles className="size-4" aria-hidden="true" />
                Generate draft
              </Button>
            </form>
          </section>

          <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Input snapshot</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <Metric label="Registered" value={analytics?.attendance.totalRegistered.toLocaleString() ?? "0"} />
              <Metric label="Checked in" value={analytics?.attendance.totalCheckedIn.toLocaleString() ?? "0"} />
              <Metric label="Check-in rate" value={`${analytics?.attendance.checkInRate ?? 0}%`} />
              <Metric label="Raffle winners" value={analytics?.raffle.winnerCount.toLocaleString() ?? "0"} />
              <Metric label="Sponsors" value={analytics?.sponsors.totalSponsors.toLocaleString() ?? "0"} />
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 font-semibold text-zinc-950">{value}</dd>
    </div>
  );
}
