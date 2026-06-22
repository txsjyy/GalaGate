import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { requireCurrentOrganization } from "@/features/events/queries";

export default async function EventsPage() {
  const context = await requireCurrentOrganization();

  if (!context) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
        <section className="mx-auto max-w-5xl rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
          Start PostgreSQL and seed the database before managing events.
        </section>
      </main>
    );
  }

  if (!context.permissions.canViewAnalytics) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-zinc-500">{context.organization.name}</p>
            <h1 className="mt-2 text-4xl font-semibold text-zinc-950">Events</h1>
          </div>
          {context.permissions.canManageEvents ? (
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
              href="/dashboard/events/new"
            >
              <Plus className="size-4" aria-hidden="true" />
              New event
            </Link>
          ) : null}
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="divide-y divide-zinc-200">
            {context.events.map((event) => {
              const checkInRate =
                event.attendeeCount === 0 ? 0 : Math.round((event.checkInCount / event.attendeeCount) * 100);

              return (
                <Link
                  key={event.id}
                  className="grid gap-4 px-5 py-4 transition hover:bg-zinc-50 md:grid-cols-[1fr_120px_120px_120px]"
                  href={`/dashboard/events/${event.id}`}
                >
                  <div>
                    <p className="font-medium text-zinc-950">{event.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{event.slug}</p>
                  </div>
                  <p className="text-sm text-zinc-600">{event.status}</p>
                  <p className="text-sm text-zinc-600">{event.attendeeCount} guests</p>
                  <p className="text-sm text-zinc-600">{checkInRate}% checked in</p>
                </Link>
              );
            })}
            {context.events.length === 0 ? (
              <div className="px-5 py-8 text-sm text-zinc-500">No events yet.</div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
