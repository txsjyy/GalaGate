# GalaGate v2 Technical Plan

## Product Direction

GalaGate v2 is a real-time event operations platform for student organizations and community events.

The product should cover the operational workflow around a live event:

- Event setup
- Attendee import and management
- Staff check-in
- Live raffle display
- Sponsor asset management
- Post-event analytics
- AI-generated event recap report

The AI scope is intentionally narrow. GalaGate v2 will include only one AI feature in the first production-quality version: AI Event Recap Report.

## Core Positioning

GalaGate is not a generic AI app and not only a raffle animation. It should be presented as:

> A real-time event operations platform with attendee check-in, live raffle control, sponsor management, analytics, and AI-generated event recap reports.

## Recommended Stack

### Application

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

### Backend

Use Next.js Route Handlers for the first version. Avoid splitting a separate NestJS backend until the product stabilizes.

- Next.js server routes
- Server Actions where appropriate
- Prisma ORM
- PostgreSQL
- Socket.IO for realtime event updates

### AI

- OpenAI API
- Structured JSON output validated with Zod
- Human-review step before saving generated report

### Local Development

- pnpm
- Docker Compose for PostgreSQL
- Prisma migrations
- Seed script with demo event data

### Deployment Target

Initial deployment can use:

- Vercel for the Next.js app
- Supabase, Neon, Railway, or Render PostgreSQL for the database

Socket.IO deployment should be evaluated separately. If Vercel serverless constraints become painful, move realtime to a small Node service on Railway/Fly.io/Render.

## Major Product Areas

### 1. Event Workspace

Purpose: allow organizers to create and configure events.

Core screens:

- Event list
- Event detail dashboard
- Event settings

Core capabilities:

- Create event
- Edit event name, date, venue, description
- Configure check-in status
- Configure raffle status
- View event-level metrics

### 2. Attendee Management

Purpose: manage the event guest list.

Core screens:

- Attendee table
- Import attendees
- Attendee detail drawer/page

Core capabilities:

- CSV import
- Manual attendee creation
- Search by name/email/ticket number
- Track ticket type
- Track lottery eligibility
- Export attendee list

### 3. Check-in Operations

Purpose: allow staff to check attendees in quickly during live event operations.

Core screens:

- Staff check-in page
- Attendee search result
- Check-in confirmation state

Core capabilities:

- Search attendee by email/name/ticket number
- Check in attendee
- Prevent duplicate check-in
- Display lottery number or eligibility
- Record staff/user who checked in
- Broadcast check-in update to dashboard

### 4. Live Raffle

Purpose: support stage-facing raffle draw with persistent winner records.

Core screens:

- Raffle control panel
- Stage display page
- Prize management
- Winner history

Core capabilities:

- Create raffle prizes
- Draw from checked-in eligible attendees only
- Exclude previous winners when configured
- Persist winners
- Broadcast draw events to stage display through Socket.IO
- Export winner list

### 5. Sponsor Assets

Purpose: support event sponsor visibility and post-event reporting.

Core screens:

- Sponsor list
- Sponsor detail/editor

Core capabilities:

- Add sponsor
- Set sponsor tier
- Upload or link sponsor logo
- Add sponsor display copy
- Show sponsor assets on stage display or event pages

### 6. Analytics

Purpose: summarize event operations without AI first.

Core screens:

- Event analytics dashboard

Core metrics:

- Total attendees
- Checked-in attendees
- Check-in rate
- Check-in timeline
- Ticket type distribution
- Lottery winners by prize
- Sponsor count by tier

### 7. AI Event Recap Report

Purpose: generate a post-event report from structured event data.

This feature should not make operational decisions. It reads event data, generates a draft recap, and lets the organizer review/edit before saving or exporting.

Core screens:

- Generate recap page
- Recap preview/editor
- Saved reports list

Core capabilities:

- Generate report from event data
- Return structured sections
- Validate AI response with Zod
- Save generated report as markdown plus structured metadata
- Allow organizer edits before publishing/exporting

Recommended report sections:

- Executive summary
- Attendance summary
- Check-in operations summary
- Raffle summary
- Sponsor summary
- Operational highlights
- Issues and improvement suggestions
- Suggested social media recap

## Data Model Draft

### User

- id
- name
- email
- image
- createdAt
- updatedAt

### Organization

- id
- name
- slug
- createdAt
- updatedAt

### OrganizationMember

- id
- organizationId
- userId
- role: OWNER | ADMIN | STAFF | VIEWER
- createdAt

### Event

- id
- organizationId
- name
- slug
- description
- venue
- startsAt
- endsAt
- timezone
- status: DRAFT | ACTIVE | COMPLETED | ARCHIVED
- createdAt
- updatedAt

### Attendee

- id
- eventId
- fullName
- email
- phone
- ticketType
- ticketCode
- lotteryNumber
- lotteryEligible
- notes
- createdAt
- updatedAt

### CheckInRecord

- id
- eventId
- attendeeId
- checkedInByUserId
- checkedInAt
- source: STAFF_SEARCH | QR | MANUAL

### RafflePrize

- id
- eventId
- name
- description
- quantity
- sponsorId
- drawOrder
- createdAt
- updatedAt

### RaffleDraw

- id
- eventId
- prizeId
- status: PENDING | DRAWING | COMPLETED | CANCELLED
- startedAt
- completedAt
- createdByUserId

### RaffleWinner

- id
- eventId
- drawId
- prizeId
- attendeeId
- announcedAt
- createdAt

### Sponsor

- id
- eventId
- name
- tier
- websiteUrl
- logoUrl
- displayCopy
- createdAt
- updatedAt

### EventReport

- id
- eventId
- status: DRAFT | SAVED | EXPORTED
- title
- markdown
- structuredJson
- model
- promptVersion
- generatedByUserId
- generatedAt
- updatedAt

### AiGenerationLog

- id
- eventId
- reportId
- feature: EVENT_RECAP_REPORT
- provider
- model
- promptVersion
- inputTokenEstimate
- outputTokenEstimate
- status: SUCCESS | FAILED
- errorMessage
- createdAt

## AI Event Recap Technical Design

### Input Contract

The AI should receive a compact, privacy-aware event summary, not raw attendee rows.

Example input shape:

```ts
type EventRecapInput = {
  event: {
    name: string;
    venue?: string;
    startsAt: string;
    endsAt?: string;
    description?: string;
  };
  attendance: {
    totalRegistered: number;
    totalCheckedIn: number;
    checkInRate: number;
    checkInByHour: Array<{ hour: string; count: number }>;
    ticketTypeBreakdown: Array<{ ticketType: string; registered: number; checkedIn: number }>;
  };
  raffle: {
    prizeCount: number;
    drawCount: number;
    winnerCount: number;
    prizes: Array<{ name: string; quantity: number; winnerCount: number }>;
  };
  sponsors: Array<{ name: string; tier?: string }>;
  operatorNotes?: string;
};
```

### Output Contract

The AI must return structured JSON first. Markdown is generated from validated JSON.

```ts
type EventRecapOutput = {
  title: string;
  executiveSummary: string;
  attendanceSummary: string;
  checkInSummary: string;
  raffleSummary: string;
  sponsorSummary: string;
  operationalHighlights: string[];
  improvementSuggestions: string[];
  socialMediaRecap: string;
};
```

### Guardrails

- Do not send raw attendee names or emails to the model unless explicitly needed later.
- Do not let AI invent attendance numbers.
- Numeric facts must come from database aggregation only.
- AI-generated report must be saved as draft first.
- User can edit before final save/export.
- Store prompt version and model name for reproducibility.

### API Flow

1. User clicks Generate Recap.
2. Server aggregates event stats from database.
3. Server builds `EventRecapInput`.
4. Server calls OpenAI API with structured output request.
5. Server validates response with Zod.
6. Server converts validated JSON into markdown.
7. Server saves `EventReport` with status `DRAFT`.
8. User previews and edits.
9. User saves final report.

## PR Plan

The v2 rebuild should be implemented as 12 PRs. Each PR should be independently reviewable and leave the app in a runnable state.

### PR 1: Project Scaffold

Goal: create the modern GalaGate v2 foundation.

Tasks:

- Add Next.js App Router project structure.
- Add TypeScript, Tailwind, shadcn/ui setup.
- Add pnpm workspace if keeping legacy app folders during migration.
- Add base app shell with navigation.
- Add formatting and lint scripts.
- Add `.env.example`.
- Add README section for v2 local development.

Acceptance criteria:

- `pnpm install` works.
- `pnpm lint` works.
- `pnpm build` works.
- App opens to a basic dashboard shell.

### PR 2: Database Foundation

Goal: add PostgreSQL and Prisma.

Tasks:

- Add Docker Compose PostgreSQL service.
- Add Prisma schema.
- Add initial migrations.
- Add Prisma client setup.
- Add seed script with one organization and one demo event.

Acceptance criteria:

- `pnpm db:migrate` applies migrations.
- `pnpm db:seed` creates demo data.
- Local app can read demo event from database.

### PR 3: Auth and Organization Context

Goal: add basic authenticated organizer workflow.

Tasks:

- Add Auth.js or Clerk.
- Add user session handling.
- Add Organization and OrganizationMember models if not already complete.
- Add protected dashboard routes.
- Add role helpers for OWNER, ADMIN, STAFF, VIEWER.

Acceptance criteria:

- Unauthenticated users cannot access dashboard.
- Authenticated user can access organization event list.
- Role helper functions have unit tests or focused server-side tests.

### PR 4: Event Management

Goal: allow organizers to create and manage events.

Tasks:

- Add event list page.
- Add create event form.
- Add event detail dashboard.
- Add event settings form.
- Add server actions or route handlers for CRUD.
- Add Zod validation.

Acceptance criteria:

- User can create, edit, and archive an event.
- Event pages are scoped to organization membership.
- Invalid form input returns clear validation errors.

### PR 5: Attendee Management and CSV Import

Goal: replace hardcoded attendees with real attendee data.

Tasks:

- Add attendee table.
- Add manual attendee creation.
- Add CSV import.
- Add duplicate handling based on email and ticket code.
- Add attendee export endpoint.
- Add demo CSV fixture.

Acceptance criteria:

- Organizer can import attendees into an event.
- Organizer can search and filter attendees.
- Duplicate records are rejected or surfaced clearly.
- Export returns event attendees as CSV.

### PR 6: Staff Check-in Workflow

Goal: build the core live check-in experience.

Tasks:

- Add staff check-in route.
- Add search by email/name/ticket code.
- Add attendee result state.
- Add check-in mutation.
- Add duplicate check-in prevention.
- Add CheckInRecord persistence.

Acceptance criteria:

- Staff can check in an attendee.
- Checked-in attendee cannot be checked in twice.
- Check-in timestamp and staff user are stored.
- Check-in page is usable on mobile width.

### PR 7: Realtime Dashboard Updates

Goal: add realtime operational visibility.

Tasks:

- Add Socket.IO server setup.
- Add client socket provider.
- Broadcast check-in events.
- Update dashboard counts live.
- Add connection status indicator.

Acceptance criteria:

- Opening dashboard and check-in page in two browsers shows live count updates.
- Reconnect behavior does not break page state.
- App still works if socket connection is unavailable, using normal refresh/fetch fallback.

### PR 8: Raffle Core

Goal: implement persistent raffle prizes, draws, and winners.

Tasks:

- Add prize management.
- Add raffle control page.
- Add draw algorithm from checked-in eligible attendees.
- Exclude existing winners by default.
- Persist RaffleDraw and RaffleWinner.
- Add winner history.

Acceptance criteria:

- Organizer can create prizes.
- Organizer can draw winners from checked-in eligible attendees.
- Winners are persisted and excluded from later draws.
- Winner list can be exported.

### PR 9: Stage Display

Goal: add stage-facing raffle display.

Tasks:

- Add public or event-token protected stage display route.
- Add Socket.IO draw event listener.
- Add draw animation.
- Add winner reveal state.
- Add sponsor/logo area placeholder.

Acceptance criteria:

- Control page can trigger stage display updates in realtime.
- Stage display works fullscreen.
- Display does not expose organizer-only controls.

### PR 10: Sponsor Management

Goal: add sponsor assets and visibility.

Tasks:

- Add sponsor model usage in UI.
- Add sponsor CRUD.
- Add logo URL field first; file upload can come later.
- Connect sponsor to raffle prizes.
- Show sponsor assets on stage display.

Acceptance criteria:

- Organizer can add and edit sponsors.
- Prize can be associated with sponsor.
- Stage display can show sponsor branding.

### PR 11: Analytics Dashboard

Goal: add deterministic post-event analytics before AI.

Tasks:

- Add attendance summary cards.
- Add check-in timeline chart.
- Add ticket type breakdown.
- Add raffle summary.
- Add sponsor summary.
- Add server-side aggregation functions.

Acceptance criteria:

- Analytics are computed from database, not hardcoded.
- Completed event shows attendance, check-in, raffle, and sponsor summaries.
- Aggregation functions are testable and reused by AI recap input builder.

### PR 12: AI Event Recap Report

Goal: add the only v1 AI feature.

Tasks:

- Add OpenAI client wrapper.
- Add `buildEventRecapInput(eventId)` aggregation service.
- Add Zod schema for AI output.
- Add `/events/[eventId]/reports/new` generate flow.
- Save generated report as `DRAFT`.
- Add report preview/editor.
- Add final save action.
- Add `AiGenerationLog` records.
- Add graceful error handling for missing API key, model error, and invalid output.

Acceptance criteria:

- User can generate a recap report from real event data.
- Report numbers match database analytics.
- AI output is validated before saving.
- Report is editable before final save.
- If AI fails, app returns a useful error and does not create a broken report.

## Suggested Branch Naming

- `v2/scaffold`
- `v2/database-foundation`
- `v2/auth-org-context`
- `v2/event-management`
- `v2/attendee-management`
- `v2/check-in-workflow`
- `v2/realtime-dashboard`
- `v2/raffle-core`
- `v2/stage-display`
- `v2/sponsor-management`
- `v2/analytics`
- `v2/ai-event-recap`

## Definition of Done for v2 MVP

The MVP is complete when a demo user can:

1. Sign in.
2. Create an event.
3. Import attendees.
4. Check in attendees from a staff page.
5. Watch dashboard metrics update.
6. Create raffle prizes.
7. Draw winners on a stage display.
8. Save winner records.
9. Manage sponsors.
10. View analytics.
11. Generate and edit an AI event recap report.

## Portfolio Case Study Targets

When the v2 MVP is finished, the portfolio case study should emphasize:

- Rebuilt legacy event-day prototype into a production-style event operations platform.
- Designed normalized event, attendee, check-in, raffle, sponsor, and report data models.
- Implemented realtime check-in and raffle updates with Socket.IO.
- Built deterministic analytics from PostgreSQL aggregations.
- Added a human-reviewed AI recap workflow using structured output and validation.
- Preserved real-world UTCSSA event context while making the system reusable for future events.
