import { z } from "zod";

export const sponsorFormSchema = z.object({
  name: z.string().trim().min(1, "Sponsor name is required."),
  tier: z.string().trim().optional(),
  websiteUrl: z.string().trim().url("Website URL must be valid.").optional().or(z.literal("")),
  logoUrl: z.string().trim().url("Logo URL must be valid.").optional().or(z.literal("")),
  displayCopy: z.string().trim().optional(),
});

export function parseSponsorFormData(formData: FormData) {
  const input = sponsorFormSchema.parse({
    name: formData.get("name"),
    tier: formData.get("tier") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    displayCopy: formData.get("displayCopy") || undefined,
  });

  return {
    ...input,
    tier: input.tier || null,
    websiteUrl: input.websiteUrl || null,
    logoUrl: input.logoUrl || null,
    displayCopy: input.displayCopy || null,
  };
}
