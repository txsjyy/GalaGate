import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth-options";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";
import { prisma } from "@/lib/db/prisma";

export async function requireCurrentOrganization() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  const context = await getCurrentOrganizationContext(session.user.email).catch(() => null);

  if (!context) {
    return null;
  }

  return context;
}

export async function getEventForOrganization(eventId: string, organizationId: string) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizationId,
    },
    include: {
      _count: {
        select: {
          attendees: true,
          checkIns: true,
          rafflePrizes: true,
          sponsors: true,
          reports: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return event;
}
