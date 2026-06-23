import { z } from "zod";

export const rafflePrizeFormSchema = z.object({
  name: z.string().trim().min(1, "Prize name is required."),
  description: z.string().trim().optional(),
  sponsorId: z.string().trim().optional(),
  quantity: z
    .string()
    .trim()
    .transform((value) => Number(value || 1))
    .pipe(z.number().int().min(1, "Quantity must be at least 1.")),
  drawOrder: z
    .string()
    .trim()
    .transform((value) => Number(value || 0))
    .pipe(z.number().int().min(0, "Draw order must be 0 or greater.")),
});

export function parseRafflePrizeFormData(formData: FormData) {
  const input = rafflePrizeFormSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sponsorId: formData.get("sponsorId") || undefined,
    quantity: formData.get("quantity") || "1",
    drawOrder: formData.get("drawOrder") || "0",
  });

  return {
    ...input,
    sponsorId: input.sponsorId || null,
  };
}
