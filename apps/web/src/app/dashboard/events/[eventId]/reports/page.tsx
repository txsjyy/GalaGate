import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";
import { getReportsForEvent } from "@/features/reports/queries";

type ReportsPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function ReportsPage({ params }: ReportsPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const reports = await getReportsForEvent(event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}`}>
              Back to event
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Event recap reports</h1>
            <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            href={`/dashboard/events/${event.id}/reports/new`}
          >
            <Plus className="size-4" aria-hidden="true" />
            Generate recap
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          {reports.map((report) => (
            <Link
              key={report.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:bg-zinc-50"
              href={`/dashboard/events/${event.id}/reports/${report.id}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-950">{report.title}</h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {report.model ?? "Unknown model"} · {report.promptVersion ?? "Unknown prompt"} ·{" "}
                    {report.generatedAt.toLocaleString()}
                  </p>
                </div>
                <span className="w-fit rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                  {report.status}
                </span>
              </div>
            </Link>
          ))}
          {reports.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">
              No recap reports yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
