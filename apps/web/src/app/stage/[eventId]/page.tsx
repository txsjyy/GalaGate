import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StageDisplay } from "@/features/stage/stage-display";
import type { RaffleWinnerDrawnPayload } from "@/features/realtime/events";

type StagePageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function StagePage({ params, searchParams }: StagePageProps) {
  const { eventId } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, stageToken: token },
    select: {
      id: true,
      name: true,
      stageToken: true,
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
    <StageDisplay
      eventId={event.id}
      stageToken={event.stageToken}
      eventName={event.name}
      initialWinner={initialWinner}
      sponsors={event.sponsors}
    />
  );
}
