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
import { parseAttendeeCsv } from "./csv";
import { parseAttendeeFormData } from "./validation";

async function requireAttendeeManager(eventId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/sign-in?callbackUrl=/dashboard/events/${eventId}/attendees`);
  }

  const context = await getCurrentOrganizationContext(session.user.email);

  if (!context || !canManageEvents(context.role)) {
    throw new Error("You do not have permission to manage attendees.");
  }

  await getEventForOrganization(eventId, context.organization.id);

  return context;
}

function getActionError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "An attendee with the same email, ticket code, or lottery number already exists for this event.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export async function createAttendeeAction(eventId: string, formData: FormData) {
  try {
    const context = await requireAttendeeManager(eventId);
    const input = parseAttendeeFormData(formData);

    await prisma.attendee.create({
      data: {
        eventId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        ticketType: input.ticketType,
        ticketCode: input.ticketCode,
        lotteryNumber: input.lotteryNumber,
        lotteryEligible: input.lotteryEligible,
        source: "MANUAL",
        createdByUserId: context.user.id,
        notes: input.notes,
      },
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/attendees/new?error=${encodeURIComponent(getActionError(error))}`);
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/attendees`);
  redirect(`/dashboard/events/${eventId}/attendees`);
}

export async function importAttendeesAction(eventId: string, formData: FormData) {
  try {
    const context = await requireAttendeeManager(eventId);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Choose a CSV file to import.");
    }

    const csv = await file.text();
    const rows = parseAttendeeCsv(csv);

    if (rows.length === 0) {
      throw new Error("CSV file has no attendee rows.");
    }

    const seenEmails = new Set<string>();
    const seenTicketCodes = new Set<string>();
    const seenLotteryNumbers = new Set<number>();

    for (const row of rows) {
      if (seenEmails.has(row.email)) {
        throw new Error(`Duplicate email in CSV: ${row.email}`);
      }

      seenEmails.add(row.email);

      if (row.ticketCode) {
        if (seenTicketCodes.has(row.ticketCode)) {
          throw new Error(`Duplicate ticket code in CSV: ${row.ticketCode}`);
        }

        seenTicketCodes.add(row.ticketCode);
      }

      if (row.lotteryNumber) {
        if (seenLotteryNumbers.has(row.lotteryNumber)) {
          throw new Error(`Duplicate lottery number in CSV: ${row.lotteryNumber}`);
        }

        seenLotteryNumbers.add(row.lotteryNumber);
      }
    }

    await prisma.attendee.createMany({
      data: rows.map((row) => ({
        eventId,
        fullName: row.fullName,
        email: row.email,
        phone: row.phone,
        ticketType: row.ticketType,
        ticketCode: row.ticketCode,
        lotteryNumber: row.lotteryNumber,
        lotteryEligible: row.lotteryEligible,
        source: "IMPORTED",
        createdByUserId: context.user.id,
        notes: row.notes,
      })),
      skipDuplicates: false,
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/attendees/import?error=${encodeURIComponent(getActionError(error))}`);
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/attendees`);
  redirect(`/dashboard/events/${eventId}/attendees`);
}
