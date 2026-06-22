import { Button } from "@/components/ui/button";

type AttendeeFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
};

export function AttendeeForm({ action, error }: AttendeeFormProps) {
  return (
    <form action={action} className="space-y-5">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Full name</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="fullName"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="email"
            type="email"
            required
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Phone</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="phone"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Ticket type</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="ticketType"
            defaultValue="General"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Ticket code</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="ticketCode"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Lottery number</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="lotteryNumber"
            min={1}
            type="number"
          />
        </label>
        <label className="flex items-end gap-3 pb-3 text-sm font-medium text-zinc-700">
          <input className="size-4" name="lotteryEligible" type="checkbox" defaultChecked />
          Eligible for raffle
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Notes</span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          name="notes"
        />
      </label>

      <div className="flex justify-end">
        <Button type="submit">Add attendee</Button>
      </div>
    </form>
  );
}
