# 🎨 Content Customization & Branding Guide

## 🎯 Quick Customization Checklist

Here's what you can customize to make DushiLearn uniquely yours:

## 1. App Branding & Colors 🎨

### Update App Colors
**File:** `constants/colors.ts`

```typescript
// Current colors - customize these:
export default {
  primary: '#4ECDC4',        // Main teal color
  secondary: '#FFE066',      // Yellow accent
  background: '#FFFFFF',     // Background
  text: '#333333',          // Main text
  // ... customize all colors
};
```

### Update App Name & Info
**File:** `app.config.js`

```javascript
export default {
  name: 'DushiLearn',              // Change app name
  slug: 'dushilearn',              // URL-friendly name
  description: 'Learn Papiamento', // App description
  // ... update as needed
};
```

## 2. Content Customization 📚

### Add Your Lessons
**File:** `constants/lessons.ts`

**Add new lessons to existing categories:**
```typescript
// In freemium category, add new lesson:
{
  id: "your-new-lesson",
  title: "Your Lesson Title 🌴",
  description: "Learn specific Papiamento phrases",
  vocabulary: [
    {
      word: "New word",
      translation: "English translation", 
      example: "Example sentence"
    }
  ],
  culturalTip: "Cultural insight about Curaçao",
  // ...
}
```

### Add Exercises for Your Lessons
**File:** `constants/exercises.ts`

```typescript
// Add new exercise set:
"your-lesson-id": {
  lessonId: "your-lesson-id",
  exercises: [
    {
      id: "ex1",
      type: "multiple-choice",
      question: "How do you say 'hello'?",
      options: ["Bon dia", "Bon tardi", "Bon nochi"],
      correctAnswer: "Bon dia",
      translation: "Good morning",
      // ...
    }
  ]
}
```

## 3. Mascot & Images 🦜

### Replace Mascot Images
**Directory:** `assets/images/`

Current mascots:
- `coco-mascot.png` - Replace with your mascot
- `lora-mascot.png` - Replace with second mascot
- `coco-*.png` - Various emotions/poses
- `lora-*.png` - Various emotions/poses

**Recommended sizes:** 200x200px, PNG with transparency

### Update Mascot Names & Descriptions
**File:** `app/onboarding.tsx`

```typescript
// Update mascot descriptions:
<Text style={styles.mascotDescription}>
  Hey! I'm YourMascot 🌴—your island buddy!
</Text>
```

### App Icons & Splash
**Files to replace:**
- `assets/icon.png` (1024x1024px)
- `assets/splash.png` (1242x2436px)
- `assets/adaptive-icon.png` (1024x1024px)

## 4. Subscription Plans 💰

### Update Pricing
**File:** `types/subscription.ts`

```typescript
// Modify subscription plans:
{
  id: 'premium_monthly',
  name: 'Premium',
  price: 9.99,  // Change price
  currency: 'USD', // Change currency
  features: [
    'Your premium features here'
  ]
}
```

### Update Features List
**Same file - customize features:**
```typescript
features: [
  'Access to all premium lessons',
  'Unlimited practice sessions', 
  'Offline download capability',
  'Your unique feature here'
]
```

## 5. Cultural Content 🏝️

### Add Local Insights
**File:** `constants/lessons.ts`

```typescript
// Enhance cultural tips:
culturalTip: "In Curaçao, locals often mix Papiamento with Dutch in casual conversation. Don't worry if you hear unfamiliar words!"
```

### Add Real Location References
```typescript
// Use real places in examples:
example: "Nos ta bai na Mambo Beach = We're going to Mambo Beach"
```

## 6. Audio Integration (Future) 🔊

### Prepare for Audio
**File:** `constants/audio.ts`

```typescript
// Structure for future audio files:
export const audioFiles = {
  "bon-dia": require('./audio/bon-dia.mp3'),
  "kon-ta-bai": require('./audio/kon-ta-bai.mp3'),
  // Add your audio files
};
```

## 7. Quick Content Wins 🚀

### Priority Customizations (30 minutes):

1. **Update App Name & Colors**
   - Change app name in `app.config.js`
   - Customize brand colors in `constants/colors.ts`

2. **Add 3-5 New Lessons**
   - Focus on most requested scenarios
   - Beach activities, shopping, dining

3. **Enhance Cultural Tips**
   - Add local insights in each lesson
   - Reference real Curaçao locations

4. **Update Mascot Descriptions**
   - Make them more personality-driven
   - Add local flavor to their speech

### Advanced Customizations (2-3 hours):

1. **Complete Exercise Library**
   - Add 50+ new exercises
   - Cover advanced scenarios

2. **Custom Audio Integration**
   - Record native speaker audio
   - Add pronunciation guides

3. **Advanced Features**
   - Speaking exercises
   - Conversation practice

## 8. Content Strategy 📋

### Phase 1: Essential (Launch Ready)
- ✅ Tourist survival phrases
- ✅ Beach and dining scenarios
- ✅ Basic greetings and numbers
- ✅ Emergency situations

### Phase 2: Expansion (Month 2-3)
- Local business interactions
- Cultural events and festivals
- Advanced conversational skills
- Regional variations

### Phase 3: Advanced (Month 4+)
- Professional scenarios
- Historical and cultural deep dives
- Community-contributed content
- User-generated challenges

## 9. Quality Assurance ✅

### Content Review Checklist:
- [ ] All Papiamento spelling is correct
- [ ] Cultural references are accurate
- [ ] Examples use real locations when possible
- [ ] Translations are natural and conversational
- [ ] Difficulty progression makes sense

### Testing Your Content:
1. **Native Speaker Review** - Get a Papiamento speaker to review
2. **Tourist Testing** - Test with someone planning to visit Curaçao
3. **Cultural Accuracy** - Verify cultural tips with locals

## 🎉 Quick Start Template

Here's a template for adding a new lesson quickly:

```typescript
// 1. Add to constants/lessons.ts
{
  id: "beach-activities",
  title: "Beach Activities 🏖️",
  description: "Everything you need for a perfect beach day",
  vocabulary: [
    { word: "Zwembad", translation: "Swimming pool", example: "E zwembad ta limpi = The pool is clean" },
    { word: "Snorkeling", translation: "Snorkeling", example: "Mi ke bai snorkeling = I want to go snorkeling" }
  ],
  culturalTip: "Many beaches in Curaçao have excellent snorkeling right from the shore!"
}

// 2. Add to constants/exercises.ts
"beach-activities": {
  exercises: [
    {
      id: "beach1",
      type: "multiple-choice",
      question: "How do you say 'I want to go swimming'?",
      options: ["Mi ke bai zwem", "Mi ke bai kome", "Mi ke bai drumi"],
      correctAnswer: "Mi ke bai zwem"
    }
  ]
}
```

## 🚀 You're Ready!

With these customizations, your app will feel uniquely yours while maintaining the solid foundation. Focus on the quick wins first, then expand based on user feedback!

**Next: Deploy and start getting user feedback! 🌴**