"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { getEventForOrganization } from "@/features/events/queries";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";
import { canManageEvents } from "@/features/organizations/permissions";
import { prisma } from "@/lib/db/prisma";
import { parseSponsorFormData } from "./validation";

async function requireSponsorManager(eventId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/sign-in?callbackUrl=/dashboard/events/${eventId}/sponsors`);
  }

  const context = await getCurrentOrganizationContext(session.user.email);

  if (!context || !canManageEvents(context.role)) {
    throw new Error("You do not have permission to manage sponsors.");
  }

  await getEventForOrganization(eventId, context.organization.id);

  return context;
}

function getSponsorError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "A sponsor with this name already exists for the event.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to save sponsor.";
}

export async function createSponsorAction(eventId: string, formData: FormData) {
  try {
    await requireSponsorManager(eventId);
    const input = parseSponsorFormData(formData);

    await prisma.sponsor.create({
      data: {
        eventId,
        name: input.name,
        tier: input.tier,
        websiteUrl: input.websiteUrl,
        logoUrl: input.logoUrl,
        displayCopy: input.displayCopy,
      },
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/sponsors/new?error=${encodeURIComponent(getSponsorError(error))}`);
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/sponsors`);
  redirect(`/dashboard/events/${eventId}/sponsors`);
}

export async function updateSponsorAction(eventId: string, sponsorId: string, formData: FormData) {
  try {
    await requireSponsorManager(eventId);
    const input = parseSponsorFormData(formData);

    await prisma.sponsor.updateMany({
      where: {
        id: sponsorId,
        eventId,
      },
      data: {
        name: input.name,
        tier: input.tier,
        websiteUrl: input.websiteUrl,
        logoUrl: input.logoUrl,
        displayCopy: input.displayCopy,
      },
    });
  } catch (error) {
    redirect(
      `/dashboard/events/${eventId}/sponsors/${sponsorId}/edit?error=${encodeURIComponent(getSponsorError(error))}`,
    );
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/sponsors`);
  revalidatePath(`/dashboard/events/${eventId}/raffle`);
  redirect(`/dashboard/events/${eventId}/sponsors`);
}
