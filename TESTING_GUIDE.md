# 🧪 Complete App Testing Guide

## 🎯 Critical User Journey Testing

Follow this step-by-step guide to test every major feature of your DushiLearn app.

## Pre-Testing Setup

```bash
# 1. Make sure your .env is configured with Supabase credentials
# 2. Database schemas are installed
# 3. Start the app
cd /path/to/rork-dushilearn-app
npm start
# Press 'w' for web browser testing
```

## Test 1: Authentication Flow ✅

### 1.1 Test Sign Up
1. **Open app** → should see splash screen
2. **Click "Sign Up"** 
3. **Enter details:**
   - Email: `yourname@example.com`
   - Password: `testpassword123`
   - Name: `Your Name`
4. **Click "Sign Up"**
5. **✅ Expected:** Redirected to onboarding

### 1.2 Test Login (Alternative)
1. **Click "Log In"**
2. **Use test account:**
   - Email: `test@example.com`
   - Password: `password`
3. **Click "Log In"**
4. **✅ Expected:** Redirected to onboarding (first time) or main app

### 1.3 Verify Database
- Go to Supabase → Table Editor → `profiles`
- **✅ Expected:** See your user profile created

## Test 2: Onboarding Flow ✅

### 2.1 Learning Goals
1. **Select learning reason** (e.g., "I'm visiting Curaçao/Aruba")
2. **Click "Continue"**
3. **✅ Expected:** Progress to mascot introduction

### 2.2 Mascot Introduction
1. **See Coco and Lora mascots**
2. **Click "Continue"**
3. **✅ Expected:** Progress to daily goals

### 2.3 Daily Goals
1. **Select daily goal** (e.g., 5 minutes)
2. **Click "Start Learning"**
3. **✅ Expected:** Redirected to main app

## Test 3: Main App Navigation ✅

### 3.1 Home Screen
1. **Check stats display:**
   - ✅ Streak: 0 or 1
   - ✅ Level: 1
   - ✅ XP: 0
2. **Check Supabase status:** "Connected" (not "Error")
3. **Click "Continue Learning"**
4. **✅ Expected:** Open first lesson

### 3.2 Navigation Tabs
- **Click each tab:**
  - ✅ Home: Stats and continue button
  - ✅ Lessons: Category list with lessons
  - ✅ Progress: Progress charts
  - ✅ Profile: User profile and settings

## Test 4: Learning Flow ✅

### 4.1 Start First Lesson
1. **From Home:** Click "Continue Learning"
2. **Or from Lessons:** Click first lesson in "Essential Island Skills"
3. **✅ Expected:** Lesson starts with first exercise

### 4.2 Complete Exercises
1. **Multiple Choice:** Select correct answer
2. **Fill-in-Blank:** Type answer
3. **Click "Check" or "Continue"**
4. **✅ Expected:** See feedback (correct/incorrect)

### 4.3 Complete Lesson
1. **Finish all exercises in lesson**
2. **✅ Expected:** 
   - Lesson completion screen
   - XP gained (e.g., +50 XP)
   - Possible badge earned

### 4.4 Check Progress Update
1. **Go to Home tab**
2. **✅ Expected:**
   - XP increased
   - Streak updated (if first lesson today)
   - Progress bar advanced

## Test 5: Gamification Features ✅

### 5.1 Check Badges
1. **Go to Profile tab**
2. **Click "View Badges" or badge count**
3. **✅ Expected:** See earned badges (e.g., "First Steps")

### 5.2 Test Streak System
1. **Complete a lesson**
2. **Check Home tab → Streak should be 1**
3. **Wait 24 hours and complete another lesson**
4. **✅ Expected:** Streak becomes 2

### 5.3 Check Level Progression
1. **Complete multiple lessons** (aim for 100+ XP)
2. **✅ Expected:** Level increases to 2 at 100 XP

## Test 6: Subscription System ✅

### 6.1 Free Content Access
1. **Try freemium lessons** (Essential Island Skills)
2. **✅ Expected:** All lessons accessible

### 6.2 Premium Content Lock
1. **Try premium lessons** (Love & Flirtation, Local Slang)
2. **✅ Expected:** Upgrade prompt or lock icon

### 6.3 Subscription Upgrade (Optional)
1. **Click upgrade prompt**
2. **✅ Expected:** Subscription plans displayed
3. **Don't actually purchase** in testing

## Test 7: Data Persistence ✅

### 7.1 Refresh Browser/Restart App
1. **Complete some progress**
2. **Refresh page or restart app**
3. **✅ Expected:** Progress saved (XP, completed lessons, streak)

### 7.2 Database Verification
- **Supabase → user_progress table**
- **✅ Expected:** See your progress data

## Test 8: Error Handling ✅

### 8.1 Network Offline
1. **Disconnect internet**
2. **Try to use app**
3. **✅ Expected:** Graceful error messages, not crashes

### 8.2 Invalid Login
1. **Try login with wrong password**
2. **✅ Expected:** Clear error message

## 🚨 Common Issues & Solutions

### Issue: "Supabase: Error"
**Solution:** Check .env file, restart app

### Issue: Lessons don't start
**Solution:** Check console for errors, verify database setup

### Issue: Progress not saving
**Solution:** Check user_progress table in Supabase, verify RLS policies

### Issue: Build errors
**Solution:** Run `npx expo start --clear` to clear cache

## ✅ Testing Checklist

**Authentication:**
- [ ] Sign up works
- [ ] Login works  
- [ ] User profile created in database

**Onboarding:**
- [ ] All 3 steps complete
- [ ] Preferences saved
- [ ] Redirects to main app

**Core Learning:**
- [ ] Lessons start correctly
- [ ] Exercises respond to input
- [ ] Progress tracking works
- [ ] XP and levels update

**Gamification:**
- [ ] Badges are awarded
- [ ] Streak tracking works
- [ ] Level progression works

**Data Persistence:**
- [ ] Progress saves on refresh
- [ ] Database shows correct data

**Subscription:**
- [ ] Free content accessible
- [ ] Premium content locked
- [ ] Upgrade flow works

## 🎉 Success Criteria

Your app passes testing if:
- ✅ User can sign up, complete onboarding, and start learning
- ✅ Progress is tracked and saved
- ✅ No critical errors or crashes
- ✅ Database shows correct user data
- ✅ Subscription system works as expected

**If all tests pass, you're ready for deployment! 🚀**