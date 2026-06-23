import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { eventRecapOutputSchema, renderEventRecapMarkdown } from "./schema";

export const EVENT_RECAP_PROMPT_VERSION = "event-recap-v1";

type EventRecapInput = NonNullable<Awaited<ReturnType<typeof import("@/features/analytics/queries").buildEventRecapInput>>>;

function estimateTokens(value: unknown) {
  return Math.ceil(JSON.stringify(value).length / 4);
}

export async function generateEventRecap(input: EventRecapInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.parse({
    model,
    input: [
      {
        role: "system",
        content:
          "You generate concise post-event recap reports for event organizers. Use only the provided structured event data. Do not invent numbers, attendees, sponsors, prizes, or outcomes. If a section has no data, say so plainly.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
    text: {
      format: zodTextFormat(eventRecapOutputSchema, "event_recap_report"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned an empty or invalid structured report.");
  }

  return {
    output: response.output_parsed,
    markdown: renderEventRecapMarkdown(response.output_parsed),
    model,
    inputTokenEstimate: estimateTokens(input),
    outputTokenEstimate: estimateTokens(response.output_parsed),
  };
}
