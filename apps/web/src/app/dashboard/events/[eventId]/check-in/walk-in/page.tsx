import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createWalkInCheckInAction } from "@/features/check-in/actions";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type WalkInPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function WalkInPage({ params, searchParams }: WalkInPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId } = await params;
  const { error } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canRunCheckIn) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const createWalkIn = createWalkInCheckInAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
          href={`/dashboard/events/${event.id}/check-in`}
        >
          Back to check-in
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase text-zinc-500">Walk-in guest</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Create and check in</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Use this for guests who did not preregister. The attendee is created and checked in in one step.
          </p>

          {error ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <form action={createWalkIn} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Full name</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
                name="fullName"
                required
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Email</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
                  name="email"
                  type="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Phone</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
                  name="phone"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Ticket type</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
                name="ticketType"
                defaultValue="Walk-in"
                required
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
              <input className="size-4" name="lotteryEligible" type="checkbox" defaultChecked />
              Eligible for raffle
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Notes</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
                name="notes"
              />
            </label>

            <div className="flex justify-end">
              <Button type="submit">Create and check in</Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
