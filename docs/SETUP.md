# Setup & deployment

## 1. Create the Supabase project
1. Go to https://supabase.com → **New project**. Choose a region close to your users (Mumbai `ap-south-1` for India).
2. **SQL Editor** → paste all of `supabase/migrations/20261021000000_init.sql` → **Run**.
   This creates:
   - all tables, with Row Level Security turned on
   - duplicate-registration indexes
   - a public `media` storage bucket
3. **Project Settings → API**: copy the Project URL, the `anon` key and the `service_role` key into `.env.local`. See `.env.example` for the variable names.
   > The service-role key bypasses security. Keep it server-side only. Never paste it into client code or anything prefixed `NEXT_PUBLIC_`.

### Updating an existing project
Run every file in `supabase/migrations/` in date order. Each one is safe to re-run. `20261111000000_survival_files.sql` adds main/mini events and taglines, and makes email optional.

## 2. Load the starter content
Paste `supabase/seed.sql` into the **SQL Editor** and press **Run** (safe to re-run). Or, from a computer with Node installed:
```bash
npm run seed           # same content, via the API
```
After editing `src/content/`, regenerate the SQL with `npx tsx scripts/make-seed-sql.mts`.
Skip this if you would rather start empty and add everything from the dashboard.

## 3. Create organiser accounts
1. Supabase → **Authentication → Users → Add user**. Enter an email and password and tick **Auto confirm**.
2. **SQL Editor** → run `supabase/make-admin.sql` with that email and a role:

| Role | Can do |
|---|---|
| `admin` | Everything, including festival settings and deleting registrations |
| `editor` | Events, team, gallery, schedule, announcements, FAQs |
| `registrations` | View, filter and export registrations, change their status, answer enquiries |

3. Under **Authentication → Sign In / Providers**, turn off **Allow new users to sign up**. Only accounts you create should exist. A self-registered account still gets no dashboard access without an `admin_users` row.

## 4. Confirmation emails (optional)
1. Create an account at https://resend.com and verify your sending domain.
2. Set `RESEND_API_KEY` and `EMAIL_FROM`.

Without these, registration still works. The success screen tells participants to note down their ID, and the dashboard shows "Email sent: no".

## 5. Deploy to Vercel
1. Push this folder to a GitHub repository.
2. https://vercel.com → **Add New → Project** → import the repo. The framework is detected automatically.
3. Add every variable from `.env.example` under **Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to your real domain and leave the `LOCAL_*` variables empty.
4. Deploy. Then sign in at `/admin` and work through the **Go-live checklist**.

## Security notes
- All writes go through server actions or route handlers, which re-check the signed-in user's role. `src/proxy.ts` adds an extra gate on `/admin`.
- Public forms are protected by:
  - server-side Zod validation
  - a honeypot field
  - per-IP rate limits (in-memory, per server instance)
  - unique indexes in the database
- For strict global rate limits under heavy load, swap `rateLimit` in `src/lib/security.ts` for Upstash Redis.
- Participant data (registrations, enquiries) has no public RLS policy. It is reachable only through the dashboard. IPs are stored as salted hashes.
- CSV exports neutralise spreadsheet formula injection.
- **Known limit:** event capacity is checked before insert. Two registrations arriving in the same instant could exceed a capacity by one. Close the event manually if exact limits matter.

## Local development without Supabase
Leave the Supabase variables empty and set `LOCAL_ADMIN_PASSWORD`:
- Data is stored in `.data/db.json`; delete that file to reset.
- Uploads go to `.data/uploads` and are served from `/media/...`.
