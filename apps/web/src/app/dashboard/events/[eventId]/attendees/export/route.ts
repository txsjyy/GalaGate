import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getAttendeesForExport } from "@/features/attendees/queries";
import { toAttendeesCsv } from "@/features/attendees/csv";
import { authOptions } from "@/features/auth/auth-options";
import { getEventForOrganization } from "@/features/events/queries";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";

type ExportRouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_request: Request, { params }: ExportRouteContext) {
  const session = await getServerSession(authOptions);
  const { eventId } = await params;

  if (!session?.user?.email) {
    redirect(`/sign-in?callbackUrl=/dashboard/events/${eventId}/attendees`);
  }

  const context = await getCurrentOrganizationContext(session.user.email);

  if (!context) {
    return new NextResponse("Database setup required.", { status: 503 });
  }

  const event = await getEventForOrganization(eventId, context.organization.id);
  const attendees = await getAttendeesForExport(event.id);
  const csv = toAttendeesCsv(attendees);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-attendees.csv"`,
    },
  });
}
