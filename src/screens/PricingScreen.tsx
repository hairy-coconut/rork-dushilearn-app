import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

const PRICING_TIERS = [
  {
    title: '🌴 Free Forever',
    price: '$0',
    description: 'Get started for $0',
    perfectFor: 'Curious travelers, first-timers, and island dreamers.',
    includes: [
      '5 beginner-friendly lessons',
      'Island-themed gamification (Coconut Coins + streaks)',
      'Progress tracking & lesson unlock path',
      'Teasers of premium content',
      'No account needed to start',
    ],
    cta: 'Start Learning for Free',
    ctaAction: () => {},
  },
  {
    title: '🥥 Island Essentials Pack',
    price: '$24.99',
    description: 'One-time payment: $24.99',
    perfectFor: 'Frequent travelers, expats, and anyone who wants to speak confidently on the island.',
    includes: [
      '10+ full lessons (Love & Flirtation, Slang, Money, Real-Life Chats)',
      'Printable Dushi Phrasebook PDF',
      'Offline access to lessons',
      'Coconut Club badge',
      'Lifetime access + future updates',
      'No subscriptions. No hidden fees.',
    ],
    emotionalHook: 'Never get lost in translation again. Feel at home from the moment you land.',
    cta: 'Unlock the Full Island Pack – $24.99 One-Time',
    ctaAction: () => {},
  },
  {
    title: '🧠 Island Elite Pass',
    price: '$7.99/month OR $69.99 one-time',
    description: '$7.99/month OR $69.99 one-time',
    perfectFor: 'Immersive learners, romantic explorers, long-stay tourists & digital nomads.',
    includes: [
      'AI Language Concierge:',
      'Real-time translator (text + voice)',
      'Practice convos with AI locals (bartender, taxi driver, island crush)',
      '"How do I say this?" cultural tone assistant',
      'Upload signs/menus for instant translation',
      'Phrase of the Day AI review',
      'Lifestyle Bonuses:',
      'DushiLearn Level 1 Certificate',
      'Early access to new expansions (Aruba, Bonaire, Caribbean Spanish)',
      'Invite to private Coconut Club community',
      'Bonus phrase packs: Beach Dates, Emergencies, Party Talk',
    ],
    emotionalHook: 'It's more than language — it's access. It's freedom. It's your personal island guide in your pocket.',
    cta: 'Go Monthly – $7.99/month',
    ctaAction: () => {},
    ctaSecondary: 'Go All-In – $69.99 Lifetime Access',
    ctaSecondaryAction: () => {},
  },
];

const FAQ = [
  {
    question: 'Can I try it before I pay?',
    answer: 'Absolutely. Start with 5 free lessons — no login needed.',
  },
  {
    question: 'What if I only visit once?',
    answer: 'The Essentials Pack is yours forever. Learn at your pace, reuse on your next trip.',
  },
  {
    question: 'Is the AI translator accurate?',
    answer: 'Yes — and even better, it's trained with island slang, cultural context, and local flavor.',
  },
];

export default function PricingScreen() {
  return (
    <LinearGradient
      colors={[colors.aqua, colors.coral, colors.banana]}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Learn to Speak Like a Local. Live Like You Belong.</Text>
        <Text style={styles.subheadline}>Real Papiamentu. Real Culture. Real Connection.</Text>
        <Text style={styles.subheadline2}>Choose your journey — start for free, unlock the full island experience, or go elite and speak like a true Curaçaoan.</Text>

        {PRICING_TIERS.map((tier, idx) => (
          <View key={tier.title} style={styles.tierContainer}>
            <Text style={styles.tierTitle}>{tier.title}</Text>
            <Text style={styles.tierPrice}>{tier.price}</Text>
            <Text style={styles.tierDescription}>{tier.description}</Text>
            <Text style={styles.tierPerfectFor}>Perfect for: {tier.perfectFor}</Text>
            <View style={styles.includesContainer}>
              {tier.includes.map((item, i) => (
                <Text key={i} style={styles.includesItem}>{item}</Text>
              ))}
            </View>
            {tier.emotionalHook && (
              <Text style={styles.emotionalHook}>{tier.emotionalHook}</Text>
            )}
            <TouchableOpacity style={styles.ctaButton} onPress={tier.ctaAction}>
              <Text style={styles.ctaButtonText}>{tier.cta}</Text>
            </TouchableOpacity>
            {tier.ctaSecondary && (
              <TouchableOpacity style={styles.ctaSecondaryButton} onPress={tier.ctaSecondaryAction}>
                <Text style={styles.ctaSecondaryButtonText}>{tier.ctaSecondary}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>FAQ</Text>
          {FAQ.map((item, idx) => (
            <View key={idx} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.finalHook}>Thousands of people visit Curaçao. Only a few connect with it. DushiLearn helps you become one of them.</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['4xl'],
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  subheadline: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  subheadline2: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  tierContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: width - spacing.base * 2,
    ...shadows.base,
  },
  tierTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tierPrice: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.jungle,
    marginBottom: spacing.sm,
  },
  tierDescription: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  tierPerfectFor: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  includesContainer: {
    marginBottom: spacing.base,
  },
  includesItem: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emotionalHook: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.jungle,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.jungle,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ctaButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
  },
  ctaSecondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.jungle,
  },
  ctaSecondaryButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.jungle,
  },
  faqContainer: {
    width: width - spacing.base * 2,
    marginBottom: spacing.xl,
  },
  faqTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.surface,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: spacing.base,
  },
  faqQuestion: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.surface,
  },
  finalHook: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.surface,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
}); 