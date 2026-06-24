"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { getEventForOrganization } from "@/features/events/queries";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";
import { canManageEvents } from "@/features/organizations/permissions";
import { emitRafflePrizeShown, emitRaffleWinnerDrawn } from "@/features/realtime/server";
import { prisma } from "@/lib/db/prisma";
import { parseRafflePrizeFormData } from "./validation";

async function requireRaffleManager(eventId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/sign-in?callbackUrl=/dashboard/events/${eventId}/raffle`);
  }

  const context = await getCurrentOrganizationContext(session.user.email);

  if (!context || !canManageEvents(context.role)) {
    throw new Error("You do not have permission to manage raffle operations.");
  }

  await getEventForOrganization(eventId, context.organization.id);

  return context;
}

function getRaffleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete raffle action.";
}

async function getStagePrizePayload(eventId: string, prizeId: string) {
  const prize = await prisma.rafflePrize.findFirst({
    where: {
      id: prizeId,
      eventId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      quantity: true,
      sponsor: {
        select: {
          name: true,
          tier: true,
        },
      },
      winners: {
        orderBy: { createdAt: "asc" },
        select: {
          attendee: {
            select: {
              id: true,
              fullName: true,
              lotteryNumber: true,
            },
          },
        },
      },
    },
  });

  if (!prize) {
    throw new Error("Prize not found.");
  }

  return {
    prize: {
      id: prize.id,
      name: prize.name,
      description: prize.description,
      quantity: prize.quantity,
      sponsor: prize.sponsor,
    },
    prizeWinners: prize.winners.map((record) => record.attendee),
  };
}

export async function createRafflePrizeAction(eventId: string, formData: FormData) {
  try {
    await requireRaffleManager(eventId);
    const input = parseRafflePrizeFormData(formData);
    const sponsorId = input.sponsorId
      ? await prisma.sponsor
          .findFirst({
            where: {
              id: input.sponsorId,
              eventId,
            },
            select: {
              id: true,
            },
          })
          .then((sponsor) => {
            if (!sponsor) {
              throw new Error("Sponsor not found for this event.");
            }

            return sponsor.id;
          })
      : null;

    await prisma.rafflePrize.create({
      data: {
        eventId,
        name: input.name,
        description: input.description,
        sponsorId,
        quantity: input.quantity,
        drawOrder: input.drawOrder,
      },
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/raffle/prizes/new?error=${encodeURIComponent(getRaffleError(error))}`);
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/raffle`);
  redirect(`/dashboard/events/${eventId}/raffle`);
}

export async function drawRafflePrizeAction(eventId: string, prizeId: string) {
  let drawnWinner:
    | {
        prize: {
          id: string;
          name: string;
          description: string | null;
          quantity: number;
          sponsor: {
            name: string;
            tier: string | null;
          } | null;
        };
        winner: {
          id: string;
          fullName: string;
          lotteryNumber: number | null;
        };
        prizeWinners: {
          id: string;
          fullName: string;
          lotteryNumber: number | null;
        }[];
        announcedAt: Date;
      }
    | undefined;

  try {
    const context = await requireRaffleManager(eventId);

    drawnWinner = await prisma.$transaction(async (tx) => {
      const prize = await tx.rafflePrize.findFirst({
        where: {
          id: prizeId,
          eventId,
        },
        include: {
          sponsor: {
            select: {
              name: true,
              tier: true,
            },
          },
          _count: {
            select: {
              winners: true,
            },
          },
        },
      });

      if (!prize) {
        throw new Error("Prize not found.");
      }

      const remainingQuantity = prize.quantity - prize._count.winners;

      if (remainingQuantity <= 0) {
        throw new Error("This prize has already been fully drawn.");
      }

      const candidates = await tx.attendee.findMany({
        where: {
          eventId,
          lotteryEligible: true,
          checkInRecords: {
            some: {},
          },
          raffleWins: {
            none: {
              eventId,
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          lotteryNumber: true,
        },
      });

      if (candidates.length === 0) {
        throw new Error("No eligible checked-in attendees remain in the raffle pool.");
      }

      const winner = candidates[Math.floor(Math.random() * candidates.length)];
      const now = new Date();

      const draw = await tx.raffleDraw.create({
        data: {
          eventId,
          prizeId,
          status: "COMPLETED",
          startedAt: now,
          completedAt: now,
          createdByUserId: context.user.id,
        },
      });

      await tx.raffleWinner.create({
        data: {
          eventId,
          drawId: draw.id,
          prizeId,
          attendeeId: winner.id,
          announcedAt: now,
        },
      });

      const prizeWinners = await tx.raffleWinner.findMany({
        where: {
          eventId,
          prizeId,
        },
        orderBy: { createdAt: "asc" },
        select: {
          attendee: {
            select: {
              id: true,
              fullName: true,
              lotteryNumber: true,
            },
          },
        },
      });

      return {
        prize: {
          id: prize.id,
          name: prize.name,
          description: prize.description,
          quantity: prize.quantity,
          sponsor: prize.sponsor,
        },
        winner,
        prizeWinners: prizeWinners.map((record) => record.attendee),
        announcedAt: now,
      };
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/raffle?error=${encodeURIComponent(getRaffleError(error))}`);
  }

  if (drawnWinner) {
    emitRaffleWinnerDrawn({
      eventId,
      prize: drawnWinner.prize,
      winner: drawnWinner.winner,
      prizeWinners: drawnWinner.prizeWinners,
      announcedAt: drawnWinner.announcedAt.toISOString(),
    });
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/raffle`);
  redirect(`/dashboard/events/${eventId}/raffle?success=1`);
}

export async function showRafflePrizeOnStageAction(eventId: string, prizeId: string) {
  try {
    await requireRaffleManager(eventId);
    const payload = await getStagePrizePayload(eventId, prizeId);

    emitRafflePrizeShown({
      eventId,
      prize: payload.prize,
      prizeWinners: payload.prizeWinners,
      shownAt: new Date().toISOString(),
    });
  } catch (error) {
    redirect(`/dashboard/events/${eventId}/raffle?error=${encodeURIComponent(getRaffleError(error))}`);
  }

  redirect(`/dashboard/events/${eventId}/raffle?stage=1`);
}
