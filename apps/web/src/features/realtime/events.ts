export const REALTIME_EVENTS = {
  JOIN_EVENT: "event:join",
  CHECK_IN_CREATED: "check-in:created",
  RAFFLE_PRIZE_SHOWN: "raffle:prize-shown",
  RAFFLE_WINNER_DRAWN: "raffle:winner-drawn",
} as const;

export type JoinEventPayload = {
  eventId: string;
  token: string;
  channel: "dashboard" | "stage";
};

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
    description: string | null;
    quantity: number;
    sponsor: {
      name: string;
      tier: string | null;
    } | null;
  };
  winner: {
    id: string;
    fullName: string;
    lotteryNumber: number | null;
  };
  prizeWinners: {
    id: string;
    fullName: string;
    lotteryNumber: number | null;
  }[];
  announcedAt: string;
};

export type RafflePrizeShownPayload = {
  eventId: string;
  prize: RaffleWinnerDrawnPayload["prize"];
  prizeWinners: RaffleWinnerDrawnPayload["prizeWinners"];
  shownAt: string;
};

export function getEventRoom(eventId: string, channel: JoinEventPayload["channel"]) {
  return `event:${eventId}:${channel}`;
}
