import { Button } from "@/components/ui/button";

type RafflePrizeFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  sponsors: {
    id: string;
    name: string;
    tier: string | null;
  }[];
};

export function RafflePrizeForm({ action, error, sponsors }: RafflePrizeFormProps) {
  return (
    <form action={action} className="space-y-5">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Prize name</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
          name="name"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Description</span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          name="description"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Sponsor</span>
        <select
          className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
          name="sponsorId"
          defaultValue=""
        >
          <option value="">No sponsor</option>
          {sponsors.map((sponsor) => (
            <option key={sponsor.id} value={sponsor.id}>
              {sponsor.tier ? `${sponsor.name} (${sponsor.tier})` : sponsor.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Quantity</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Draw order</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-950"
            name="drawOrder"
            type="number"
            min={0}
            defaultValue={0}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Create prize</Button>
      </div>
    </form>
  );
}
