import type { EventStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

type EventFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  defaultValues?: {
    name?: string;
    slug?: string;
    description?: string | null;
    venue?: string | null;
    startsAt?: Date;
    endsAt?: Date | null;
    timezone?: string;
    status?: EventStatus;
  };
};

function toDateTimeLocalValue(date?: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

export function EventForm({ action, submitLabel, error, defaultValues }: EventFormProps) {
  return (
    <form action={action} className="space-y-5">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Event name</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="name"
            required
            defaultValue={defaultValues?.name}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Slug</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={defaultValues?.slug}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Description</span>
        <textarea
          className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Venue</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="venue"
            defaultValue={defaultValues?.venue ?? ""}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Timezone</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="timezone"
            required
            defaultValue={defaultValues?.timezone ?? "America/Toronto"}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Starts at</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocalValue(defaultValues?.startsAt)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Ends at</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="endsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalValue(defaultValues?.endsAt)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Status</span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
            name="status"
            defaultValue={defaultValues?.status ?? "DRAFT"}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
