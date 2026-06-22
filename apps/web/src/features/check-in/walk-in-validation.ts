import { z } from "zod";

export const walkInFormSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required."),
    email: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value.toLowerCase() : undefined)),
    phone: z.string().trim().optional(),
    ticketType: z.string().trim().min(1, "Ticket type is required."),
    lotteryEligible: z.boolean(),
    notes: z.string().trim().optional(),
  })
  .refine((input) => input.email || input.phone, {
    message: "Provide at least an email or phone number.",
    path: ["email"],
  });

export function parseWalkInFormData(formData: FormData) {
  return walkInFormSchema.parse({
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    ticketType: formData.get("ticketType") || "Walk-in",
    lotteryEligible: formData.get("lotteryEligible") === "on",
    notes: formData.get("notes") || undefined,
  });
}
