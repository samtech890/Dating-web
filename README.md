# HeartLink

HeartLink is a responsive dating website built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase Auth. It includes email/password and Google authentication, profile management, avatar uploads, discovery APIs, and X/GitHub OAuth entry points.

## Run locally

Requires Node.js 18.18 or later.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set your Supabase project URL and publishable key.
3. Configure Supabase Auth redirect URLs and providers. See [SETUP_GUIDE.md](./SETUP_GUIDE.md), [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md), and [SOCIAL_OAUTH_SETUP.md](./SOCIAL_OAUTH_SETUP.md).
4. Start the app with `npm run dev` and open `http://localhost:3000`.

Run `npm run lint` and `npm run build` to validate the project.

## Supabase

Apply the SQL files in `supabase/migrations/` to a Supabase project. OAuth provider secrets belong only in the provider and Supabase dashboards; never place them in client-side environment variables.

Before enabling X/GitHub OAuth, review the account-linking safety limitation documented in [SOCIAL_OAUTH_SETUP.md](./SOCIAL_OAUTH_SETUP.md).
