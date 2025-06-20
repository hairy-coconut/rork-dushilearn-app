import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from './constants/colors';

const { width, height } = Dimensions.get('window');

type LearningReason = 'tourist' | 'expat' | 'local' | 'fun' | 'love';
type LearningVibe = 'casual' | 'serious' | 'daily';

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [learningReason, setLearningReason] = useState<LearningReason | null>(null);
  const [learningVibe, setLearningVibe] = useState<LearningVibe | null>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const cocoAnim = useRef(new Animated.Value(0)).current;
  const loraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start intro animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Mascot entrance animations
    Animated.stagger(500, [
      Animated.spring(cocoAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(loraAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const nextSlide = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.timing(slideAnim, {
      toValue: (currentSlide + 1) * -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setCurrentSlide(currentSlide + 1);
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('welcome_completed', 'true');
      await AsyncStorage.setItem('learning_reason', learningReason || 'fun');
      await AsyncStorage.setItem('learning_vibe', learningVibe || 'casual');
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      // Navigate directly to first lesson (no friction!)
      router.replace('/lesson/basic-greetings');
    } catch (error) {
      console.error('Error saving welcome data:', error);
      router.replace('/(tabs)');
    }
  };

  // Slide 1: Meet the Island Life
  const renderSlide1 = () => (
    <LinearGradient
      colors={Colors.gradients.tropical}
      style={styles.slideContainer}
    >
      <Animated.View 
        style={[
          styles.slideContent,
          { 
            opacity: fadeAnim,
            transform: [{ scale: bounceAnim }]
          }
        ]}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Welcome to</Text>
          <Text style={styles.appName}>DushiLearn! 🏝️</Text>
          <Text style={styles.welcomeSubtitle}>
            You are about to explore the dushi life 
          </Text>
        </View>

        <View style={styles.illustrationContainer}>
          <View style={styles.islandIllustration}>
            <Text style={styles.islandEmoji}>🌴</Text>
            <Text style={styles.islandEmoji}>🌊</Text>
            <Text style={styles.islandEmoji}>☀️</Text>
          </View>
          <Text style={styles.islandText}>
            Learn Papiamentu like a true islander
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={nextSlide}
        >
          <Text style={styles.startButtonText}>Let's dive in! 🥥</Text>
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );

  // Slide 2: Meet Coco & Lora
  const renderSlide2 = () => (
    <LinearGradient
      colors={['#FF6B35', '#FFD700']}
      style={styles.slideContainer}
    >
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>Meet Your Island Friends!</Text>
        
        <View style={styles.mascotsContainer}>
          <Animated.View 
            style={[
              styles.mascotCard,
              {
                transform: [
                  { scale: cocoAnim },
                  { translateY: Animated.multiply(cocoAnim, -20) }
                ]
              }
            ]}
          >
            <View style={styles.mascotImageContainer}>
              <Text style={styles.mascotEmoji}>🥥</Text>
            </View>
            <Text style={styles.mascotName}>Coco</Text>
            <Text style={styles.mascotDescription}>
              Your energetic surf buddy who makes learning feel like play!
            </Text>
            <View style={styles.mascotQuote}>
              <Text style={styles.quoteText}>"Ayó! Let's ride the learning wave!" 🌊</Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.mascotCard,
              {
                transform: [
                  { scale: loraAnim },
                  { translateY: Animated.multiply(loraAnim, -20) }
                ]
              }
            ]}
          >
            <View style={styles.mascotImageContainer}>
              <Text style={styles.mascotEmoji}>🦜</Text>
            </View>
            <Text style={styles.mascotName}>Lora</Text>
            <Text style={styles.mascotDescription}>
              Your wise cultural guide who shares island wisdom & stories
            </Text>
            <View style={styles.mascotQuote}>
              <Text style={styles.quoteText}>"Bon dia, mi dushi! Ready to learn?" 💝</Text>
            </View>
          </Animated.View>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={nextSlide}
        >
          <Text style={styles.continueButtonText}>I can't wait to start! ✨</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // Slide 3: Quick Personalization
  const renderSlide3 = () => (
    <LinearGradient
      colors={Colors.gradients.sunset}
      style={styles.slideContainer}
    >
      <ScrollView style={styles.slideContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.slideTitle}>Tell us about yourself</Text>
        <Text style={styles.slideSubtitle}>We'll make your journey perfect! 🎯</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>Why are you learning?</Text>
          <View style={styles.optionsGrid}>
            {[
              { value: 'tourist', label: 'Tourist', icon: '🏖️' },
              { value: 'expat', label: 'Expat', icon: '🏠' },
              { value: 'local', label: 'Local', icon: '🌴' },
              { value: 'fun', label: 'For fun', icon: '🎉' },
              { value: 'love', label: 'For love', icon: '💕' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  learningReason === option.value && styles.selectedOption,
                ]}
                onPress={() => {
                  setLearningReason(option.value as LearningReason);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  learningReason === option.value && styles.selectedLabel
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>Pick your learning vibe:</Text>
          <View style={styles.vibeOptions}>
            {[
              { value: 'casual', label: 'Casual', subtitle: '5 min/day', icon: '🏝️' },
              { value: 'serious', label: 'Serious', subtitle: '15 min/day', icon: '🎯' },
              { value: 'daily', label: 'Daily practice', subtitle: '20+ min/day', icon: '🔥' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.vibeCard,
                  learningVibe === option.value && styles.selectedVibe,
                ]}
                onPress={() => {
                  setLearningVibe(option.value as LearningVibe);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={styles.vibeIcon}>{option.icon}</Text>
                <Text style={[
                  styles.vibeLabel,
                  learningVibe === option.value && styles.selectedVibeLabel
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.vibeSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.finishButton,
            (!learningReason || !learningVibe) && styles.disabledButton
          ]}
          onPress={handleComplete}
          disabled={!learningReason || !learningVibe}
        >
          <Text style={styles.finishButtonText}>Start my island adventure! 🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.slidesWrapper,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={[styles.slide, { width }]}>
          {renderSlide1()}
        </View>
        <View style={[styles.slide, { width }]}>
          {renderSlide2()}
        </View>
        <View style={[styles.slide, { width }]}>
          {renderSlide3()}
        </View>
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              currentSlide === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  slidesWrapper: {
    flexDirection: 'row',
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Slide 1 styles
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    color: 'white',
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  islandIllustration: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 200,
    marginBottom: 20,
  },
  islandEmoji: {
    fontSize: 48,
  },
  islandText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },

  // Slide 2 styles
  slideTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
  },
  mascotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 60,
  },
  mascotCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  mascotImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mascotEmoji: {
    fontSize: 40,
  },
  mascotName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  mascotDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  mascotQuote: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    padding: 8,
  },
  quoteText: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
  },
  continueButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Slide 3 styles
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  questionContainer: {
    width: '100%',
    marginBottom: 30,
  },
  questionTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'white',
    borderColor: Colors.primary,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLabel: {
    color: Colors.primary,
  },
  vibeOptions: {
    width: '100%',
  },
  vibeCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedVibe: {
    backgroundColor: 'white',
    borderColor: Colors.primary,
  },
  vibeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  vibeLabel: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedVibeLabel: {
    color: Colors.primary,
  },
  vibeSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  finishButton: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 40,
  },
  finishButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Progress dots
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
});