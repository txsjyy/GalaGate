import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Search, Ticket, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkInAttendeeAction } from "@/features/check-in/actions";
import { searchCheckInAttendees } from "@/features/check-in/queries";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";
import { RealtimeEventListener } from "@/features/realtime/realtime-event-listener";

type CheckInPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    q?: string;
    error?: string;
    success?: string;
  }>;
};

export default async function CheckInPage({ params, searchParams }: CheckInPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;
  const { q, error, success } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canRunCheckIn) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const attendees = await searchCheckInAttendees(event.id, q);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}`}>
              Back to event
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-950 sm:text-4xl">Staff check-in</h1>
            <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
            <div className="mt-4">
              <RealtimeEventListener eventId={event.id} stageToken={event.stageToken} />
            </div>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="font-semibold text-zinc-950">{event._count.checkIns}</span>
            <span className="text-zinc-500"> / {event._count.attendees} checked in</span>
          </div>
        </div>

        <form className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="q">
            Search by name, email, or ticket code
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="q"
              name="q"
              className="h-12 flex-1 rounded-md border border-zinc-300 px-4 text-base outline-none focus:border-zinc-950"
              placeholder="ada@example.com"
              defaultValue={q}
              autoFocus
            />
            <Button className="h-12 sm:w-32" type="submit">
              <Search className="mr-2 size-4" aria-hidden="true" />
              Search
            </Button>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {success ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Attendee checked in successfully.
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {attendees.map((attendee) => {
            const checkedIn = attendee.checkInRecords[0];
            const checkIn = checkInAttendeeAction.bind(null, event.id, attendee.id);

            return (
              <article key={attendee.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {checkedIn ? (
                        <CheckCircle2 className="size-5 text-emerald-700" aria-hidden="true" />
                      ) : (
                        <XCircle className="size-5 text-zinc-400" aria-hidden="true" />
                      )}
                      <h2 className="text-xl font-semibold text-zinc-950">{attendee.fullName}</h2>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{attendee.email ?? attendee.phone ?? "No contact info"}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700">{attendee.ticketType}</span>
                      <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700">{attendee.source}</span>
                      {attendee.ticketCode ? (
                        <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700">{attendee.ticketCode}</span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-amber-900">
                        <Ticket className="size-3.5" aria-hidden="true" />
                        {attendee.lotteryEligible
                          ? `Lottery ${attendee.lotteryNumber ?? "eligible"}`
                          : "No lottery"}
                      </span>
                    </div>
                  </div>

                  <div className="sm:min-w-44">
                    {checkedIn ? (
                      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        <p className="font-semibold">Already checked in</p>
                        <p className="mt-1">{checkedIn.checkedInAt.toLocaleString()}</p>
                      </div>
                    ) : (
                      <form action={checkIn}>
                        <Button className="h-12 w-full" type="submit">
                          Check in
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {q && attendees.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-zinc-500">No matching attendees found.</p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
                href={`/dashboard/events/${event.id}/check-in/walk-in`}
              >
                Create walk-in guest
              </Link>
            </div>
          ) : null}
          {!q ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
              Search an attendee to begin check-in.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
