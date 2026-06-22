import Link from "next/link";
import { redirect } from "next/navigation";
import { createRafflePrizeAction } from "@/features/raffle/actions";
import { RafflePrizeForm } from "@/features/raffle/components/raffle-prize-form";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type NewPrizePageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewPrizePage({ params, searchParams }: NewPrizePageProps) {
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
  const createPrize = createRafflePrizeAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-950" href={`/dashboard/events/${event.id}/raffle`}>
          Back to raffle
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase text-zinc-500">Raffle prize</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Create prize</h1>
          <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
          <div className="mt-8">
            <RafflePrizeForm action={createPrize} error={error} />
          </div>
        </div>
      </section>
    </main>
  );
}
