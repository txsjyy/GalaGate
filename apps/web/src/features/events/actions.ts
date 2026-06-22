"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";
import { canManageEvents } from "@/features/organizations/permissions";
import { prisma } from "@/lib/db/prisma";
import { parseEventFormData, toEventDate } from "./validation";

async function requireEventManager() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/sign-in?callbackUrl=/dashboard/events");
  }

  const context = await getCurrentOrganizationContext(session.user.email);

  if (!context || !canManageEvents(context.role)) {
    throw new Error("You do not have permission to manage events.");
  }

  return context;
}

function getActionError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export async function createEventAction(formData: FormData) {
  let eventId: string;

  try {
    const context = await requireEventManager();
    const input = parseEventFormData(formData);

    const event = await prisma.event.create({
      data: {
        organizationId: context.organization.id,
        name: input.name,
        slug: input.slug,
        description: input.description,
        venue: input.venue,
        startsAt: toEventDate(input.startsAt),
        endsAt: input.endsAt ? toEventDate(input.endsAt) : null,
        timezone: input.timezone,
        status: input.status,
      },
    });

    eventId = event.id;
  } catch (error) {
    redirect(`/dashboard/events/new?error=${encodeURIComponent(getActionError(error))}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  redirect(`/dashboard/events/${eventId}`);
}

export async function updateEventAction(eventId: string, formData: FormData) {
  try {
    const context = await requireEventManager();
    const input = parseEventFormData(formData);

    await prisma.event.updateMany({
      where: {
        id: eventId,
        organizationId: context.organization.id,
      },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        venue: input.venue,
        startsAt: toEventDate(input.startsAt),
        endsAt: input.endsAt ? toEventDate(input.endsAt) : null,
        timezone: input.timezone,
        status: input.status,
      },
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/settings?error=${encodeURIComponent(getActionError(error))}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${eventId}`);
  redirect(`/dashboard/events/${eventId}`);
}

export async function archiveEventAction(eventId: string) {
  const context = await requireEventManager();

  await prisma.event.updateMany({
    where: {
      id: eventId,
      organizationId: context.organization.id,
    },
    data: {
      status: "ARCHIVED",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}
