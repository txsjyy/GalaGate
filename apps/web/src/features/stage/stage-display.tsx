"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { REALTIME_EVENTS, type RafflePrizeShownPayload, type RaffleWinnerDrawnPayload } from "@/features/realtime/events";

type StageDisplayProps = {
  eventId: string;
  stageToken: string;
  eventName: string;
  initialWinner?: RaffleWinnerDrawnPayload | null;
  sponsors: {
    id: string;
    name: string;
    tier: string | null;
    logoUrl: string | null;
    displayCopy: string | null;
  }[];
};

type WheelWinner = {
  id: string;
  fullName: string;
  lotteryNumber: number | null;
};

function formatLotteryNumber(value: number | null | undefined) {
  return String(value ?? 0).padStart(3, "0").slice(-3);
}

function buildSlots(payload: RaffleWinnerDrawnPayload | RafflePrizeShownPayload | null) {
  const quantity = Math.max(payload?.prize.quantity ?? 1, 1);
  const winners = payload?.prizeWinners ?? [];

  return Array.from({ length: quantity }, (_, index) => winners[index] ?? null);
}

export function StageDisplay({ eventId, stageToken, eventName, initialWinner = null, sponsors }: StageDisplayProps) {
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [winner, setWinner] = useState<RaffleWinnerDrawnPayload | null>(initialWinner);
  const [shownPrize, setShownPrize] = useState<RafflePrizeShownPayload | null>(null);
  const activeDisplay = winner ?? shownPrize;
  const slots = useMemo(() => buildSlots(activeDisplay), [activeDisplay]);
  const currentPrize = activeDisplay?.prize;

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setStatus("live");
      socket.emit(REALTIME_EVENTS.JOIN_EVENT, { eventId, token: stageToken, channel: "stage" });
    });

    socket.on("disconnect", () => {
      setStatus("offline");
    });

    socket.on("connect_error", () => {
      setStatus("offline");
    });

    socket.on(REALTIME_EVENTS.RAFFLE_WINNER_DRAWN, (payload: RaffleWinnerDrawnPayload) => {
      if (payload.eventId === eventId) {
        setShownPrize(null);
        setWinner(payload);
      }
    });

    socket.on(REALTIME_EVENTS.RAFFLE_PRIZE_SHOWN, (payload: RafflePrizeShownPayload) => {
      if (payload.eventId === eventId) {
        setWinner(null);
        setShownPrize(payload);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [eventId, stageToken]);

  return (
    <main className="min-h-screen bg-[#111315] text-white">
      <section className="flex min-h-screen flex-col px-6 py-5 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-300">GalaGate Live Raffle</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-5xl">{eventName}</h1>
          </div>
          <div className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium">
            {status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Offline"}
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 xl:grid-cols-[360px_1fr]">
          <aside className="flex flex-col rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">Current prize</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
              {currentPrize?.name || "Prize placeholder"}
            </h2>
            <p className="mt-4 min-h-24 text-sm leading-6 text-zinc-300">
              {currentPrize?.description ||
                "Prize details have not been added yet. Add a description in the raffle prize form to show it here."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <PrizeStat label="Slots" value={String(currentPrize?.quantity ?? 1)} />
              <PrizeStat label="Filled" value={`${activeDisplay?.prizeWinners.length ?? 0}/${currentPrize?.quantity ?? 1}`} />
            </div>
            <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Sponsor</p>
              <p className="mt-2 text-lg font-semibold text-white">{currentPrize?.sponsor?.name || "Sponsor placeholder"}</p>
              <p className="mt-1 text-sm text-red-200">{currentPrize?.sponsor?.tier || "Tier not set"}</p>
            </div>
          </aside>

          <section className="flex flex-col justify-center rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">Draw board</p>
                <h2 className="mt-2 text-2xl font-semibold text-white md:text-4xl">
                  {winner ? "Winner reveal" : shownPrize ? "Prize ready" : "Waiting for next draw"}
                </h2>
              </div>
              {activeDisplay ? (
                <p className="hidden text-sm text-zinc-400 md:block">
                  {new Date("announcedAt" in activeDisplay ? activeDisplay.announcedAt : activeDisplay.shownAt).toLocaleString()}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {slots.map((slot, index) => (
                <WheelSlot
                  key={slot?.id ?? `empty-${index}`}
                  index={index}
                  winner={slot}
                  isLatest={Boolean(winner && slot && slot.id === winner.winner.id)}
                />
              ))}
            </div>
          </section>
        </div>

        {sponsors.length > 0 ? (
          <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-4">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Presented by</span>
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-2">
                {sponsor.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="h-7 w-7 rounded bg-white object-contain" alt="" src={sponsor.logoUrl} />
                ) : null}
                <p className="text-sm font-semibold text-white">{sponsor.name}</p>
              </div>
            ))}
          </footer>
        ) : null}
      </section>
    </main>
  );
}

function PrizeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 px-3 py-3">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function WheelSlot({ index, winner, isLatest }: { index: number; winner: WheelWinner | null; isLatest: boolean }) {
  return (
    <article
      className={`rounded-lg border p-4 shadow-xl ${
        isLatest ? "border-red-300 bg-red-500/10" : "border-white/10 bg-black/25"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Slot {index + 1}</p>
        <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-zinc-300">{winner ? "Filled" : "Open"}</span>
      </div>
      <RollingNumber target={winner?.lotteryNumber ?? null} active={Boolean(winner)} />
      <div className="mt-4 min-h-16 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Winner</p>
        <p className="mt-1 text-xl font-semibold text-white">{winner?.fullName || "Pending winner"}</p>
      </div>
    </article>
  );
}

function RollingNumber({ target, active }: { target: number | null; active: boolean }) {
  const [digits, setDigits] = useState(() => (active && target != null ? ["0", "0", "0"] : ["-", "-", "-"]));

  useEffect(() => {
    if (!active || target == null) {
      return;
    }

    const targetDigits = formatLotteryNumber(target).split("");
    const start = performance.now();
    const duration = 2200;
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const nextDigits = targetDigits.map((digit, index) => {
        if (progress >= 1 || progress > 0.46 + index * 0.18) {
          return digit;
        }

        return String((Math.floor(elapsed / (55 + index * 22)) + index * 3) % 10);
      });

      setDigits(nextDigits);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {digits.map((digit, index) => (
        <div
          key={`${index}-${digit}`}
          className="flex aspect-[0.8] items-center justify-center rounded-md bg-zinc-100 font-mono text-6xl font-semibold text-zinc-950 shadow-inner md:text-7xl"
        >
          {digit}
        </div>
      ))}
    </div>
  );
}
