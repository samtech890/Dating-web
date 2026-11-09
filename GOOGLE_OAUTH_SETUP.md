# Google OAuth Setup for HeartLink

This guide explains how to configure Google OAuth authentication for HeartLink using Supabase.

## Prerequisites

- A Supabase project (already configured)
- Google Cloud Console account
- Your HeartLink domain (e.g., `heartlink.example.com` or `localhost:3000` for development)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - **App name**: HeartLink
   - **User support email**: your support email
   - **Developer contact email**: your email
4. Add the following scopes:
   - `openid`
   - `email`
   - `profile`
5. Save and continue (you can skip the test users for now)
6. Publish the app (or add yourself as a test user for development)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Name: HeartLink Web
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Supabase Authentication

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click to configure
4. Enable the Google provider
5. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
6. Add authorized redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
7. Click "Save"

## Step 5: Update Environment Variables

Ensure your `.env.local` file has the required Supabase environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

These should already be configured from your initial Supabase setup.

## Step 6: Test Google OAuth

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login` or `http://localhost:3000/auth/register`

3. Click "Continue with Google"

4. You should be redirected to Google's sign-in page

5. After authentication, you'll be redirected back to HeartLink and signed in

## Troubleshooting

### "redirect_uri_mismatch" Error

This error occurs when the redirect URL in Google Cloud Console doesn't match the actual redirect URL.

**Solution**: Ensure the exact URL (including protocol and port) is added to authorized redirect URIs in Google Cloud Console and Supabase.

### "Access blocked" Error

This can happen if the OAuth consent screen is not published or you're not added as a test user.

**Solution**: Either publish the OAuth consent screen or add your email as a test user in the Google Cloud Console.

### Google Provider Not Showing in Supabase

If Google doesn't appear in your Supabase authentication providers:

**Solution**: Ensure you have the correct Supabase project tier. Some authentication providers may require a paid plan.

## Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for all sensitive credentials
- Restrict your Google OAuth credentials to specific domains in production
- Regularly rotate your secrets
- Monitor your Google Cloud Console for suspicious activity

## Production Deployment

When deploying to production:

1. Update authorized redirect URIs in Google Cloud Console to your production domain
2. Update authorized redirect URLs in Supabase to your production domain
3. Ensure your OAuth consent screen is published (not in testing mode)
4. Enable HTTPS (required for OAuth in production)
5. Review and update your app's privacy policy and terms of service

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/setup/local-development)
