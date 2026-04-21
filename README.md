# Transport Advisory — Frontend

Web dashboard for the Transport Advisory vehicle compliance platform.

## Tech Stack

- **React + TypeScript**
- **Vite 5** (dev server + build)
- **Tailwind CSS 4** (CSS-first theme)
- **TanStack Query** (server state)
- **React Router v7**
- **React Hook Form**
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Design

**Theme:** Classic green (`#0A3828`) with gold accents, white cards, soft elevation. Designed for clarity at a glance, trust, and mobile-first usability on Nigerian devices.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start dev server
```bash
npm run dev
```

App runs on http://localhost:5173 and proxies `/api/*` to `http://localhost:5000` (backend).

### 3. Build for production
```bash
npm run build
```

## Demo Credentials

After running the backend seed (`npm run db:seed` in the backend):

- **User**: `demo@transportadvisory.ng` / `Demo@2026`
- **Admin**: `admin@transportadvisory.ng` / `Admin@2026`

## Pages

### User
- `/login` · `/register` — Split-screen auth with branding
- `/dashboard` — Overview with stats, urgent documents, quick actions
- `/vehicles` — Vehicle list & add new (with NIID plate lookup)
- `/vehicles/:id` — Document manage per vehicle
- `/applications` — Renewal apps with Paystack integration
- `/verifications` — Pre-purchase vehicle checks (₦1,000)
- `/settings` — Profile, password, subscription

### Admin (role=ADMIN)
- `/admin` — Stats, unconfirmed reminders alerts
- `/admin/applications` — Queue with status/upload actions
- `/admin/users` — All users
- `/admin/deliveries` — Delivery tracking
- `/admin/reminders` — Phone follow-up queue (unconfirmed 7-day reminders)
