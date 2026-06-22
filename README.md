# GalaGate

GalaGate is being rebuilt as a real-time event operations platform for student organizations and community events.

The v2 direction covers:

- Event setup
- Attendee import and management
- Staff check-in
- Live raffle display
- Sponsor asset management
- Post-event analytics
- AI-generated event recap reports

See the implementation plan in [`docs/galagate-v2-technical-plan.md`](docs/galagate-v2-technical-plan.md).

## Repository Structure

```txt
apps/web/      GalaGate v2 Next.js application
Backend/       Legacy Flask prototype
CheckIn/       Legacy Next.js check-in prototype
Lottery/       Legacy Nuxt raffle display prototype
docs/          Planning and technical documentation
```

The legacy folders are kept as reference while v2 is rebuilt in `apps/web`.

## GalaGate v2 Local Development

Use Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

The v2 app runs at [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Database

GalaGate v2 uses PostgreSQL and Prisma.

Start the local database after Docker Desktop is running:

```bash
docker compose up -d postgres
pnpm db:push
pnpm db:seed
```

Prisma commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

The local default database URL is:

```txt
postgresql://galagate:galagate@localhost:5432/galagate
```

## Environment

Copy `.env.example` to `.env.local` before running database or auth flows locally.

```bash
cp .env.example .env.local
```

AI Event Recap Report is planned for PR 12.

## Development Login

The organizer dashboard uses Auth.js credentials during local development.

Default credentials:

```txt
Email: junyu@example.com
Password: galagate-dev
```

The protected dashboard is available at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

Event management routes:

```txt
/dashboard/events
/dashboard/events/new
/dashboard/events/[eventId]
/dashboard/events/[eventId]/settings
```

Override credentials in `.env.local`:

```txt
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
DEV_AUTH_EMAIL="junyu@example.com"
DEV_AUTH_PASSWORD="galagate-dev"
```

AI Event Recap Report is planned for PR 12.
