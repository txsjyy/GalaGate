import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ticketTypes = ["General", "VIP", "Sponsor Guest", "Staff"];

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "junyu@example.com" },
    update: {},
    create: {
      email: "junyu@example.com",
      name: "Junyu Yao",
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "utcssa" },
    update: {},
    create: {
      name: "UTCSSA",
      slug: "utcssa",
      members: {
        create: {
          userId: owner.id,
          role: "OWNER",
        },
      },
    },
  });

  const event = await prisma.event.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: "new-year-gala-2024",
      },
    },
    update: {
      status: "ACTIVE",
    },
    create: {
      organizationId: organization.id,
      name: "UTCSSA 2024 New Year Gala",
      slug: "new-year-gala-2024",
      description: "A community gala with live check-in, sponsor visibility, and stage raffle operations.",
      venue: "University of Toronto",
      startsAt: new Date("2024-02-10T18:00:00-05:00"),
      endsAt: new Date("2024-02-10T22:00:00-05:00"),
      timezone: "America/Toronto",
      status: "ACTIVE",
    },
  });

  await prisma.checkInRecord.deleteMany({ where: { eventId: event.id } });
  await prisma.raffleWinner.deleteMany({ where: { eventId: event.id } });
  await prisma.raffleDraw.deleteMany({ where: { eventId: event.id } });
  await prisma.rafflePrize.deleteMany({ where: { eventId: event.id } });
  await prisma.sponsor.deleteMany({ where: { eventId: event.id } });
  await prisma.eventReport.deleteMany({ where: { eventId: event.id } });
  await prisma.aiGenerationLog.deleteMany({ where: { eventId: event.id } });
  await prisma.attendee.deleteMany({ where: { eventId: event.id } });

  const attendeeData = Array.from({ length: 120 }, (_, index) => {
    const number = index + 1;
    return {
      eventId: event.id,
      fullName: `Demo Attendee ${number.toString().padStart(3, "0")}`,
      email: `attendee${number.toString().padStart(3, "0")}@example.com`,
      ticketType: ticketTypes[index % ticketTypes.length],
      ticketCode: `GALA-${number.toString().padStart(4, "0")}`,
      lotteryNumber: number,
      lotteryEligible: index % 10 !== 0,
    };
  });

  await prisma.attendee.createMany({ data: attendeeData });

  const attendees = await prisma.attendee.findMany({
    where: { eventId: event.id },
    orderBy: { lotteryNumber: "asc" },
  });

  await prisma.checkInRecord.createMany({
    data: attendees.slice(0, 87).map((attendee, index) => ({
      eventId: event.id,
      attendeeId: attendee.id,
      checkedInByUserId: owner.id,
      checkedInAt: new Date(Date.UTC(2024, 1, 10, 22, Math.floor(index * 2.5))),
      source: "STAFF_SEARCH",
    })),
  });

  const sponsor = await prisma.sponsor.create({
    data: {
      eventId: event.id,
      name: "Waterloo Student Travel",
      tier: "Gold",
      websiteUrl: "https://example.com",
      displayCopy: "Supporting student community events and cultural programming.",
    },
  });

  const prizes = await Promise.all([
    prisma.rafflePrize.create({
      data: {
        eventId: event.id,
        sponsorId: sponsor.id,
        name: "Sponsor Grand Prize",
        description: "Grand raffle prize for checked-in eligible guests.",
        quantity: 1,
        drawOrder: 1,
      },
    }),
    prisma.rafflePrize.create({
      data: {
        eventId: event.id,
        name: "Community Gift Pack",
        description: "Gift pack for live event participants.",
        quantity: 3,
        drawOrder: 2,
      },
    }),
  ]);

  const draw = await prisma.raffleDraw.create({
    data: {
      eventId: event.id,
      prizeId: prizes[0].id,
      status: "COMPLETED",
      startedAt: new Date("2024-02-11T01:30:00Z"),
      completedAt: new Date("2024-02-11T01:32:00Z"),
      createdByUserId: owner.id,
    },
  });

  await prisma.raffleWinner.create({
    data: {
      eventId: event.id,
      drawId: draw.id,
      prizeId: prizes[0].id,
      attendeeId: attendees[14].id,
      announcedAt: new Date("2024-02-11T01:32:00Z"),
    },
  });

  await prisma.eventReport.create({
    data: {
      eventId: event.id,
      title: "UTCSSA 2024 New Year Gala Recap Draft",
      markdown: "AI recap generation will be implemented in PR 12.",
      structuredJson: {
        status: "placeholder",
        source: "seed",
      },
      model: null,
      promptVersion: "seed-placeholder",
      generatedByUserId: owner.id,
    },
  });

  console.log(`Seeded ${organization.name} / ${event.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
