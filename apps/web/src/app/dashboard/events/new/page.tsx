import Link from "next/link";
import { redirect } from "next/navigation";
import { EventForm } from "@/features/events/components/event-form";
import { createEventAction } from "@/features/events/actions";
import { requireCurrentOrganization } from "@/features/events/queries";

type NewEventPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const context = await requireCurrentOrganization();
  const { error } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect("/dashboard/events");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href="/dashboard/events">
          Back to events
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase text-zinc-500">Create event</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">New event workspace</h1>
          <div className="mt-8">
            <EventForm action={createEventAction} error={error} submitLabel="Create event" />
          </div>
        </div>
      </section>
    </main>
  );
}
