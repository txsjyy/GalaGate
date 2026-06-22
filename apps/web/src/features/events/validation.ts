import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().trim().min(2, "Event name is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().trim().optional(),
  venue: z.string().trim().optional(),
  startsAt: z.string().trim().min(1, "Start date and time is required."),
  endsAt: z.string().trim().optional(),
  timezone: z.string().trim().min(1, "Timezone is required."),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;

export function parseEventFormData(formData: FormData) {
  return eventFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    venue: formData.get("venue") || undefined,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
    timezone: formData.get("timezone") || "America/Toronto",
    status: formData.get("status") || "DRAFT",
  });
}

export function toEventDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date.");
  }

  return date;
}
