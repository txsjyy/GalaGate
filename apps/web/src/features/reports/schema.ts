import { z } from "zod";

export const eventRecapOutputSchema = z.object({
  title: z.string().min(1),
  executiveSummary: z.string().min(1),
  attendanceSummary: z.string().min(1),
  checkInSummary: z.string().min(1),
  raffleSummary: z.string().min(1),
  sponsorSummary: z.string().min(1),
  operationalHighlights: z.array(z.string().min(1)),
  improvementSuggestions: z.array(z.string().min(1)),
  socialMediaRecap: z.string().min(1),
});

export type EventRecapOutput = z.infer<typeof eventRecapOutputSchema>;

export function renderEventRecapMarkdown(report: EventRecapOutput) {
  return [
    `# ${report.title}`,
    "",
    "## Executive Summary",
    report.executiveSummary,
    "",
    "## Attendance Summary",
    report.attendanceSummary,
    "",
    "## Check-in Operations",
    report.checkInSummary,
    "",
    "## Raffle Summary",
    report.raffleSummary,
    "",
    "## Sponsor Summary",
    report.sponsorSummary,
    "",
    "## Operational Highlights",
    ...report.operationalHighlights.map((item) => `- ${item}`),
    "",
    "## Improvement Suggestions",
    ...report.improvementSuggestions.map((item) => `- ${item}`),
    "",
    "## Social Media Recap",
    report.socialMediaRecap,
  ].join("\n");
}

export const reportEditSchema = z.object({
  title: z.string().trim().min(1, "Report title is required."),
  markdown: z.string().trim().min(1, "Report content is required."),
});

export function parseReportEditFormData(formData: FormData) {
  return reportEditSchema.parse({
    title: formData.get("title"),
    markdown: formData.get("markdown"),
  });
}
