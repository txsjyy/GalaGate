import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { archiveEventAction, updateEventAction } from "@/features/events/actions";
import { EventForm } from "@/features/events/components/event-form";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type EventSettingsPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EventSettingsPage({ params, searchParams }: EventSettingsPageProps) {
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
  const updateEvent = updateEventAction.bind(null, event.id);
  const archiveEvent = archiveEventAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}`}>
          Back to event
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase text-zinc-500">Event settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">{event.name}</h1>
          <div className="mt-8">
            <EventForm
              action={updateEvent}
              error={error}
              submitLabel="Save changes"
              defaultValues={{
                name: event.name,
                slug: event.slug,
                description: event.description,
                venue: event.venue,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                timezone: event.timezone,
                status: event.status,
              }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-700">Archive event</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Archived events are removed from active operations but remain available for historical reports.
          </p>
          <form action={archiveEvent} className="mt-4">
            <Button variant="outline" type="submit">
              Archive event
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
