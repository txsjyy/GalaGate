"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { REALTIME_EVENTS, type CheckInCreatedPayload } from "./events";

type RealtimeEventListenerProps = {
  eventId: string;
  stageToken: string;
};

export function RealtimeEventListener({ eventId, stageToken }: RealtimeEventListenerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"connecting" | "connected" | "offline">("connecting");

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit(REALTIME_EVENTS.JOIN_EVENT, { eventId, token: stageToken, channel: "dashboard" });
    });

    socket.on("disconnect", () => {
      setStatus("offline");
    });

    socket.on("connect_error", () => {
      setStatus("offline");
    });

    socket.on(REALTIME_EVENTS.CHECK_IN_CREATED, (payload: CheckInCreatedPayload) => {
      if (payload.eventId === eventId) {
        router.refresh();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [eventId, router, stageToken]);

  const label = {
    connecting: "Realtime connecting",
    connected: "Realtime connected",
    offline: "Realtime offline",
  }[status];

  const color = {
    connecting: "bg-amber-400",
    connected: "bg-emerald-500",
    offline: "bg-zinc-400",
  }[status];

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}
