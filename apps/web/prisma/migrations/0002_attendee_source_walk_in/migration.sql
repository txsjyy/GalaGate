-- CreateEnum
CREATE TYPE "AttendeeSource" AS ENUM ('IMPORTED', 'MANUAL', 'WALK_IN', 'STAFF');

-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN "createdByUserId" TEXT;
ALTER TABLE "Attendee" ADD COLUMN "source" "AttendeeSource" NOT NULL DEFAULT 'IMPORTED';
ALTER TABLE "Attendee" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Attendee_createdByUserId_idx" ON "Attendee"("createdByUserId");

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
