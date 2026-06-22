import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CalendarDays, Plus, ShieldCheck, UsersRound } from "lucide-react";
import { authOptions } from "@/features/auth/auth-options";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { getCurrentOrganizationContext } from "@/features/organizations/current-organization";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  const context = await getCurrentOrganizationContext(session.user.email).catch(() => null);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link className="text-sm font-semibold text-zinc-950" href="/">
            GalaGate
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-500 sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase text-zinc-500">Organizer Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-950">
            {context ? context.organization.name : "Database setup required"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">
            {context
              ? "Authenticated organization context is active. Manage event workspaces, settings, and operational status from here."
              : "Sign-in is working, but no organization membership was found. Start PostgreSQL and seed the database to load the demo workspace."}
          </p>
        </div>

        {context ? (
          <>
            {context.permissions.canManageEvents ? (
              <div className="mt-6 flex justify-end">
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
                href="/dashboard/events/new"
              >
                <Plus className="size-4" aria-hidden="true" />
                New event
              </Link>
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <ShieldCheck className="size-5 text-emerald-700" aria-hidden="true" />
                <p className="mt-4 text-sm text-zinc-500">Role</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-950">{context.role}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <CalendarDays className="size-5 text-sky-700" aria-hidden="true" />
                <p className="mt-4 text-sm text-zinc-500">Events</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-950">{context.events.length}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <UsersRound className="size-5 text-amber-700" aria-hidden="true" />
                <p className="mt-4 text-sm text-zinc-500">Permissions</p>
                <p className="mt-1 text-sm font-medium text-zinc-950">
                  {context.permissions.canManageEvents ? "Can manage events" : "Limited access"}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-zinc-950">Events</h2>
              </div>
              <div className="divide-y divide-zinc-200">
                {context.events.map((event) => {
                  const checkInRate =
                    event.attendeeCount === 0
                      ? 0
                      : Math.round((event.checkInCount / event.attendeeCount) * 100);

                  return (
                    <Link
                      key={event.id}
                      className="grid gap-4 px-5 py-4 transition hover:bg-zinc-50 md:grid-cols-[1fr_120px_120px_120px]"
                      href={`/dashboard/events/${event.id}`}
                    >
                      <div>
                        <p className="font-medium text-zinc-950">{event.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {event.startsAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-zinc-600">{event.status}</p>
                      <p className="text-sm text-zinc-600">{event.attendeeCount} guests</p>
                      <p className="text-sm text-zinc-600">{checkInRate}% checked in</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            Run <code className="font-mono">docker compose up -d postgres</code>, then{" "}
            <code className="font-mono">pnpm db:push</code> and{" "}
            <code className="font-mono">pnpm db:seed</code>.
          </div>
        )}
      </section>
    </main>
  );
}
