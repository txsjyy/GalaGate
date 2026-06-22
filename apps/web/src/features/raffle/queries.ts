import { prisma } from "@/lib/db/prisma";

export async function getRaffleDashboard(eventId: string) {
  const [prizes, winners, eligibleCheckedInCount, winnerCount] = await Promise.all([
    prisma.rafflePrize.findMany({
      where: { eventId },
      orderBy: [{ drawOrder: "asc" }, { createdAt: "asc" }],
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
            draws: true,
          },
        },
      },
    }),
    prisma.raffleWinner.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      include: {
        attendee: {
          select: {
            fullName: true,
            email: true,
            ticketCode: true,
            lotteryNumber: true,
          },
        },
        prize: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.attendee.count({
      where: {
        eventId,
        lotteryEligible: true,
        checkInRecords: {
          some: {},
        },
      },
    }),
    prisma.raffleWinner.count({
      where: { eventId },
    }),
  ]);

  return {
    prizes,
    winners,
    eligibleCheckedInCount,
    availableCandidateCount: Math.max(eligibleCheckedInCount - winnerCount, 0),
  };
}
