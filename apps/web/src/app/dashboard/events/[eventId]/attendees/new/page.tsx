import Link from "next/link";
import { redirect } from "next/navigation";
import { createAttendeeAction } from "@/features/attendees/actions";
import { AttendeeForm } from "@/features/attendees/components/attendee-form";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type NewAttendeePageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewAttendeePage({ params, searchParams }: NewAttendeePageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;
  const { error } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}/attendees`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const createAttendee = createAttendeeAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <Link
          className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
          href={`/dashboard/events/${event.id}/attendees`}
        >
          Back to attendees
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase text-zinc-500">Manual entry</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Add attendee</h1>
          <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
          <div className="mt-8">
            <AttendeeForm action={createAttendee} error={error} />
          </div>
        </div>
      </section>
    </main>
  );
}
