export const REALTIME_EVENTS = {
  JOIN_EVENT: "event:join",
  CHECK_IN_CREATED: "check-in:created",
  RAFFLE_WINNER_DRAWN: "raffle:winner-drawn",
} as const;

export type CheckInCreatedPayload = {
  eventId: string;
  attendeeId: string;
  checkedInAt: string;
};

export type RaffleWinnerDrawnPayload = {
  eventId: string;
  prize: {
    id: string;
    name: string;
  };
  winner: {
    id: string;
    fullName: string;
    email: string | null;
    ticketCode: string | null;
    lotteryNumber: number | null;
  };
  announcedAt: string;
};

export function getEventRoom(eventId: string) {
  return `event:${eventId}`;
}
