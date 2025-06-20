# DushiLearn Setup Guide

## 🚀 Quick Start

This guide will help you get your DushiLearn Papiamento app running in development and ready for production.

## 📋 Prerequisites

- Node.js 18+ installed
- Expo CLI installed: `npm install -g @expo/cli`
- A Supabase account (free tier works)
- Git (for version control)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd /path/to/rork-dushilearn-app
npm install
```

### 2. Configure Supabase

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete

2. **Get your credentials:**
   - Go to Settings > API
   - Copy your Project URL and anon/public key

3. **Update environment variables:**
   - Open `.env` file
   - Replace the placeholder values:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up the database:**
   - In Supabase dashboard, go to SQL Editor
   - Run the contents of `supabase/schema.sql`
   - Run the contents of `supabase/subscription_schema.sql`

### 3. Test the Build

```bash
# Test web build
npm run web

# For iOS (requires Xcode)
npm run ios

# For Android (requires Android Studio)
npm run android
```

## 🎯 Development Workflow

### Starting Development

```bash
npm start
```

This will show a QR code. You can:
- Press `w` to open in web browser
- Scan QR code with Expo Go app (iOS/Android)
- Press `i` for iOS simulator
- Press `a` for Android emulator

### Key Development Files

- `constants/config.ts` - App configuration
- `types/subscription.ts` - Subscription type definitions
- `utils/subscription.ts` - Subscription logic
- `supabase/` - Database schemas
- `.env` - Environment variables (don't commit this!)

## 🛠 Troubleshooting

### Build Errors

If you see import errors:
1. Clear Metro cache: `npx expo start --clear`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Supabase Connection Issues

1. Check your URL and key in `.env`
2. Verify your Supabase project is running
3. Check that RLS policies are set up correctly

### Web Build Issues

If web build fails:
1. Check that all paths use `@/` imports correctly
2. Ensure no React Native-only code in shared components
3. Verify Metro configuration in `metro.config.js`

## 📱 Production Deployment

### Web Deployment

```bash
# Build for web
npx expo export -p web

# Deploy the `dist` folder to your hosting provider
```

### Mobile App Stores

1. **Set up EAS (Expo Application Services):**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Update app.config.js:**
   - Set your bundle identifier
   - Add proper icons and splash screens
   - Configure app store metadata

3. **Build for stores:**
   ```bash
   # iOS App Store
   eas build --platform ios

   # Google Play Store
   eas build --platform android
   ```

## 🔐 Security Checklist

- [ ] Supabase RLS policies are enabled
- [ ] Environment variables are not committed to git
- [ ] API keys are properly secured
- [ ] User authentication is working
- [ ] Subscription validation is server-side

## 📊 Testing Your App

### Core User Journey Test

1. **Onboarding:**
   - Sign up with email
   - Complete onboarding flow
   - Select learning goals

2. **Learning Flow:**
   - Start first lesson
   - Complete exercises
   - Check progress tracking

3. **Subscription:**
   - View premium content locks
   - Test subscription upgrade flow
   - Verify feature access

### Database Testing

Use Supabase dashboard to verify:
- User profiles are created
- Progress is saved
- Subscriptions are tracked
- Badges are awarded

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] All critical bugs fixed
- [ ] Content reviewed for accuracy
- [ ] Payment integration tested
- [ ] Analytics configured
- [ ] App store assets ready
- [ ] Privacy policy and terms created

### Launch Strategy

1. **Soft Launch:** Test with small group in Curaçao
2. **Marketing:** Reach out to tourism boards, expat groups
3. **Feedback:** Iterate based on user feedback
4. **Scale:** Expand to other Caribbean islands

## 📞 Support

If you need help:
- Check the troubleshooting section above
- Review Expo documentation: [docs.expo.dev](https://docs.expo.dev)
- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)

## 🎉 You're Ready!

Your DushiLearn app should now be running. The next steps are:
1. Set up your Supabase database
2. Test the core user journey
3. Add your content and customize
4. Deploy to production

Happy coding! 🌴🦜