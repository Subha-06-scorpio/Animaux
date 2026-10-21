# ANIMAUX 2026 — Echoes of the Wild

The festival website for the Department of Zoology: an immersive public site, a registration system that needs no participant accounts, and an organiser dashboard.

**Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Motion, Supabase (Postgres, Auth, Storage), React Hook Form and Zod, with optional Resend for confirmation emails.

## What's inside

| Area | Path |
|---|---|
| Home (camera-trap hero, countdown, forensics exhibit, species spotlight) | `/` |
| About · Events (search/filter) · Event detail · Register | `/about`, `/events`, `/events/[slug]`, `/register` |
| Team · Gallery (masonry + lightbox + video) · Schedule & info · Contact/FAQ | `/team`, `/gallery`, `/schedule`, `/contact` |
| Organiser dashboard | `/admin` |

Registration behaviour:
- Validates on both client and server.
- Supports individual and team events, plus custom questions per event.
- Blocks duplicates: one active registration per event per email and per phone, enforced by database unique indexes.
- Issues registration IDs like `ANX26-FOR-7K2QD`.
- Shows when an event is closed, past its deadline or full, and has a master pause switch.
- Rate-limits requests and includes a honeypot field for bots.
- Sends a confirmation email when Resend is configured.

## Run locally (5 minutes, no accounts needed)

```bash
npm install
cp .env.example .env.local
# In .env.local, leave the Supabase values EMPTY and set:
#   LOCAL_ADMIN_PASSWORD=pick-a-password
npm run dev
```

Open http://localhost:3000. The dashboard is at http://localhost:3000/admin, using the password above.

Without Supabase the app runs in **local development mode**: data goes to `.data/db.json`, seeded from `src/content/`. This mode is for building and testing only, and it refuses to run on Vercel.

## Go live

**Quickest path (browser only):** [docs/GO-LIVE-FOR-TESTING.md](docs/GO-LIVE-FOR-TESTING.md)


Follow **[docs/SETUP.md](docs/SETUP.md)**, which covers Supabase, the first admin user, email and Vercel deployment.

## Organisers

The **[docs/ORGANISER-GUIDE.md](docs/ORGANISER-GUIDE.md)** explains how to update events, team, gallery and registrations without touching code.

## Project map

```
src/
  app/(site)/        public pages
  app/admin/         dashboard (login + role-protected pages)
  app/actions/       server actions (public forms, admin mutations)
  app/api/admin/     CSV export, local uploads
  components/        UI (art/, home/, events/, gallery/, admin/…)
  content/           SEED + editable placeholder content, species facts
  lib/               types, zod schemas, auth, data adapters, security
  proxy.ts           session refresh + /admin gate
supabase/migrations  database schema + RLS
scripts/             seed script for Supabase
```

## Placeholders still to replace

Everything marked *placeholder* or *Sample*:
- college name and address
- festival dates (the countdown currently uses a provisional 11 Dec 2026)
- all events, coordinators and fees (fees show "TBA")
- team members, gallery media, WhatsApp, Instagram, map and brochure

The dashboard's **Go-live checklist** tracks these. Check the species conservation statuses in `src/content/species.ts` against iucnredlist.org before launch.
