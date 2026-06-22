import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { importAttendeesAction } from "@/features/attendees/actions";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type ImportAttendeesPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ImportAttendeesPage({ params, searchParams }: ImportAttendeesPageProps) {
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
  const importAttendees = importAttendeesAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
          href={`/dashboard/events/${event.id}/attendees`}
        >
          Back to attendees
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase text-zinc-500">CSV import</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Import attendees</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Upload a CSV with columns such as fullName, email, phone, ticketType, ticketCode, lotteryNumber,
            lotteryEligible, and notes.
          </p>

          {error ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <form action={importAttendees} className="mt-8 space-y-5">
            <input
              className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
              name="file"
              type="file"
              accept=".csv,text/csv"
              required
            />
            <div className="flex justify-end">
              <Button type="submit">Import CSV</Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
