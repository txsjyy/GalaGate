"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth-options";
import { getEventForOrganization } from "@/features/events/queries";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";
import { canRunCheckIn } from "@/features/organizations/permissions";
import { emitCheckInCreated } from "@/features/realtime/server";
import { prisma } from "@/lib/db/prisma";
import { parseWalkInFormData } from "./walk-in-validation";

async function requireCheckInStaff(eventId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/sign-in?callbackUrl=/dashboard/events/${eventId}/check-in`);
  }

  const context = await getCurrentOrganizationContext(session.user.email);

  if (!context || !canRunCheckIn(context.role)) {
    throw new Error("You do not have permission to run check-in.");
  }

  await getEventForOrganization(eventId, context.organization.id);

  return context;
}

function getCheckInError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "This attendee has already been checked in.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to check in attendee.";
}

export async function checkInAttendeeAction(eventId: string, attendeeId: string) {
  try {
    const context = await requireCheckInStaff(eventId);
    const attendee = await prisma.attendee.findFirst({
      where: {
        id: attendeeId,
        eventId,
      },
      select: {
        id: true,
      },
    });

    if (!attendee) {
      throw new Error("Attendee not found for this event.");
    }

    const checkInRecord = await prisma.checkInRecord.create({
      data: {
        eventId,
        attendeeId: attendee.id,
        checkedInByUserId: context.user.id,
        source: "STAFF_SEARCH",
      },
    });

    emitCheckInCreated({
      eventId,
      attendeeId: attendee.id,
      checkedInAt: checkInRecord.checkedInAt.toISOString(),
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/check-in?error=${encodeURIComponent(getCheckInError(error))}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/attendees`);
  revalidatePath(`/dashboard/events/${eventId}/check-in`);
  redirect(`/dashboard/events/${eventId}/check-in?success=1`);
}

export async function createWalkInCheckInAction(eventId: string, formData: FormData) {
  try {
    const context = await requireCheckInStaff(eventId);
    const input = parseWalkInFormData(formData);

    const result = await prisma.$transaction(async (tx) => {
      const lotteryNumber = input.lotteryEligible
        ? (
            await tx.event.update({
              where: {
                id: eventId,
              },
              data: {
                nextLotteryNumber: {
                  increment: 1,
                },
              },
              select: {
                nextLotteryNumber: true,
              },
            })
          ).nextLotteryNumber - 1
        : null;

      const attendee = await tx.attendee.create({
        data: {
          eventId,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          ticketType: input.ticketType,
          lotteryNumber,
          lotteryEligible: input.lotteryEligible,
          source: "WALK_IN",
          createdByUserId: context.user.id,
          notes: input.notes,
        },
      });

      const checkInRecord = await tx.checkInRecord.create({
        data: {
          eventId,
          attendeeId: attendee.id,
          checkedInByUserId: context.user.id,
          source: "MANUAL",
        },
      });

      return { attendee, checkInRecord };
    });

    emitCheckInCreated({
      eventId,
      attendeeId: result.attendee.id,
      checkedInAt: result.checkInRecord.checkedInAt.toISOString(),
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/check-in/walk-in?error=${encodeURIComponent(getCheckInError(error))}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/attendees`);
  revalidatePath(`/dashboard/events/${eventId}/check-in`);
  redirect(`/dashboard/events/${eventId}/check-in?success=1`);
}
