import Link from "next/link";
import { redirect } from "next/navigation";
import { createSponsorAction } from "@/features/sponsors/actions";
import { SponsorForm } from "@/features/sponsors/components/sponsor-form";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type NewSponsorPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewSponsorPage({ params, searchParams }: NewSponsorPageProps) {
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
  const createSponsor = createSponsorAction.bind(null, event.id);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
          href={`/dashboard/events/${event.id}/sponsors`}
        >
          Back to sponsors
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase text-zinc-500">Sponsor</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Create sponsor</h1>
          <p className="mt-2 text-sm text-zinc-500">{event.name}</p>
          <div className="mt-8">
            <SponsorForm action={createSponsor} error={error} submitLabel="Create sponsor" />
          </div>
        </div>
      </section>
    </main>
  );
}
