# QRZ — Ham Radio Social Network

Next.js + Supabase social platform for ham radio operators. Share QSL cards, connect with operators, and manage your digital ham profile.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Open **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`
3. Copy **Project URL**, **anon key**, and **service role key** from **Settings → API**

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_SITE_URL=http://localhost:3000

SMTP_EMAIL=qrzinfo@gmail.com
SMTP_APP_PASSWORD=your-gmail-app-password
NOTIFY_EMAIL=qrzinfo@gmail.com
ADMIN_EMAIL=qrzinfo@gmail.com
```

### 3. Supabase Auth URLs

In **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (or your production domain)
- **Redirect URLs:**
  - `http://localhost:3000/**`
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/**`

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Admin access

Register with `qrzinfo@gmail.com` (or the email in `ADMIN_EMAIL`) to get admin access at `/admin`.

## Features

- **Auth:** Register, login, email OTP verification, password reset (Nodemailer/Gmail)
- **Profile:** Digital ham card, edit profile, social links
- **QSL:** Wallet, send cards, admin QSL templates
- **Network:** Follow operators
- **Feed:** Activity posts
- **Admin:** Users, support inbox, broadcasts, QSL templates
- **Contact:** Support form with email notifications

## Deploy

Deploy to Vercel, add all env vars, and point your domain. Run the Supabase migration on your production project.
