import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  FileText,
  RadioTower,
  Sparkles,
  Ticket,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDemoEventSummary } from "@/features/events/demo-event-summary";

const modules = [
  {
    title: "Event Workspace",
    detail: "Event profile, venue, schedule, and operational status.",
    icon: CalendarDays,
  },
  {
    title: "Attendee Management",
    detail: "CSV import, attendee records, eligibility, and exports.",
    icon: Ticket,
  },
  {
    title: "Staff Check-in",
    detail: "Fast lookup, duplicate prevention, and check-in records.",
    icon: ClipboardCheck,
  },
  {
    title: "Live Raffle",
    detail: "Prize control, stage display, realtime winner persistence.",
    icon: Trophy,
  },
  {
    title: "Analytics",
    detail: "Attendance, timeline, ticket type, raffle, and sponsor summaries.",
    icon: BarChart3,
  },
  {
    title: "AI Recap Report",
    detail: "Human-reviewed event recap generated from verified metrics.",
    icon: FileText,
  },
];

const fallbackSummary = {
  eventName: "UTCSSA New Year Gala",
  eventStatus: "SCAFFOLD",
  registeredCount: 0,
  checkedInCount: 0,
  checkInRate: 0,
  rafflePrizeCount: 0,
  sponsorCount: 0,
  reportCount: 0,
};

export default async function Home() {
  const summary = (await getDemoEventSummary().catch(() => null)) ?? fallbackSummary;
  const metrics = [
    { label: "Registered", value: summary.registeredCount.toLocaleString() },
    { label: "Checked in", value: summary.checkedInCount.toLocaleString() },
    { label: "Check-in rate", value: `${summary.checkInRate}%` },
    { label: "Raffle prizes", value: summary.rafflePrizeCount.toLocaleString() },
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-zinc-950 text-white">
              <RadioTower className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">GalaGate</p>
              <p className="mt-1 text-xs text-zinc-500">Event operations platform</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
            <a className="hover:text-zinc-950" href="#modules">Modules</a>
            <a className="hover:text-zinc-950" href="#recap">AI Recap</a>
            <a className="hover:text-zinc-950" href="#roadmap">Roadmap</a>
          </nav>
          <Link
            className="hidden h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100 sm:inline-flex"
            href="/dashboard"
          >
            Open Demo
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px] lg:py-14">
        <div className="flex min-h-[520px] flex-col justify-between rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              <Sparkles className="size-4" aria-hidden="true" />
              v2 scaffold
            </div>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-tight text-zinc-950 md:text-6xl">
              Real-time operations for high-volume community events.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              GalaGate coordinates attendee import, staff check-in, live raffle control, sponsor visibility, analytics, and an AI-generated post-event recap.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-2xl font-semibold text-zinc-950">{metric.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-sm text-zinc-400">Live event</p>
              <h2 className="mt-1 text-xl font-semibold">{summary.eventName}</h2>
            </div>
            <span className="rounded-md bg-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-950">
              {summary.eventStatus}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-md bg-white/8 p-4">
              <p className="text-sm text-zinc-400">Sponsors</p>
              <p className="mt-2 text-3xl font-semibold">{summary.sponsorCount}</p>
            </div>
            <div className="rounded-md bg-white/8 p-4">
              <p className="text-sm text-zinc-400">Next raffle</p>
              <p className="mt-2 text-2xl font-semibold">Sponsor Grand Prize</p>
            </div>
            <div className="rounded-md bg-white/8 p-4" id="recap">
              <p className="text-sm text-zinc-400">AI recap readiness</p>
              <p className="mt-2 text-2xl font-semibold">
                {summary.reportCount > 0 ? "Draft available" : "Waiting for data"}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section id="modules" className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.title} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-zinc-950">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{module.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="roadmap" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-zinc-500">PR 1</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Modern scaffold ready for database work.</h2>
          </div>
          <div className="flex gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-transparent bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              href="/dashboard"
            >
              Continue Build
            </Link>
            <Button variant="secondary">View Plan</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
