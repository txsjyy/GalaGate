import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export async function getReportsForEvent(eventId: string) {
  return prisma.eventReport.findMany({
    where: { eventId },
    orderBy: { generatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      model: true,
      promptVersion: true,
      generatedAt: true,
      updatedAt: true,
      generatedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getReportForEvent(eventId: string, reportId: string) {
  const report = await prisma.eventReport.findFirst({
    where: {
      id: reportId,
      eventId,
    },
    include: {
      aiLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!report) {
    notFound();
  }

  return report;
}
