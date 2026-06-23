import Link from "next/link";
import { redirect } from "next/navigation";
import { Monitor, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { drawRafflePrizeAction } from "@/features/raffle/actions";
import { getRaffleDashboard } from "@/features/raffle/queries";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type RafflePageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function RafflePage({ params, searchParams }: RafflePageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;
  const { error, success } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const raffle = await getRaffleDashboard(event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}`}>
              Back to event
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Raffle control</h1>
            <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
              href={`/stage/${event.id}?token=${event.stageToken}`}
              target="_blank"
            >
              <Monitor className="size-4" aria-hidden="true" />
              Stage display
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
              href={`/dashboard/events/${event.id}/raffle/prizes/new`}
            >
              <Plus className="size-4" aria-hidden="true" />
              New prize
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Eligible checked in" value={raffle.eligibleCheckedInCount.toLocaleString()} />
          <Metric label="Available pool" value={raffle.availableCandidateCount.toLocaleString()} />
          <Metric label="Prizes" value={raffle.prizes.length.toLocaleString()} />
          <Metric label="Winners" value={raffle.winners.length.toLocaleString()} />
        </div>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {success ? (
          <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Winner drawn and saved.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="space-y-4">
            {raffle.prizes.map((prize) => {
              const remaining = prize.quantity - prize._count.winners;
              const draw = drawRafflePrizeAction.bind(null, event.id, prize.id);

              return (
                <article key={prize.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Trophy className="size-5 text-amber-700" aria-hidden="true" />
                        <h2 className="text-xl font-semibold text-zinc-950">{prize.name}</h2>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {prize.description || "No description."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                        <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700">
                          {prize._count.winners}/{prize.quantity} drawn
                        </span>
                        <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-zinc-700">
                          {prize._count.draws} draws
                        </span>
                        {prize.sponsor ? (
                          <span className="rounded-md bg-amber-100 px-2.5 py-1 text-amber-900">
                            {prize.sponsor.name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <form action={draw}>
                      <Button type="submit" disabled={remaining <= 0 || raffle.availableCandidateCount <= 0}>
                        Draw winner
                      </Button>
                    </form>
                  </div>
                </article>
              );
            })}
            {raffle.prizes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
                No prizes yet.
              </div>
            ) : null}
          </section>

          <aside className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Winner history</h2>
            <div className="mt-4 space-y-3">
              {raffle.winners.map((winner) => (
                <div key={winner.id} className="rounded-md border border-zinc-200 p-4">
                  <p className="font-medium text-zinc-950">{winner.attendee.fullName}</p>
                  <p className="mt-1 text-sm text-zinc-500">{winner.prize.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {winner.attendee.email ?? winner.attendee.ticketCode ?? "No contact"} · Lottery{" "}
                    {winner.attendee.lotteryNumber ?? "n/a"}
                  </p>
                </div>
              ))}
              {raffle.winners.length === 0 ? (
                <p className="text-sm text-zinc-500">No winners drawn yet.</p>
              ) : null}
            </div>
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
