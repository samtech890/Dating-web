# HeartLink Profile Management & Authentication Setup Guide

This guide explains how to deploy and configure the HeartLink authentication and profile management system.

## Prerequisites

- Node.js 18.18.0 or higher
- A Supabase project with authentication enabled
- Google Cloud Console account (for Google OAuth, optional but recommended)

## Database Migrations

Run the following migrations in your Supabase project to set up the database schema:

1. **Initial Schema** (already applied): `20261026115702_heartlink_initial_schema.sql`
2. **Discovery Foundation** (already applied): `20261026123000_discovery_foundation.sql`
3. **Discovery Safety** (already applied): `20261026133000_discovery_safety_followups.sql`
4. **Avatar URL Field**: `20261029100000_add_avatar_url.sql`
5. **Avatar Storage Bucket**: `20261029110000_avatar_storage_bucket.sql`
6. **Account Deletion**: `20261029120000_account_deletion.sql`

### Applying Migrations

In your Supabase dashboard:
1. Go to SQL Editor
2. Create a new query
3. Paste the migration SQL
4. Run the query

Or use the Supabase CLI:
```bash
supabase db push
```

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project dashboard under Settings > API.

## Google OAuth Setup (Optional but Recommended)

Follow the detailed guide in `GOOGLE_OAUTH_SETUP.md` to enable Google authentication.

## X and GitHub OAuth

Follow `SOCIAL_OAUTH_SETUP.md` for X OAuth 2.0 and GitHub provider configuration, callback URLs, minimal scopes, and end-to-end testing. It also documents an important Supabase Auth automatic identity-linking limitation that must be resolved before enabling these providers when email-only account merges are not acceptable.

## Storage Bucket Configuration

The avatar storage bucket is created via migration, but you may need to verify:

1. In Supabase dashboard, go to Storage
2. Verify the `avatars` bucket exists
3. Check that it's marked as public
4. Verify RLS policies are in place

## Running the Application

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Features Implemented

### Authentication
- Email/password registration with email verification
- Email/password login
- Google OAuth sign-in and registration
- Password reset via email
- Session persistence
- Protected routes with automatic redirects
- Sign out functionality

### Profile Management
- Profile creation and editing
- Display name, age, location, bio
- Relationship intentions selection
- Profile discoverability toggle
- Interest tags management
- Profile preview

### Avatar System
- Secure avatar upload (JPEG, PNG, WebP, GIF, max 5MB)
- Image preview before saving
- Avatar replacement
- Avatar removal
- Public storage with RLS protection
- User-isolated file paths

### Account Settings
- Profile settings management
- Account information display
- Privacy controls
- Notification preferences (UI ready)
- Security settings
- Account deletion with cascading cleanup

### Navigation
- Account dropdown menu for authenticated users
- User avatar display
- Quick access to profile, settings, sign out
- Loading states during auth check
- Responsive mobile navigation

### Security
- Row Level Security (RLS) on all tables
- User-isolated avatar storage
- Protected API routes
- Secure middleware redirects
- Safe account deletion

## Testing Checklist

### Authentication Flows
- [ ] User can register with email
- [ ] User receives verification email
- [ ] User can verify email
- [ ] User can login with email/password
- [ ] User can sign out
- [ ] User can request password reset
- [ ] User can reset password
- [ ] Google OAuth works (if configured)

### Profile Management
- [ ] User can create profile after registration
- [ ] User can edit profile fields
- [ ] User can add/remove interests
- [ ] User can toggle discoverability
- [ ] Profile preview displays correctly

### Avatar Upload
- [ ] User can upload avatar
- [ ] File validation works (type, size)
- [ ] Preview displays before saving
- [ ] Avatar saves to profile
- [ ] User can replace avatar
- [ ] User can remove avatar
- [ ] Old avatar files are cleaned up

### Account Settings
- [ ] Settings page loads
- [ ] All tabs work correctly
- [ ] Profile settings link to profile page
- [ ] Account settings display email
- [ ] Password reset link works
- [ ] Sign out works
- [ ] Account deletion initiates

### Navigation
- [ ] Account menu shows for authenticated users
- [ ] Account menu shows user avatar
- [ ] Account menu shows display name
- [ ] Menu items link correctly
- [ ] Sign out from menu works
- [ ] Login/register buttons show for logged-out users
- [ ] Mobile navigation works

### Protected Routes
- [ ] Unauthenticated users redirected from /profile
- [ ] Unauthenticated users redirected from /settings
- [ ] Authenticated users redirected from /auth/login
- [ ] Authenticated users redirected from /auth/register

## Troubleshooting

### Migration Errors

If migrations fail:
1. Check Supabase logs for specific error messages
2. Ensure you have the correct permissions
3. Verify the migration order (dependencies matter)

### Authentication Not Working

1. Verify environment variables are set
2. Check Supabase Auth is enabled
3. Verify email templates are configured in Supabase
4. Check browser console for errors

### Avatar Upload Fails

1. Verify the avatars bucket exists
2. Check RLS policies are applied
3. Verify file size and type validation
4. Check browser network tab for API errors

### Google OAuth Errors

1. Verify redirect URIs match exactly
2. Check Google Cloud Console for errors
3. Ensure OAuth consent screen is published
4. Verify Client ID and Secret are correct

## Production Deployment

### Environment Variables

Set the following environment variables in your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-production-anon-key
```

### Domain Configuration

1. Update authorized redirect URIs in Google Cloud Console
2. Update authorized redirect URLs in Supabase
3. Configure your domain in Supabase Auth settings
4. Update site URL in Supabase settings

### Security Checklist

- [ ] Enable HTTPS
- [ ] Use production Supabase keys
- [ ] Configure email templates
- [ ] Set up monitoring
- [ ] Enable rate limiting
- [ ] Review RLS policies
- [ ] Test account deletion flow

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase and Next.js documentation
3. Check browser console and server logs for errors
