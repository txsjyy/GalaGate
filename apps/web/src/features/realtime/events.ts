export const REALTIME_EVENTS = {
  JOIN_EVENT: "event:join",
  CHECK_IN_CREATED: "check-in:created",
} as const;

export type CheckInCreatedPayload = {
  eventId: string;
  attendeeId: string;
  checkedInAt: string;
};

export function getEventRoom(eventId: string) {
  return `event:${eventId}`;
}
