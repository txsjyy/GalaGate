import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";
import { getSponsorsForEvent } from "@/features/sponsors/queries";

type SponsorsPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function SponsorsPage({ params }: SponsorsPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const sponsors = await getSponsorsForEvent(event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}`}>
              Back to event
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-zinc-950">Sponsors</h1>
            <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            href={`/dashboard/events/${event.id}/sponsors/new`}
          >
            <Plus className="size-4" aria-hidden="true" />
            New sponsor
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sponsors.map((sponsor) => (
            <Link
              key={sponsor.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:bg-zinc-50"
              href={`/dashboard/events/${event.id}/sponsors/${sponsor.id}/edit`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-950">{sponsor.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{sponsor.tier ?? "No tier"}</p>
                </div>
                <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                  {sponsor._count.prizes} prizes
                </span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">
                {sponsor.displayCopy || "No display copy yet."}
              </p>
              {sponsor.websiteUrl ? <p className="mt-4 text-sm text-zinc-500">{sponsor.websiteUrl}</p> : null}
            </Link>
          ))}
          {sponsors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">
              No sponsors yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
