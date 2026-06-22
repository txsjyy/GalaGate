import { z } from "zod";

export const attendeeFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("Valid email is required.").transform((value) => value.toLowerCase()),
  phone: z.string().trim().optional(),
  ticketType: z.string().trim().min(1, "Ticket type is required."),
  ticketCode: z.string().trim().optional(),
  lotteryNumber: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const number = Number(value);

      if (!Number.isInteger(number) || number <= 0) {
        throw new Error("Lottery number must be a positive integer.");
      }

      return number;
    }),
  lotteryEligible: z.boolean(),
  notes: z.string().trim().optional(),
});

export type AttendeeFormInput = z.infer<typeof attendeeFormSchema>;

export function parseAttendeeFormData(formData: FormData) {
  return attendeeFormSchema.parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    ticketType: formData.get("ticketType") || "General",
    ticketCode: formData.get("ticketCode") || undefined,
    lotteryNumber: formData.get("lotteryNumber") || undefined,
    lotteryEligible: formData.get("lotteryEligible") === "on",
    notes: formData.get("notes") || undefined,
  });
}
