"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { buildEventRecapInput } from "@/features/analytics/queries";
import { authOptions } from "@/features/auth/auth-options";
import { getEventForOrganization } from "@/features/events/queries";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";
import { canManageEvents } from "@/features/organizations/permissions";
import { prisma } from "@/lib/db/prisma";
import { generateEventRecap, EVENT_RECAP_PROMPT_VERSION } from "./openai";
import { parseReportEditFormData } from "./schema";

async function requireReportManager(eventId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/sign-in?callbackUrl=/dashboard/events/${eventId}/reports`);
  }

  const context = await getCurrentOrganizationContext(session.user.email);

  if (!context || !canManageEvents(context.role)) {
    throw new Error("You do not have permission to manage event reports.");
  }

  await getEventForOrganization(eventId, context.organization.id);

  return context;
}

function getReportError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete report action.";
}

async function logFailedGeneration(eventId: string, error: unknown) {
  await prisma.aiGenerationLog.create({
    data: {
      eventId,
      feature: "EVENT_RECAP_REPORT",
      provider: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      promptVersion: EVENT_RECAP_PROMPT_VERSION,
      status: "FAILED",
      errorMessage: getReportError(error),
    },
  });
}

export async function generateEventRecapAction(eventId: string) {
  let reportId: string | undefined;

  try {
    const context = await requireReportManager(eventId);
    const input = await buildEventRecapInput(eventId);

    if (!input) {
      throw new Error("Event analytics input could not be built.");
    }

    const generated = await generateEventRecap(input);

    const report = await prisma.eventReport.create({
      data: {
        eventId,
        status: "DRAFT",
        title: generated.output.title,
        markdown: generated.markdown,
        structuredJson: generated.output,
        model: generated.model,
        promptVersion: EVENT_RECAP_PROMPT_VERSION,
        generatedByUserId: context.user.id,
        aiLogs: {
          create: {
            eventId,
            feature: "EVENT_RECAP_REPORT",
            provider: "openai",
            model: generated.model,
            promptVersion: EVENT_RECAP_PROMPT_VERSION,
            inputTokenEstimate: generated.inputTokenEstimate,
            outputTokenEstimate: generated.outputTokenEstimate,
            status: "SUCCESS",
          },
        },
      },
    });

    reportId = report.id;
  } catch (error) {
    await logFailedGeneration(eventId, error).catch(() => undefined);
    redirect(`/dashboard/events/${eventId}/reports/new?error=${encodeURIComponent(getReportError(error))}`);
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/reports`);
  redirect(`/dashboard/events/${eventId}/reports/${reportId}`);
}

export async function saveReportAction(eventId: string, reportId: string, formData: FormData) {
  try {
    await requireReportManager(eventId);
    const input = parseReportEditFormData(formData);

    const result = await prisma.eventReport.updateMany({
      where: {
        id: reportId,
        eventId,
      },
      data: {
        title: input.title,
        markdown: input.markdown,
        status: "SAVED",
      },
    });

    if (result.count === 0) {
      throw new Error("Report not found.");
    }
  } catch (error) {
    redirect(
      `/dashboard/events/${eventId}/reports/${reportId}?error=${encodeURIComponent(getReportError(error))}`,
    );
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/reports`);
  revalidatePath(`/dashboard/events/${eventId}/reports/${reportId}`);
  redirect(`/dashboard/events/${eventId}/reports/${reportId}?saved=1`);
}
