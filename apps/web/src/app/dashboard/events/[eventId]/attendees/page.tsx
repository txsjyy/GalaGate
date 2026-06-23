import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Plus, Upload } from "lucide-react";
import { getAttendeesForEvent } from "@/features/attendees/queries";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";
import { RealtimeEventListener } from "@/features/realtime/realtime-event-listener";

type AttendeesPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function AttendeesPage({ params, searchParams }: AttendeesPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;
  const { q } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const attendees = await getAttendeesForEvent(event.id, q);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}`}>
              Back to event
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Attendees</h1>
            <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
            <div className="mt-4">
              <RealtimeEventListener eventId={event.id} stageToken={event.stageToken} />
            </div>
          </div>
          {context.permissions.canManageEvents ? (
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
                href={`/dashboard/events/${event.id}/attendees/import`}
              >
                <Upload className="size-4" aria-hidden="true" />
                Import CSV
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
                href={`/dashboard/events/${event.id}/attendees/export`}
              >
                <Download className="size-4" aria-hidden="true" />
                Export
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
                href={`/dashboard/events/${event.id}/attendees/new`}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add attendee
              </Link>
            </div>
          ) : null}
        </div>

        <form className="mt-8 flex max-w-xl gap-3">
          <input
            className="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
            name="q"
            placeholder="Search name, email, or ticket code"
            defaultValue={q}
          />
          <button className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-100">
            Search
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.3fr_1.5fr_1fr_1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase text-zinc-500">
            <span>Name</span>
            <span>Email</span>
            <span>Ticket</span>
            <span>Lottery</span>
            <span>Source</span>
            <span>Check-in</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                className="grid grid-cols-[1.3fr_1.5fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-4 text-sm text-zinc-700"
              >
                <span className="font-medium text-zinc-950">{attendee.fullName}</span>
                <span>{attendee.email ?? "No email"}</span>
                <span>{attendee.ticketCode ?? attendee.ticketType}</span>
                <span>{attendee.lotteryEligible ? attendee.lotteryNumber ?? "Eligible" : "Not eligible"}</span>
                <span>{attendee.source}</span>
                <span>{attendee.checkInRecords.length > 0 ? "Checked in" : "Pending"}</span>
              </div>
            ))}
            {attendees.length === 0 ? (
              <div className="px-5 py-8 text-sm text-zinc-500">No attendees found.</div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
