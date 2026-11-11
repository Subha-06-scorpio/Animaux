# Organiser guide — running the website without code

Sign in at **yoursite.com/admin**. Changes go live on the website as soon as you press **Save**.

## Before launch: the go-live checklist
The **Overview** page lists what still shows placeholder content. Work down it.

## Festival settings  *(admin role)*
**Festival settings** controls site-wide details:
- dates: these drive the countdown. Tick "Dates are confirmed" once final.
- contact people (one per line, `Name | phone`), shown on the Contact page and in the footer
- college, address and Google Maps embed
- email, phone, WhatsApp and Instagram
- brochure PDF upload
- participant guidelines
- **Accept registrations** master switch, which pauses every event at once

## Events
**Events → Add event**, or click an event to edit it.
- The **URL slug** fills in automatically from the name. Avoid changing it after you share links.
- **Participation**: Individual or Team. For teams, set the min and max size *including the leader*.
- **Fee**: tick "TBA" until the fee is decided. Enter 0 for a free event.
- **Deadline**: registration closes automatically after this time.
- **Registration open**: untick to close registration immediately.
- **Visible on website**: untick to hide a draft. New events start hidden.
- **Event type**: *Main* events take online registrations. *Mini* events show "On the spot · walk in", with no form.
- **Capacity**: for team events, this is the number of **teams** (e.g. The Last Trace = 5). Registration closes automatically when it's full.
- **Extra registration questions**: add event-specific questions. Choose **Photo upload** to collect a photo with the registration (as for Shutter Safari). Photos appear as thumbnails in Registrations and as links in the CSV.
- Untick **Mark as sample** on real events to remove the "Sample" badge.
- Use the arrows to reorder events. The eye icon hides or shows an event.
- An event that already has registrations can't be deleted. Hide it instead.

## Registrations  *(admin and registrations roles)*
- Every registration is also copied to the **ANIMAUX'26 Registrations** Google Sheet (in the animaux.zoology@gmail.com Drive) and emailed to that inbox. Share the sheet with teammates from Google Sheets → Share (view-only is safest).
- The sheet only ever gains rows. If you cancel or mark someone "Attended" in the dashboard, that change appears in the dashboard and CSV, not in the sheet.
- Filter by event and status, or search by name, email, phone, team or ID.
- Expand a row (▼) to see team members and answers.
- Set the status to **Attended** at the venue, or **Cancelled** to free up the participant's email and phone for re-registration.
- **Export CSV** downloads exactly what is currently filtered, and opens in Excel or Google Sheets.

## Team
**Team → Add member**:
- Choose a group (Faculty / Student Leadership / Organising Teams).
- Pick a section, or type a new one.
- Upload a photo. Square or portrait photos of at least 800px work best, and they are resized automatically.
- Optional: a short intro, a spirit animal (shown on hover) and a social link.
- Reorder with the arrows and hide with the eye icon.

## Gallery
**Gallery → Add item**:
- **Photo**: upload a JPG, PNG or WebP. Large photos are compressed before upload.
- **Video**: upload an MP4, WebM or MOV file (up to 100 MB), or paste a YouTube link. Instagram links open on Instagram.
- Choose a category, caption, optional event label and date, and a shape (landscape, portrait or square).

## Schedule, announcements, FAQs
- **Schedule**: one entry per slot (day, time, venue). Add an event slug to link the slot to its event page.
- **Announcements**: pinned items show first. They appear in the homepage ticker and on the Schedule page.
- **FAQs**: these power the accordion on the Contact page.

## Enquiries  *(admin and registrations roles)*
Messages from the Contact page arrive here. Reply by email, then mark them **In progress** or **Resolved**.

## Content that lives in code
The Species Spotlight and the Forensics evidence board are in `src/content/species.ts`. A developer can edit them, and should confirm the conservation statuses on iucnredlist.org.
