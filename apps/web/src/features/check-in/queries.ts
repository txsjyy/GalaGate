import { prisma } from "@/lib/db/prisma";

export async function searchCheckInAttendees(eventId: string, query?: string) {
  const search = query?.trim();

  if (!search) {
    return [];
  }

  return prisma.attendee.findMany({
    where: {
      eventId,
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { ticketCode: { contains: search, mode: "insensitive" } },
      ],
    },
    orderBy: [{ fullName: "asc" }],
    take: 12,
    include: {
      checkInRecords: {
        select: {
          checkedInAt: true,
          checkedInBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
