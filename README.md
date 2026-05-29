# A.ing Website

Gachon University AI Academic Club A.ing official website.

## Tech Stack

- Frontend: React 18, TypeScript, Tailwind CSS
- Backend: Supabase Auth, PostgreSQL, Row Level Security
- Deploy: Vercel

## Project Structure

```text
src/
  components/      Shared UI components
  context/         Auth and site setting contexts
  lib/             Supabase client and shared types
  pages/
    admin/         Admin pages
    ...            Public and member pages
```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_AUTH_REDIRECT_ORIGIN=https://aing-website.vercel.app
VITE_ENABLE_GOOGLE_OAUTH=false
```

Existing `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` values are also accepted during migration.

## Supabase Auth URL Setup

In Supabase Dashboard, set Authentication > URL Configuration like this:

- Site URL: `https://aing-website.vercel.app`
- Redirect URLs: `https://aing-website.vercel.app/*`
- Recommended explicit callback URL: `https://aing-website.vercel.app/auth/callback*`
- Optional local testing URL: `http://localhost:3000/*`

For email templates, use Supabase's confirmation link variable, not the site URL variable. The button in the template should point to `{{ .ConfirmationURL }}` so the auth token/code reaches `/auth/callback`. Include `{{ .Token }}` in the same template if you want users to type the 6-digit code on the login screen instead of opening the link. If an old email opens `localhost:3000`, opens the home page without a session, or shows `otp_expired`, request a new link after these settings are saved.

Supabase may return `email rate limit exceeded` when links are requested repeatedly. The app adds a local resend cooldown and checks registered member emails before sending where the database RPC is available, but the provider-side throttle still has to expire or be adjusted in Supabase Auth rate-limit settings.

For the fastest login experience, enable Google OAuth in Supabase and Google Cloud, then set `VITE_ENABLE_GOOGLE_OAUTH=true` in Vercel. The app still enforces `@gachon.ac.kr` plus active member registration after OAuth returns.

If a magic-link URL with `access_token` or `refresh_token` has been shared, treat that link as compromised. Do not use it, revoke that user's active sessions in Supabase Auth if possible, and request a fresh link.

## Database Setup

Run `schema_final.sql` in the Supabase SQL Editor.

The app uses Supabase email OTP or magic-link authentication. A user is accepted only when the authenticated email belongs to an active registered member in `members.email` or `members.contact_email`.

## Initial Admin Setup

1. Run `schema_final.sql`.
2. Insert or update an active member row with the admin's school email.
3. Set that member's `role` to `admin`.
4. Log in through the site with the registered school email and complete the email verification flow.

No application password or password hash is required.

## Main Features

| Area | Features |
| --- | --- |
| Members | Member directory, profile editing, LinkedIn/GitHub-centered public profile |
| Activities | Simplified activity cards managed separately from history |
| History | Featured achievements and milestones in a timeline |
| Team | Member-only team recruiting with ownership checks, limits, and rate controls |
| Contact | Official email-first contact flow |
| Admin | Site settings, members, activities, projects, team posts, messages, ops content |

## Security Notes

- Members and Team pages require a verified registered member session.
- Team posts are limited to three open posts per account.
- Team writes and applications include length checks, duplicate/self-apply blocks, and rate-limit policies.
- Community/Board routes and admin management pages were removed.
- Public API selections avoid password hashes and private contact fields.
