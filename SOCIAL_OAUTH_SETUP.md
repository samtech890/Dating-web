# HeartLink X and GitHub sign-in

HeartLink uses its existing Supabase Auth client and `/auth/callback` PKCE callback. No provider secret or service-role key belongs in the Next.js app.

## Required app environment

There are no new environment variables. Keep these existing values in `.env.local` and in the deployment's secret/environment settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
```

The publishable key is intended for browser use. Do not put an X/GitHub client secret, Supabase secret/service-role key, OAuth access token, or refresh token in a `NEXT_PUBLIC_*` variable or commit it to source control.

## Supabase URL configuration

1. In Supabase Dashboard, open **Authentication → URL Configuration**.
2. Set **Site URL** to the canonical production origin, for example `https://heartlink.example.com`.
3. Add these exact app callback URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` for local development.
   - `https://heartlink.example.com/auth/callback` for production.
4. Add any additional deployed preview origin explicitly if it is needed. Avoid wildcard production redirect entries.
5. The callback URL registered at each OAuth provider is **not** the app callback above. Use the Supabase Auth callback URL shown on that provider's Supabase settings page: `https://<project-ref>.supabase.co/auth/v1/callback`.

The app constructs its redirect from `window.location.origin`, and its callback only redirects to the local `/profile` or `/auth/login` routes.

## X OAuth 2.0

1. In the [X Developer Portal](https://developer.x.com/en/portal/dashboard), create/select a project and app.
2. Under **User authentication settings**, enable OAuth 2.0 and choose **Web App**.
3. Set the callback/redirect URI to the Supabase Auth callback URL shown in **Supabase → Authentication → Sign In / Providers → X / Twitter (OAuth 2.0)**.
4. Set the website URL to the HeartLink origin. Supply HeartLink's terms/privacy URLs if required by X.
5. In Supabase, open **Authentication → Sign In / Providers → X / Twitter (OAuth 2.0)**, enable it, enter the X OAuth 2.0 client ID and client secret, and save.
6. This app requests only the `users.read` OAuth scope. It does not need X posting/write access or an X email address for authentication. Leave optional email access disabled unless a separate product requirement needs it.

## GitHub OAuth

1. In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App** (or select an existing app).
2. Set the **Authorization callback URL** to `https://<project-ref>.supabase.co/auth/v1/callback`. Use the callback URL shown in **Supabase → Authentication → Sign In / Providers → GitHub**.
3. Set the homepage URL to the HeartLink production origin. Add the local origin for local testing if desired.
4. In Supabase, enable **Authentication → Sign In / Providers → GitHub**, enter the GitHub OAuth app client ID and client secret, and save.
5. This app requests only `read:user`; it does not request repository access or the private-email `user:email` scope.

Store both provider client secrets only in their respective provider/Supabase dashboards. The app code never handles provider secrets or provider access tokens.

## Account-linking safety: deployment blocker

The app does not call `linkIdentity`, compare emails to merge profiles, or treat an X/GitHub identity as dating-profile verification. [Supabase Auth documents automatic linking of OAuth identities with the same email address](https://supabase.com/docs/guides/auth/auth-identity-linking). That linking happens inside Supabase Auth, before this app's callback can reject it; omitting an email scope cannot reliably prevent it (a provider may still return a public email).

Because HeartLink requires that accounts **not** be merged based only on matching email addresses, do not enable X/GitHub on a hosted Supabase project until the project's Auth behavior can be configured to reject such collisions or require an explicit authenticated linking action. Supabase's documented manual-linking option is for initiating `linkIdentity`; it is not documented as disabling automatic same-email linking. Test this behavior against the actual Supabase project before turning the providers on. Do not treat successful OAuth sign-in as proof that no automatic identity link occurred.

When a provider returns a conflict/error, the callback returns the user to the login page with an error message. It does not attempt to merge or delete accounts.

## Profiles, sessions, and database

- No schema migration is required. `profiles.id` is already the primary key and references `auth.users.id`; the profile editor saves with that authenticated UUID using an upsert, so repeated onboarding cannot create duplicate profile rows.
- OAuth users without a profile are sent to the existing profile editor. It uses available provider name metadata as a suggestion but still requires the user to enter/confirm required profile fields such as age; it does not invent an age or create a discoverable profile without the user's choices.
- Supabase SSR cookies and the existing middleware continue to manage persisted sessions and refreshes. The existing sign-out flow remains unchanged.
- Existing email/password and Google login/registration continue to use Supabase Auth.

## Verification checklist

After provider configuration and after resolving the account-linking blocker:

1. Run `npm run lint` and `npm run build`.
2. On desktop and a narrow/mobile viewport, verify the buttons fit the auth card and remain keyboard accessible.
3. For each of X and GitHub, test a new provider account, an existing provider account, successful callback/session persistence after refresh, and sign-out.
4. Cancel at the provider and test a provider authorization error. Verify the app returns to `/auth/login` and shows an error rather than showing a signed-in state.
5. Test a malformed/expired callback code and a provider identity that conflicts with an existing user. Confirm the configured Supabase project rejects email-only merges before enabling the provider.
6. Re-test Google OAuth, email/password login, email registration/confirmation, password reset, profile creation/edit, protected routes, and sign-out.

The repository does not contain provider credentials, so OAuth round trips and provider conflict behavior cannot be validated from the codebase alone. Do not mark the integrations live until these project-level tests pass.
