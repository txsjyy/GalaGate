"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { REALTIME_EVENTS, type RaffleWinnerDrawnPayload } from "@/features/realtime/events";

type StageDisplayProps = {
  eventId: string;
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

export function StageDisplay({ eventId, eventName, initialWinner = null, sponsors }: StageDisplayProps) {
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [winner, setWinner] = useState<RaffleWinnerDrawnPayload | null>(initialWinner);

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setStatus("live");
      socket.emit(REALTIME_EVENTS.JOIN_EVENT, eventId);
    });

    socket.on("disconnect", () => {
      setStatus("offline");
    });

    socket.on("connect_error", () => {
      setStatus("offline");
    });

    socket.on(REALTIME_EVENTS.RAFFLE_WINNER_DRAWN, (payload: RaffleWinnerDrawnPayload) => {
      if (payload.eventId === eventId) {
        setWinner(payload);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [eventId]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="flex min-h-screen flex-col px-8 py-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">GalaGate Live Raffle</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{eventName}</h1>
          </div>
          <div className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium">
            {status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Offline"}
          </div>
        </header>

        {sponsors.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-white/10 pb-5">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Presented by</span>
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-2">
                {sponsor.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="h-7 w-7 rounded bg-white object-contain" alt="" src={sponsor.logoUrl} />
                ) : null}
                <div>
                  <p className="text-sm font-semibold text-white">{sponsor.name}</p>
                  {sponsor.tier ? <p className="text-xs text-amber-200">{sponsor.tier}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-1 items-center justify-center py-10">
          {winner ? (
            <div className="w-full max-w-5xl text-center">
              <p className="text-2xl font-medium text-amber-300 md:text-4xl">{winner.prize.name}</p>
              <div className="mt-10 rounded-lg border border-white/10 bg-white/10 px-8 py-12 shadow-2xl">
                <p className="text-lg uppercase tracking-[0.28em] text-zinc-300">Winner</p>
                <h2 className="mt-6 text-6xl font-semibold leading-tight md:text-8xl">{winner.winner.fullName}</h2>
                <div className="mt-8 flex flex-wrap justify-center gap-3 text-lg text-zinc-200">
                  {winner.winner.lotteryNumber ? (
                    <span className="rounded-md bg-amber-300 px-4 py-2 font-semibold text-amber-950">
                      Lottery #{winner.winner.lotteryNumber}
                    </span>
                  ) : null}
                  {winner.winner.ticketCode ? (
                    <span className="rounded-md bg-white/10 px-4 py-2">{winner.winner.ticketCode}</span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg uppercase tracking-[0.28em] text-zinc-400">Waiting for next draw</p>
              <h2 className="mt-6 text-5xl font-semibold md:text-7xl">Ready on stage</h2>
            </div>
          )}
        </div>

        {sponsors.some((sponsor) => sponsor.displayCopy) ? (
          <footer className="border-t border-white/10 pt-5 text-center text-sm text-zinc-300">
            {sponsors
              .filter((sponsor) => sponsor.displayCopy)
              .map((sponsor) => (
                <p key={sponsor.id}>{sponsor.displayCopy}</p>
              ))}
          </footer>
        ) : null}
      </section>
    </main>
  );
}
