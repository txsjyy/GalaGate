import { Button } from "@/components/ui/button";

type SponsorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  defaultValues?: {
    name?: string;
    tier?: string | null;
    websiteUrl?: string | null;
    logoUrl?: string | null;
    displayCopy?: string | null;
  };
};

export function SponsorForm({ action, submitLabel, error, defaultValues }: SponsorFormProps) {
  return (
    <form action={action} className="space-y-5">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Sponsor name</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="name"
            required
            defaultValue={defaultValues?.name}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Tier</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="tier"
            placeholder="Gold"
            defaultValue={defaultValues?.tier ?? ""}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Website URL</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
          name="websiteUrl"
          type="url"
          defaultValue={defaultValues?.websiteUrl ?? ""}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Logo URL</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
          name="logoUrl"
          type="url"
          defaultValue={defaultValues?.logoUrl ?? ""}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Display copy</span>
        <textarea
          className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          name="displayCopy"
          defaultValue={defaultValues?.displayCopy ?? ""}
        />
      </label>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
