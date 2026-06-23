ALTER TABLE "Event" ADD COLUMN "stageToken" TEXT;
ALTER TABLE "Event" ADD COLUMN "nextLotteryNumber" INTEGER NOT NULL DEFAULT 1;

UPDATE "Event"
SET "stageToken" = 'stage_' || replace("id", '-', '')
WHERE "stageToken" IS NULL;

UPDATE "Event"
SET "nextLotteryNumber" = COALESCE((
    SELECT MAX("lotteryNumber") + 1
    FROM "Attendee"
    WHERE "Attendee"."eventId" = "Event"."id"
      AND "Attendee"."lotteryNumber" IS NOT NULL
), 1);

ALTER TABLE "Event" ALTER COLUMN "stageToken" SET NOT NULL;

CREATE UNIQUE INDEX "Event_stageToken_key" ON "Event"("stageToken");
