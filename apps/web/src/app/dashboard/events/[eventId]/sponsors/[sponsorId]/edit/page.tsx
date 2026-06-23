import Link from "next/link";
import { redirect } from "next/navigation";
import { updateSponsorAction } from "@/features/sponsors/actions";
import { SponsorForm } from "@/features/sponsors/components/sponsor-form";
import { getSponsorForEvent } from "@/features/sponsors/queries";
import { getEventForOrganization, requireCurrentOrganization } from "@/features/events/queries";

type EditSponsorPageProps = {
  params: Promise<{
    eventId: string;
    sponsorId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditSponsorPage({ params, searchParams }: EditSponsorPageProps) {
  const context = await requireCurrentOrganization();
  const { eventId, sponsorId } = await params;
  const { error } = await searchParams;

  if (!context) {
    redirect("/dashboard");
  }

  if (!context.permissions.canManageEvents) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const sponsor = await getSponsorForEvent(event.id, sponsorId);
  const updateSponsor = updateSponsorAction.bind(null, event.id, sponsor.id);

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
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">{sponsor.name}</h1>
          <div className="mt-8">
            <SponsorForm
              action={updateSponsor}
              error={error}
              submitLabel="Save sponsor"
              defaultValues={{
                name: sponsor.name,
                tier: sponsor.tier,
                websiteUrl: sponsor.websiteUrl,
                logoUrl: sponsor.logoUrl,
                displayCopy: sponsor.displayCopy,
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
