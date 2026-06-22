import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;

  if (!context) {
    redirect("/dashboard");
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const checkInRate =
    event._count.attendees === 0 ? 0 : Math.round((event._count.checkIns / event._count.attendees) * 100);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href="/dashboard/events">
              Back to events
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-zinc-950">{event.name}</h1>
            <p className="mt-2 text-sm text-zinc-500">{event.venue ?? "Venue not set"}</p>
          </div>
          {context.permissions.canManageEvents ? (
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
              href={`/dashboard/events/${event.id}/settings`}
            >
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <Metric label="Status" value={event.status} />
          <Metric label="Registered" value={event._count.attendees.toLocaleString()} />
          <Metric label="Checked in" value={event._count.checkIns.toLocaleString()} />
          <Metric label="Check-in rate" value={`${checkInRate}%`} />
          <Metric label="Reports" value={event._count.reports.toLocaleString()} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Operational notes</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {event.description || "No event description has been added yet."}
            </p>
          </section>
          <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Schedule</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">Starts</dt>
                <dd className="font-medium text-zinc-950">{event.startsAt.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Ends</dt>
                <dd className="font-medium text-zinc-950">{event.endsAt?.toLocaleString() ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Timezone</dt>
                <dd className="font-medium text-zinc-950">{event.timezone}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
