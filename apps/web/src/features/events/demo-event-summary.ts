import { prisma } from "@/lib/db/prisma";

export type DemoEventSummary = {
  eventName: string;
  eventStatus: string;
  registeredCount: number;
  checkedInCount: number;
  checkInRate: number;
  rafflePrizeCount: number;
  sponsorCount: number;
  reportCount: number;
};

export async function getDemoEventSummary(): Promise<DemoEventSummary | null> {
  const event = await prisma.event.findFirst({
    where: {
      organization: {
        slug: "utcssa",
      },
      slug: "new-year-gala-2024",
    },
    select: {
      id: true,
      name: true,
      status: true,
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
    return null;
  }

  const registeredCount = event._count.attendees;
  const checkedInCount = event._count.checkIns;

  return {
    eventName: event.name,
    eventStatus: event.status,
    registeredCount,
    checkedInCount,
    checkInRate: registeredCount === 0 ? 0 : Math.round((checkedInCount / registeredCount) * 100),
    rafflePrizeCount: event._count.rafflePrizes,
    sponsorCount: event._count.sponsors,
    reportCount: event._count.reports,
  };
}
