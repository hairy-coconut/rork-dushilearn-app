import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from './constants/colors';

const { width, height } = Dimensions.get('window');

interface FirstBadgeTutorialProps {
  visible: boolean;
  badgeName: string;
  badgeIcon: string;
  onComplete: () => void;
}

export default function FirstBadgeTutorial({
  visible,
  badgeName,
  badgeIcon,
  onComplete,
}: FirstBadgeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(visible);

  // Animations
  const badgeScale = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setShowTutorial(true);
      startAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    // Badge entrance animation
    Animated.sequence([
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse for badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const nextStep = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep < tutorialSteps.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = async () => {
    try {
      await AsyncStorage.setItem('first_badge_tutorial_shown', 'true');
    } catch (error) {
      console.error('Error saving tutorial state:', error);
    }
    
    setShowTutorial(false);
    onComplete();
  };

  const tutorialSteps = [
    {
      title: 'Congratulations! 🎉',
      subtitle: 'You earned your first badge!',
      content: `You just unlocked "${badgeName}"! Badges show your amazing progress and achievements.`,
      mascotMessage: 'Ayó! Look at you, earning badges like a true island champion! 🏆',
      buttonText: 'Tell me more!'
    },
    {
      title: 'Collect Them All! 📚',
      subtitle: 'Badges track your journey',
      content: 'Each badge represents a milestone in your Papiamentu journey. Some are easy, others require dedication - but they\'re all worth celebrating!',
      mascotMessage: 'Mi ta proud di bo! Every badge tells your unique story! ✨',
      buttonText: 'What else is there?'
    },
    {
      title: 'More Rewards Coming! 🎁',
      subtitle: 'Badges unlock special perks',
      content: 'Earning badges gives you:\n• Coconut Coins 🥥\n• XP Boosts ⚡\n• Special Mascot Messages 💕\n• Bragging Rights 😎',
      mascotMessage: 'Keep collecting, dushi! More surprises await! 🌟',
      buttonText: 'I\'m ready!'
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  if (!showTutorial) return null;

  return (
    <Modal
      visible={showTutorial}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.background}
        >
          {/* Badge Display */}
          <View style={styles.badgeContainer}>
            <Animated.View
              style={[
                styles.badgeWrapper,
                {
                  transform: [
                    { scale: Animated.multiply(badgeScale, pulseAnim) }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={Colors.gradients.sunset}
                style={styles.badgeCircle}
              >
                <Text style={styles.badgeIcon}>{badgeIcon}</Text>
              </LinearGradient>
              
              {/* Sparkle effects */}
              <Animated.View
                style={[
                  styles.sparkle,
                  styles.sparkle1,
                  {
                    opacity: sparkleAnim,
                    transform: [
                      {
                        rotate: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
              </Animated.View>
              
              <Animated.View
                style={[
                  styles.sparkle,
                  styles.sparkle2,
                  {
                    opacity: sparkleAnim,
                    transform: [
                      {
                        rotate: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['360deg', '0deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              </Animated.View>
              
              <Animated.View
                style={[
                  styles.sparkle,
                  styles.sparkle3,
                  {
                    opacity: sparkleAnim,
                    transform: [
                      {
                        rotate: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['180deg', '540deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Tutorial Content */}
          <View style={styles.contentContainer}>
            <Animated.View
              style={[
                styles.stepsWrapper,
                { transform: [{ translateX: slideAnim }] }
              ]}
            >
              {tutorialSteps.map((step, index) => (
                <View key={index} style={[styles.stepContent, { width }]}>
                  <View style={styles.textContainer}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                    <Text style={styles.stepDescription}>{step.content}</Text>
                    
                    {/* Mascot message */}
                    <View style={styles.mascotMessageContainer}>
                      <View style={styles.mascotAvatar}>
                        <Text style={styles.mascotEmoji}>🥥</Text>
                      </View>
                      <View style={styles.speechBubble}>
                        <Text style={styles.mascotText}>{step.mascotMessage}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </Animated.View>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={nextStep}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {currentStepData.buttonText}
                </Text>
                <MaterialCommunityIcons 
                  name={currentStep === tutorialSteps.length - 1 ? "check" : "arrow-right"} 
                  size={20} 
                  color="white" 
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Progress dots */}
            <View style={styles.progressContainer}>
              {tutorialSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    currentStep === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={completeTutorial}
          >
            <Text style={styles.skipText}>Skip Tutorial</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Badge display
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badgeWrapper: {
    position: 'relative',
  },
  badgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
  },
  badgeIcon: {
    fontSize: 48,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -10,
    right: 10,
  },
  sparkle2: {
    bottom: 20,
    left: -10,
  },
  sparkle3: {
    top: 30,
    left: 120,
  },

  // Content
  contentContainer: {
    flex: 1,
    width: '100%',
    maxHeight: 300,
  },
  stepsWrapper: {
    flexDirection: 'row',
    flex: 1,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  // Mascot message
  mascotMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
  },
  mascotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mascotEmoji: {
    fontSize: 20,
  },
  speechBubble: {
    flex: 1,
  },
  mascotText: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Actions
  actionContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  actionButton: {
    marginBottom: 20,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.secondary,
  },

  // Skip
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});