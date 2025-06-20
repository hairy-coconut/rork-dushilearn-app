# 🗄️ Supabase Database Setup Guide

## Step 1: Create Your Supabase Project

1. **Go to Supabase.com**
   - Visit [supabase.com](https://supabase.com)
   - Click "Start your project" or "Sign in"
   - Create an account if you don't have one

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: `dushilearn-app`
     - **Database Password**: Choose a strong password (save this!)
     - **Region**: Choose closest to your users (US East for Caribbean)
   - Click "Create new project"
   - ⏱️ Wait 2-3 minutes for setup to complete

## Step 2: Get Your Credentials

1. **Go to Settings → API**
   - In your Supabase dashboard, click Settings (gear icon)
   - Click "API" in the sidebar
   - Copy these values:

2. **Update Your .env File**
   ```bash
   # Replace these in your .env file:
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Example:**
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 3: Set Up Database Tables

1. **Go to SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in sidebar
   - Click "New Query"

2. **Run Main Schema**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste into the SQL editor
   - Click "Run" button
   - ✅ You should see "Success. No rows returned"

3. **Run Subscription Schema**
   - Click "New Query" again
   - Copy the entire contents of `supabase/subscription_schema.sql`
   - Paste into the SQL editor
   - Click "Run" button
   - ✅ You should see "Success. No rows returned"

## Step 4: Verify Database Setup

1. **Check Tables Created**
   - Go to "Table Editor" in sidebar
   - You should see these tables:
     - ✅ `profiles`
     - ✅ `user_progress`
     - ✅ `badges`
     - ✅ `user_badges`
     - ✅ `subscription_plans`
     - ✅ `user_subscriptions`
     - ✅ `payment_history`

2. **Check Sample Data**
   - Click on `subscription_plans` table
   - You should see 4 rows:
     - ✅ free
     - ✅ premium_monthly
     - ✅ premium_yearly
     - ✅ elite_monthly

## Step 5: Enable Authentication

1. **Go to Authentication**
   - Click "Authentication" in sidebar
   - Click "Settings" tab

2. **Configure Auth Settings**
   - **Site URL**: `http://localhost:19006` (for development)
   - **Redirect URLs**: Add `http://localhost:19006/**`
   - **Enable Email Confirmations**: Turn OFF for development (turn ON for production)

## Step 6: Test Connection

1. **Start Your App**
   ```bash
   cd /path/to/rork-dushilearn-app
   npm start
   ```

2. **Check Connection Status**
   - In your app, you should see "Supabase: Connected" instead of "Not configured"
   - If you see "Error:", check your .env file and restart the app

## 🚨 Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution:** Double-check your anon key in .env file. Make sure no extra spaces.

### Issue: "Tables don't exist"
**Solution:** Re-run the SQL schemas. Make sure you ran both schema.sql and subscription_schema.sql.

### Issue: "Connection refused"
**Solution:** Check your Supabase URL. Make sure it ends with .supabase.co

### Issue: "Authentication failed"
**Solution:** 
1. Check Authentication settings in Supabase
2. Make sure email confirmation is disabled for development
3. Try the test account: test@example.com / password

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] .env file updated with real credentials
- [ ] Main schema (schema.sql) executed successfully
- [ ] Subscription schema executed successfully
- [ ] All 7 tables visible in Table Editor
- [ ] 4 subscription plans in subscription_plans table
- [ ] Authentication configured
- [ ] App shows "Supabase: Connected"

## 🎉 Next Steps

Once your database is set up:
1. Test user registration and login
2. Complete a lesson and check progress tracking
3. Verify badge system is working

**Your database is now ready for production! 🚀**