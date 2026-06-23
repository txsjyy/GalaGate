import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, Trophy, UsersRound } from "lucide-react";
import { getEventAnalytics } from "@/features/analytics/queries";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type AnalyticsPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const analytics = await getEventAnalytics(event.id);

  if (!analytics) {
    notFound();
  }

  const maxTimelineCount = Math.max(...analytics.attendance.checkInTimeline.map((point) => point.count), 1);
  const maxTicketCount = Math.max(...analytics.attendance.ticketTypeBreakdown.map((group) => group.registered), 1);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}`}>
              Back to event
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Analytics</h1>
            <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm">
            {event.status}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Registered" value={analytics.attendance.totalRegistered.toLocaleString()} />
          <Metric label="Checked in" value={analytics.attendance.totalCheckedIn.toLocaleString()} />
          <Metric label="Check-in rate" value={`${analytics.attendance.checkInRate}%`} />
          <Metric label="Raffle winners" value={analytics.raffle.winnerCount.toLocaleString()} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-zinc-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-zinc-950">Check-in timeline</h2>
            </div>
            <div className="mt-6 space-y-4">
              {analytics.attendance.checkInTimeline.map((point) => (
                <TimelineBar
                  key={point.hour}
                  label={new Date(point.hour).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                  })}
                  count={point.count}
                  percentage={(point.count / maxTimelineCount) * 100}
                />
              ))}
              {analytics.attendance.checkInTimeline.length === 0 ? (
                <p className="text-sm text-zinc-500">No check-ins have been recorded yet.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <UsersRound className="size-5 text-zinc-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-zinc-950">Ticket types</h2>
            </div>
            <div className="mt-6 space-y-4">
              {analytics.attendance.ticketTypeBreakdown.map((group) => (
                <TicketTypeRow
                  key={group.ticketType}
                  group={group}
                  registeredPercentage={(group.registered / maxTicketCount) * 100}
                />
              ))}
              {analytics.attendance.ticketTypeBreakdown.length === 0 ? (
                <p className="text-sm text-zinc-500">No attendees have been added yet.</p>
              ) : null}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-zinc-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-zinc-950">Raffle summary</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniMetric label="Prizes" value={analytics.raffle.prizeCount.toLocaleString()} />
              <MiniMetric label="Completed draws" value={analytics.raffle.drawCount.toLocaleString()} />
              <MiniMetric label="Winners" value={analytics.raffle.winnerCount.toLocaleString()} />
            </div>
            <div className="mt-6 divide-y divide-zinc-100">
              {analytics.raffle.prizes.map((prize) => (
                <div key={prize.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-950">{prize.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {prize.sponsor ? `Sponsor: ${prize.sponsor.name}` : "No sponsor"} · {prize.drawCount} draws
                    </p>
                  </div>
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    {prize.winnerCount}/{prize.quantity} winners
                  </span>
                </div>
              ))}
              {analytics.raffle.prizes.length === 0 ? <p className="py-3 text-sm text-zinc-500">No raffle prizes yet.</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Sponsor summary</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniMetric label="Total sponsors" value={analytics.sponsors.totalSponsors.toLocaleString()} />
              <MiniMetric label="Prize sponsors" value={analytics.raffle.prizes.filter((prize) => prize.sponsor).length.toString()} />
            </div>
            <div className="mt-6 space-y-3">
              {analytics.sponsors.byTier.map((tier) => (
                <div key={tier.tier} className="flex items-center justify-between rounded-md border border-zinc-100 px-3 py-2">
                  <span className="text-sm font-medium text-zinc-700">{tier.tier}</span>
                  <span className="text-sm text-zinc-500">{tier.count}</span>
                </div>
              ))}
              {analytics.sponsors.byTier.length === 0 ? <p className="text-sm text-zinc-500">No sponsors yet.</p> : null}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Attendee sources</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analytics.attendance.attendeeSources.map((source) => (
              <MiniMetric key={source.source} label={source.source.replaceAll("_", " ")} value={source.count.toLocaleString()} />
            ))}
            {analytics.attendance.attendeeSources.length === 0 ? (
              <p className="text-sm text-zinc-500">No attendee source data yet.</p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50 px-4 py-3">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function TimelineBar({ label, count, percentage }: { label: string; count: number; percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="text-zinc-500">{count}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-zinc-100">
        <div className="h-2 rounded-full bg-zinc-950" style={{ width: `${Math.max(percentage, 4)}%` }} />
      </div>
    </div>
  );
}

function TicketTypeRow({
  group,
  registeredPercentage,
}: {
  group: {
    ticketType: string;
    registered: number;
    checkedIn: number;
  };
  registeredPercentage: number;
}) {
  const rate = group.registered === 0 ? 0 : Math.round((group.checkedIn / group.registered) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-700">{group.ticketType}</span>
        <span className="text-zinc-500">
          {group.checkedIn}/{group.registered} · {rate}%
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-zinc-100">
        <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.max(registeredPercentage, 4)}%` }} />
      </div>
    </div>
  );
}
