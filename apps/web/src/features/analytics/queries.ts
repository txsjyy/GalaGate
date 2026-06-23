import { prisma } from "@/lib/db/prisma";

type TicketTypeStats = {
  ticketType: string;
  registered: number;
  checkedIn: number;
};

type CheckInTimelinePoint = {
  hour: string;
  count: number;
};

function getHourKey(date: Date) {
  const key = new Date(date);
  key.setMinutes(0, 0, 0);
  return key.toISOString();
}

function toRate(checkedIn: number, registered: number) {
  if (registered === 0) {
    return 0;
  }

  return Math.round((checkedIn / registered) * 100);
}

export async function getEventAnalytics(eventId: string) {
  const [
    event,
    attendeeGroups,
    checkIns,
    attendeeSourceGroups,
    prizes,
    completedDrawCount,
    sponsors,
    sponsorTierGroups,
  ] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        venue: true,
        startsAt: true,
        endsAt: true,
        description: true,
        timezone: true,
        status: true,
      },
    }),
    prisma.attendee.groupBy({
      by: ["ticketType"],
      where: { eventId },
      _count: {
        _all: true,
      },
      orderBy: {
        ticketType: "asc",
      },
    }),
    prisma.checkInRecord.findMany({
      where: { eventId },
      orderBy: { checkedInAt: "asc" },
      select: {
        checkedInAt: true,
        source: true,
        attendee: {
          select: {
            ticketType: true,
          },
        },
      },
    }),
    prisma.attendee.groupBy({
      by: ["source"],
      where: { eventId },
      _count: {
        _all: true,
      },
      orderBy: {
        source: "asc",
      },
    }),
    prisma.rafflePrize.findMany({
      where: { eventId },
      orderBy: [{ drawOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        quantity: true,
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
    prisma.raffleDraw.count({
      where: {
        eventId,
        status: "COMPLETED",
      },
    }),
    prisma.sponsor.findMany({
      where: { eventId },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        tier: true,
        _count: {
          select: {
            prizes: true,
          },
        },
      },
    }),
    prisma.sponsor.groupBy({
      by: ["tier"],
      where: { eventId },
      _count: {
        _all: true,
      },
      orderBy: {
        tier: "asc",
      },
    }),
  ]);

  if (!event) {
    return null;
  }

  const checkedInByTicketType = new Map<string, number>();
  const checkInTimeline = new Map<string, number>();

  for (const checkIn of checkIns) {
    const ticketType = checkIn.attendee.ticketType || "General";
    checkedInByTicketType.set(ticketType, (checkedInByTicketType.get(ticketType) ?? 0) + 1);

    const hour = getHourKey(checkIn.checkedInAt);
    checkInTimeline.set(hour, (checkInTimeline.get(hour) ?? 0) + 1);
  }

  const ticketTypeBreakdown: TicketTypeStats[] = attendeeGroups.map((group) => ({
    ticketType: group.ticketType || "General",
    registered: group._count._all,
    checkedIn: checkedInByTicketType.get(group.ticketType || "General") ?? 0,
  }));

  for (const [ticketType, checkedIn] of checkedInByTicketType.entries()) {
    if (!ticketTypeBreakdown.some((group) => group.ticketType === ticketType)) {
      ticketTypeBreakdown.push({
        ticketType,
        registered: 0,
        checkedIn,
      });
    }
  }

  const timeline: CheckInTimelinePoint[] = Array.from(checkInTimeline.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const totalRegistered = attendeeGroups.reduce((sum, group) => sum + group._count._all, 0);
  const totalCheckedIn = checkIns.length;
  const winnerCount = prizes.reduce((sum, prize) => sum + prize._count.winners, 0);

  return {
    event,
    attendance: {
      totalRegistered,
      totalCheckedIn,
      checkInRate: toRate(totalCheckedIn, totalRegistered),
      checkInTimeline: timeline,
      ticketTypeBreakdown,
      attendeeSources: attendeeSourceGroups.map((group) => ({
        source: group.source,
        count: group._count._all,
      })),
    },
    raffle: {
      prizeCount: prizes.length,
      drawCount: completedDrawCount,
      winnerCount,
      prizes: prizes.map((prize) => ({
        id: prize.id,
        name: prize.name,
        quantity: prize.quantity,
        winnerCount: prize._count.winners,
        drawCount: prize._count.draws,
        sponsor: prize.sponsor,
      })),
    },
    sponsors: {
      totalSponsors: sponsors.length,
      byTier: sponsorTierGroups.map((group) => ({
        tier: group.tier || "Unspecified",
        count: group._count._all,
      })),
      sponsors,
    },
  };
}

export async function buildEventRecapInput(eventId: string) {
  const analytics = await getEventAnalytics(eventId);

  if (!analytics) {
    return null;
  }

  return {
    event: {
      name: analytics.event.name,
      venue: analytics.event.venue ?? undefined,
      startsAt: analytics.event.startsAt.toISOString(),
      endsAt: analytics.event.endsAt?.toISOString(),
      description: analytics.event.description ?? undefined,
    },
    attendance: {
      totalRegistered: analytics.attendance.totalRegistered,
      totalCheckedIn: analytics.attendance.totalCheckedIn,
      checkInRate: analytics.attendance.checkInRate,
      checkInByHour: analytics.attendance.checkInTimeline,
      ticketTypeBreakdown: analytics.attendance.ticketTypeBreakdown,
    },
    raffle: {
      prizeCount: analytics.raffle.prizeCount,
      drawCount: analytics.raffle.drawCount,
      winnerCount: analytics.raffle.winnerCount,
      prizes: analytics.raffle.prizes.map((prize) => ({
        name: prize.name,
        quantity: prize.quantity,
        winnerCount: prize.winnerCount,
      })),
    },
    sponsors: analytics.sponsors.sponsors.map((sponsor) => ({
      name: sponsor.name,
      tier: sponsor.tier ?? undefined,
    })),
  };
}
