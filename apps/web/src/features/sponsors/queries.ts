import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export async function getSponsorsForEvent(eventId: string) {
  return prisma.sponsor.findMany({
    where: { eventId },
    orderBy: [{ tier: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          prizes: true,
        },
      },
    },
  });
}

export async function getSponsorForEvent(eventId: string, sponsorId: string) {
  const sponsor = await prisma.sponsor.findFirst({
    where: {
      id: sponsorId,
      eventId,
    },
  });

  if (!sponsor) {
    notFound();
  }

  return sponsor;
}
