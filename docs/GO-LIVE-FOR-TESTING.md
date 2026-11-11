# Put ANIMAUX'26 online (~30 minutes, free, all in the browser)

**Golden rule:** sign up for every service below with **animaux.zoology@gmail.com**. The festival then owns the website, the registration data and the emails, rather than one student.

You will create four free accounts:

| Service | What it does |
|---|---|
| GitHub | holds the code |
| Supabase | stores registrations, logins and uploaded photos |
| Vercel | puts the website online |
| Resend | emails every registration to animaux.zoology@gmail.com |

---

## Step 1 — GitHub (5 min)
1. Go to https://github.com/signup and sign up with animaux.zoology@gmail.com.
2. **Easiest:** connect GitHub to Claude at https://claude.ai/connect-github, create an empty **private** repository named `animaux-2026`, and tell Claude. Claude uploads the code.
   **Or do it yourself:** unzip `animaux-2026-source.zip`, install **GitHub Desktop**, then **File → Add local repository** → pick the folder → **Publish repository** (keep it private).

## Step 2 — Supabase: the database (10 min)
1. Go to https://supabase.com and sign in with GitHub. Then **New project**:
   - Name: `animaux-2026`
   - Database password: choose a strong one and save it
   - Region: **Mumbai (ap-south-1)**
2. Wait about 2 minutes. Then, in the left menu, **SQL Editor → New query**, paste each file below and press **Run**, in this order:
   1. `supabase/migrations/20261021000000_init.sql`
   2. `supabase/migrations/20261111000000_survival_files.sql`
   3. `supabase/seed.sql` (loads all 14 events, the team, schedule, FAQs and contacts)
3. **Authentication → Users → Add user → Create new user**:
   - Email: animaux.zoology@gmail.com
   - Password: a strong one. This becomes the dashboard login.
   - Tick **Auto Confirm User**.
4. **SQL Editor → New query** → paste `supabase/make-admin.sql`, change `organiser@example.com` to `animaux.zoology@gmail.com`, then **Run**.
5. **Authentication → Sign In / Providers** → turn **off** "Allow new users to sign up".
6. **Project Settings → API keys** (or **Data API**). Keep this tab open; you need three values:
   - Project URL
   - `anon` / publishable key
   - `service_role` / secret key (**never share this one**)

## Step 3 — Resend: registration emails (5 min)
1. Go to https://resend.com/signup and sign up with **animaux.zoology@gmail.com**. This must be the same Gmail.
2. **API Keys → Create API key**. Give it "Sending access" and copy the key (it starts with `re_`).
3. That's all. Every registration and help-desk message is now emailed to animaux.zoology@gmail.com.
   - Each email includes the name, college, year, contact number, team and uploaded photo.
   - Hitting reply goes to the participant (when they gave an email).
   - *Optional, later:* to also email confirmations to participants, verify a domain in Resend and set `EMAIL_FROM`.

## Step 4 — Vercel: put it online (5 min)
1. Go to https://vercel.com/signup and choose **Continue with GitHub**.
2. **Add New… → Project** → **Import** `animaux-2026`.
3. Open **Environment Variables** and add these:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (secret) |
| `SUPABASE_STORAGE_BUCKET` | `media` |
| `RESEND_API_KEY` | the `re_…` key from Resend |
| `ORGANISER_EMAIL` | `animaux.zoology@gmail.com` |
| `IP_HASH_SALT` | any long random text, e.g. `animaux-mithibai-2026-xyz` |
| `NEXT_PUBLIC_FEST_TIMEZONE` | `Asia/Kolkata` |

4. Click **Deploy** and wait about 2 minutes. You get a link like `https://animaux-2026.vercel.app`.
5. Copy that link and use it in two places:
   - **Vercel → Settings → Environment Variables:** add `NEXT_PUBLIC_SITE_URL` = the link, then **Deployments → ⋯ → Redeploy**.
   - **Supabase → Authentication → URL Configuration:** set **Site URL** to the same link.

> Want a nicer address? In Vercel → Settings → Domains you can rename it, for example to `animaux26.vercel.app`, or connect a domain you buy.

## Step 5 — Test before you share (5 min)
- Open the link on your phone. Register for **7 Steps**; you should get an ID like `ANX26-STE-XXXXX`.
- Check the **animaux.zoology@gmail.com** inbox for the registration email. Check Spam the first time and mark it "Not spam".
- Register again for 7 Steps with the same number. It should be refused.
- Register for **Shutter Safari** with a photo.
- Send a message from the **Contact** page.
- Open `/admin` and log in with animaux.zoology@gmail.com. You should see the registrations (the Shutter Safari photo as a thumbnail) and the enquiry.
- Click **Export CSV** to download everything as a spreadsheet.

When everything works, put the link in your Instagram bio (@animaux.mithibai) and your WhatsApp groups.

## Add teammates to the dashboard
In Supabase, repeat Steps 2.3–2.4 with their email and a role:
- `admin`: everything
- `editor`: events, team, gallery and announcements
- `registrations`: registrations and help desk only

## If something goes wrong
- **The site shows "Something went wrong":** go to Vercel → Deployments → your deployment → **Logs**. Usually an environment variable is mistyped. Fix it, then **Redeploy**.
- **No emails arriving:** check Spam, and check that the Resend account was created with animaux.zoology@gmail.com. Resend → **Emails** shows each attempt and any error.
- **Login says "no dashboard access":** Step 2.4 wasn't run, or used a different email.
- **Photo upload fails:** check that Supabase → **Storage** has a bucket called `media`. The first SQL file creates it.
