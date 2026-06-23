import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StageDisplay } from "@/features/stage/stage-display";
import type { RaffleWinnerDrawnPayload } from "@/features/realtime/events";

type StagePageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function StagePage({ params }: StagePageProps) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      raffleWinners: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          announcedAt: true,
          prize: {
            select: {
              id: true,
              name: true,
            },
          },
          attendee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              ticketCode: true,
              lotteryNumber: true,
            },
          },
        },
      },
      sponsors: {
        orderBy: [{ tier: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          tier: true,
          logoUrl: true,
          displayCopy: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const latestWinner = event.raffleWinners[0];
  const initialWinner: RaffleWinnerDrawnPayload | null = latestWinner
    ? {
        eventId: event.id,
        prize: latestWinner.prize,
        winner: latestWinner.attendee,
        announcedAt: latestWinner.announcedAt?.toISOString() ?? new Date().toISOString(),
      }
    : null;

  return (
    <StageDisplay eventId={event.id} eventName={event.name} initialWinner={initialWinner} sponsors={event.sponsors} />
  );
}
