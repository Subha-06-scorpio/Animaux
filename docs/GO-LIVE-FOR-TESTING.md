# Put ANIMAUX 2026 online for testing (≈20 minutes, all free tiers, browser only)

You need three free accounts: **GitHub** (holds the code), **Supabase** (database, logins, uploads) and **Vercel** (hosts the site). No coding is needed.

---

## Step 1 — Put the code on GitHub (5 min)
**Option A, recommended:** connect GitHub to Claude at https://claude.ai/connect-github, create an empty repository (for example `animaux-2026`, set to Private) and tell Claude its name. Claude pushes the code for you.

**Option B, manual:**
1. Unzip `animaux-2026-source.zip`.
2. Install GitHub Desktop and choose **File → Add local repository**, picking the unzipped folder.
3. Click **Publish repository** (tick *Keep this code private*).

## Step 2 — Create the database on Supabase (7 min)
1. Go to https://supabase.com → **Start your project** → **New project**.
   - Name: `animaux-2026` · choose a strong database password (save it) · Region: **Mumbai (ap-south-1)**.
2. Wait about 2 minutes for it to finish setting up.
3. Left menu → **SQL Editor** → **New query** → paste the whole file `supabase/migrations/20261021000000_init.sql` → **Run**. You should see "Success. No rows returned".
4. **New query** again → paste `supabase/seed.sql` → **Run**. This loads the events, team, schedule and FAQs.
5. Left menu → **Authentication → Users → Add user → Create new user**. Enter your email and a password, and tick **Auto Confirm User**.
6. **SQL Editor → New query** → paste `supabase/make-admin.sql`. Change `organiser@example.com` to the email from step 5 and **Run**.
7. **Authentication → Sign In / Providers** → turn **off** "Allow new users to sign up". This stops strangers creating accounts.
8. **Project Settings → API keys** (or **Data API**). Keep this tab open; you need three values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` / secret key → `SUPABASE_SERVICE_ROLE_KEY` (**secret, never share it**)

## Step 3 — Host it on Vercel (5 min)
1. Go to https://vercel.com → **Sign up with GitHub**.
2. **Add New… → Project** → **Import** your `animaux-2026` repository.
3. Open **Environment Variables** and add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (secret) |
| `SUPABASE_STORAGE_BUCKET` | `media` |
| `IP_HASH_SALT` | any long random text |
| `NEXT_PUBLIC_FEST_TIMEZONE` | `Asia/Kolkata` |

4. Click **Deploy** and wait about 2 minutes. You get a link like `https://animaux-2026.vercel.app`.
5. Back in **Settings → Environment Variables**, add `NEXT_PUBLIC_SITE_URL` with that link. Then go to **Deployments → ⋯ → Redeploy**.
6. In Supabase, open **Authentication → URL Configuration** and set **Site URL** to the same link.

## Step 4 — Test it (5 min)
- Open the site on your phone and register for an event. You should get an ID like `ANX26-FOR-XXXXX`.
- Try registering again with the same email. It should be refused.
- Send a message from the Contact page.
- Open `/admin` and log in with the Supabase user from Step 2.5. You should see the registration and the enquiry.
- Click **Export CSV** to download the registrations.
- In **Admin → Events**, untick "Registration open" on any event. The website should show it as closed right away.
- In **Admin → Team**, upload a photo for one person.

Share the link with your team for feedback. Add teammates as dashboard users by repeating Steps 2.5–2.6. Use the role `editor` for content and `registrations` for the help desk.

## Optional — confirmation emails
Create a free account at https://resend.com, verify a domain, then add `RESEND_API_KEY` and `EMAIL_FROM` in Vercel and redeploy.

## If something goes wrong
- **The site shows "Something went wrong":** in Vercel, open **Deployments → your deployment → Logs**. The most common cause is a mistyped environment variable.
- **Login says "no dashboard access":** step 2.6 wasn't run, or used a different email.
- **Uploads fail:** check that the `media` bucket exists in Supabase → **Storage** (the migration creates it).
