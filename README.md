# ManzilIQ — Module-wise Versions

Prototype built module by module. Each version is cumulative — it contains
everything from the previous versions plus one new module. The `main` branch
is untouched; all versions live as tags on this line.

## Run it

```bash
npm install
cp .env.example .env   # add your Supabase URL + anon key
# In Supabase SQL Editor, run supabase/schema.sql (safe to re-run)
npm run dev
```

Open http://localhost:5173

## Versions

| Tag | Module added | What's inside |
| --- | ------------ | ------------- |
| `v1-prototype` | — | Login form + Supabase connection, session persistence |
| `v2-auth` | 1 · Authentication | Sign up with role (buyer/dealer/society_admin/super_admin), sign in, protected routes, role-based dashboard, `profiles` table + RLS |
| `v3-marketplace` | 2 · Property Marketplace | Search by city/area, filters (society, block/size, price range, Res/Com, status), sort, property detail, add property (dealer/society), plot comparison (up to 3, side-by-side, saved) |
| `v4-society` | 3 · Society Management | Plot inventory: CSV upload, manual entry, block grouping, edit/delete/block; interactive plot map (color-coded, block switcher, zoom, click details); dealer management: join requests, lot assignment with commission & expiry, revoke, performance, lot history |
| `v5-dealer` | 4 · Dealer Management | Society discovery & join (browse, request, track status); lot view (assigned plots only, showing-to-client, release); lead management (add, call/visit log, follow-up reminders, Hot/Warm/Cold, assign plot); 6-stage deal pipeline |
| `v6-maps` | 5 · Interactive Maps | Customer map view: society layout map, click plot → details popup, color-coded availability, filters (block/size/status), zoom, embeddable map snippet |
| `v7-booking` | 6 · Booking | Booking flow (plot select, direct/via dealer, token payment simulated, installment plan, confirmation + reference no.); society/admin approvals (approve → reserve, token confirm, transfer → sold); my bookings |
| `v8-payment` | 7 · Payment | Payment methods (JazzCash/EasyPaisa/bank+cash+cheque), custom installment plans, auto schedule on approval, due calendar, late fee 2%/mo, overdue escalation, receipts (print/PDF), financial reporting (revenue, pending, defaulters, commission, monthly trend) |
| `v9-ai-price` | 8 · AI Price Prediction | Price estimator: Gemini AI when key present, local comparables fallback (avg PKR/marla from plots+listings), low/mid/high band with reasoning |
| `v10-notifications` | 9 · Notifications | In-app inbox with unread badge, trigger events (booking/payment/lot/transfer), due-date & late alerts, broadcast (society→customers/dealers, admin→societies/all), message templates, scheduled announcements |
| `v11-admin` | 10 · Admin Panel | Dispute management (file, mediate, freeze plot, resolution notice, close/escalate), legal template management (edit/preview/version/publish), platform analytics (societies, dealers, customers, GMV, plots, growth) |
| `v12-legal` | 11 · Legal Documentation | Auto-generated documents (allotment on approval, token receipt, installment receipts, transfer deed + NOC on completion, cancellation letter); auto-fill from DB, society letterhead, watermark, signature placeholders, version history, expiry tracking; customer locker, society bulk print, dealer copies, admin audit trail |
| `v4-society` | 3 · Society Management | _planned_ |
| `v5-dealer` | 4 · Dealer Management | _planned_ |
| `v6-maps` | 5 · Interactive Maps | _planned_ |
| `v7-booking` | 6 · Booking | _planned_ |
| `v8-payment` | 7 · Payment (simulated) | _planned_ |
| `v9-ai-price` | 8 · AI Price Prediction | _planned_ |
| `v10-notifications` | 9 · Notifications | _planned_ |
| `v11-admin` | 10 · Admin Panel | Dispute management, legal templates, platform analytics |
| `v12-legal` | 11 · Legal Documentation | Auto-generated documents + locker + audit trail |
| `v13-analytics` | 12 · Analytics & Reporting | _planned_ |
