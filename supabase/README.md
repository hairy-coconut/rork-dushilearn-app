# Supabase Setup Instructions

## Initial Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign in or create an account
3. Create a new project:
   - Name: "DushiLearn"
   - Database Password: (create a secure password)
   - Region: Choose the closest to your users
   - Pricing Plan: Free tier

## Database Setup

1. Once the project is created, go to the SQL Editor
2. Copy the contents of `schema.sql` and paste it into the SQL Editor
3. Run the SQL to create all tables and policies

## Environment Variables

Add these to your `.env` file:

```env
SUPABASE_URL=https://zjugdontxtmuqaiufikq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdWdkb250eHRtdXFhaXVmaWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDI1NzUsImV4cCI6MjA2NDgxODU3NX0.P9vWrMtiKBhPWImHTrx-Rw8OPXy38o4XOxbroZlkkK0
```

## Authentication Setup

1. Go to Authentication > Settings
2. Enable Email auth provider
3. Configure email templates if needed
4. Set up redirect URLs for your app

## Storage Setup

1. Go to Storage
2. Create a new bucket called "avatars"
3. Set the bucket's privacy to private
4. Add the following policy to allow users to upload their avatars:

```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Database Functions

The following functions are available:

- `handle_new_user()`: Automatically creates a profile when a user signs up
- `update_user_progress()`: Updates user progress and checks for badges
- `get_user_stats()`: Retrieves user statistics including progress and badges

## Security Policies

The following security policies are in place:

- Users can only view and update their own profiles
- Users can only access their own progress data
- Badges are viewable by all authenticated users
- Users can only manage their own earned badges

## Monitoring

1. Go to Database > Logs to monitor database activity
2. Set up alerts for:
   - Failed authentication attempts
   - Database errors
   - Storage quota usage

## Backup

1. Go to Database > Backups
2. Enable daily backups
3. Set up point-in-time recovery if needed

## API Documentation

The API is automatically documented at:
`https://zjugdontxtmuqaiufikq.supabase.co/rest/v1/`

## Common Issues

1. If you get a "relation does not exist" error:
   - Make sure you've run the schema.sql file
   - Check if you're using the correct schema (public)

2. If authentication fails:
   - Verify your environment variables
   - Check if the user exists in auth.users
   - Ensure the profile was created

3. If RLS policies aren't working:
   - Verify the user is authenticated
   - Check if the policy conditions match your use case
   - Ensure the user has the correct role 