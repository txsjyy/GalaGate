import { prisma } from "@/lib/db/prisma";

export async function getAttendeesForEvent(eventId: string, query?: string) {
  const search = query?.trim();

  return prisma.attendee.findMany({
    where: {
      eventId,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { ticketCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      checkInRecords: {
        select: {
          checkedInAt: true,
        },
      },
    },
  });
}

export async function getAttendeesForExport(eventId: string) {
  return prisma.attendee.findMany({
    where: { eventId },
    orderBy: [{ fullName: "asc" }],
    select: {
      fullName: true,
      email: true,
      phone: true,
      ticketType: true,
      ticketCode: true,
      lotteryNumber: true,
      lotteryEligible: true,
      notes: true,
      source: true,
    },
  });
}
