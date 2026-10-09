# ManzilIQ Versions — Run Guide

Har version alag zip mein hai. Har version pichhle version par built hai
(cumulative), is liye latest version mein sab kuch hota hai.

## Chahiye (Requirements)

1. **Node.js 18 ya newer** — https://nodejs.org se install karo
2. **Supabase account (free)** — https://supabase.com par banao
3. Supabase project banao, phir **Project Settings → API** se ye 2 cheezein copy karo:
   - Project URL
   - anon / public key

## Run karne ke steps (har version ke liye same)

**Step 1 — Zip extract karo**
Version ki zip ko kisi folder mein extract karo.

**Step 2 — Dependencies install karo**
Us folder mein terminal kholo aur chalao:

```bash
npm install
```

**Step 3 — `.env` file banao**
`.env.example` ko copy karke `.env` naam do, aur apni Supabase keys dalo:

```
VITE_SUPABASE_URL=https://tumhara-project.supabase.co
VITE_SUPABASE_ANON_KEY=tumhari-anon-key
```

**Step 4 — Database tables banao (sirf pehli dafa)**
1. Supabase dashboard kholo → **SQL Editor**
2. `supabase/schema.sql` file ka saara text copy karke SQL Editor mein paste karo
3. **Run** dabao
4. Storage bucket `documents` bhi isi SQL se ban jayega

**Step 5 — App chalao**

```bash
npm run dev
```

Browser mein kholo: **http://localhost:5173**

## Versions

| Version | Tag | Andar kya hai |
| ------- | --- | ------------- |
| v1-prototype | `v1-prototype` | Login form + Supabase connection |
| v2-auth | `v2-auth` | + Poora Authentication module: role-wise registration (Society: NOC/SECP upload · Dealer: CNIC/license upload · Customer: CNIC/contact), admin verification queue (approve/reject/blacklist) |
| v3-marketplace | `v3-marketplace` | + Property Marketplace: search/filters/sort, property detail, add property, plot comparison (3 tak, side-by-side, saved) |
| v4-society | `v4-society` | + Society Management: plot inventory (CSV upload, manual entry, edit/delete), interactive plot map (color-coded, zoom), dealer management (join requests, lot assignment, commission, revoke, performance) |
| v5-dealer | `v5-dealer` | + Dealer Management: society discovery & join, lot view (showing-to-client, release), leads (call/visit log, follow-up, Hot/Warm/Cold), 6-stage deal pipeline |
| v6-maps | `v6-maps` | + Interactive Maps: customer map view (color-coded, click details, filters, zoom, embed code) |

## Accounts kaise banayein (v2-auth)

- **Customer:** Register → Buyer → email/password → profile complete
- **Dealer / Society:** Register → role choose karo → documents upload karo →
  account **Pending** rahega jab tak admin approve na kare
- **Admin (super_admin):** Supabase → Authentication mein user banao, phir
  SQL Editor mein chalao:

```sql
update profiles set role = 'super_admin', verification_status = 'approved'
where email = 'tumhara-admin-email@example.com';
```

Phir login karke **Verification queue** mein pending societies/dealers ko
approve ya reject karo.

## Masla aaye to

- **"Database not connected"** nazar aaye → `.env` mein keys check karo aur
  dev server restart karo (`npm run dev` dobara)
- **Login ke baad error** → `supabase/schema.sql` Supabase mein run hua ya nahi,
  ye check karo
- **Table already exists** error → fikar nahi, SQL dobara run karne ke liye safe hai
