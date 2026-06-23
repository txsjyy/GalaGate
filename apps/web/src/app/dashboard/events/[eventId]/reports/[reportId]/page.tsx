import Link from "next/link";
import { redirect } from "next/navigation";
import { Save } from "lucide-react";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";
import { saveReportAction } from "@/features/reports/actions";
import { getReportForEvent } from "@/features/reports/queries";
import { Button } from "@/components/ui/button";

type ReportPageProps = {
  params: Promise<{
    eventId: string;
    reportId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId, reportId } = await params;
  const { error, saved } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const report = await getReportForEvent(event.id, reportId);
  const saveReport = saveReportAction.bind(null, event.id, report.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}/reports`}>
          Back to reports
        </Link>

        <form action={saveReport} className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase text-zinc-500">Recap report</p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-950">{report.title}</h1>
              <p className="mt-2 text-sm text-zinc-500">
                {report.status} · {report.model ?? "Unknown model"} · {report.generatedAt.toLocaleString()}
              </p>
            </div>
            <Button type="submit" className="gap-2">
              <Save className="size-4" aria-hidden="true" />
              Save final
            </Button>
          </div>

          {error ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          {saved ? (
            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Report saved.
            </div>
          ) : null}

          <label className="mt-8 block">
            <span className="text-sm font-medium text-zinc-700">Title</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
              name="title"
              defaultValue={report.title}
              required
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-zinc-700">Markdown</span>
            <textarea
              className="mt-2 min-h-[620px] w-full rounded-md border border-zinc-300 px-3 py-3 font-mono text-sm leading-6 outline-none focus:border-zinc-950"
              name="markdown"
              defaultValue={report.markdown}
              required
            />
          </label>
        </form>
      </section>
    </main>
  );
}
