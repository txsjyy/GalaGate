import type { Server as SocketServer } from "socket.io";
import {
  getEventRoom,
  REALTIME_EVENTS,
  type CheckInCreatedPayload,
  type RafflePrizeShownPayload,
  type RaffleWinnerDrawnPayload,
} from "./events";

const globalForRealtime = globalThis as unknown as {
  galagateIo?: SocketServer;
};

export function setRealtimeServer(io: SocketServer) {
  globalForRealtime.galagateIo = io;
}

export function emitCheckInCreated(payload: CheckInCreatedPayload) {
  globalForRealtime.galagateIo
    ?.to(getEventRoom(payload.eventId, "dashboard"))
    .emit(REALTIME_EVENTS.CHECK_IN_CREATED, payload);
}

export function emitRaffleWinnerDrawn(payload: RaffleWinnerDrawnPayload) {
  globalForRealtime.galagateIo
    ?.to(getEventRoom(payload.eventId, "stage"))
    .emit(REALTIME_EVENTS.RAFFLE_WINNER_DRAWN, payload);
}

export function emitRafflePrizeShown(payload: RafflePrizeShownPayload) {
  globalForRealtime.galagateIo
    ?.to(getEventRoom(payload.eventId, "stage"))
    .emit(REALTIME_EVENTS.RAFFLE_PRIZE_SHOWN, payload);
}
