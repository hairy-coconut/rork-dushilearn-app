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

interface DailyChestTutorialProps {
  visible: boolean;
  onComplete: () => void;
}

export default function DailyChestTutorial({
  visible,
  onComplete,
}: DailyChestTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(visible);
  const [chestOpened, setChestOpened] = useState(false);

  // Animations
  const chestScale = useRef(new Animated.Value(1)).current;
  const chestShake = useRef(new Animated.Value(0)).current;
  const coinsFall = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowTutorial(true);
      startGlowAnimation();
    }
  }, [visible]);

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const openChest = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Chest opening animation
    Animated.sequence([
      // Shake before opening
      Animated.sequence([
        Animated.timing(chestShake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(chestShake, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(chestShake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(chestShake, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
      // Scale up and open
      Animated.spring(chestScale, {
        toValue: 1.2,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      // Coins falling animation
      Animated.timing(coinsFall, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setChestOpened(true);
      setTimeout(() => nextStep(), 1500);
    });
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
      await AsyncStorage.setItem('daily_chest_tutorial_shown', 'true');
    } catch (error) {
      console.error('Error saving tutorial state:', error);
    }
    
    setShowTutorial(false);
    onComplete();
  };

  const tutorialSteps = [
    {
      title: 'Daily Surprise Chest! 🎁',
      subtitle: 'Your daily rewards await',
      content: 'Every day you learn, you get a surprise chest filled with goodies! Tap the chest to see what\'s inside.',
      showChest: true,
      interactive: true,
      buttonText: null // No button, interaction opens chest
    },
    {
      title: 'Amazing Rewards! ✨',
      subtitle: 'Look what you found',
      content: 'Your daily chest can contain:\n\n🥥 Coconut Coins\n⚡ XP Boosts\n🎯 Streak Freezes\n🏆 Special Badges\n💎 Premium Rewards',
      showChest: false,
      interactive: false,
      buttonText: 'Tell me more!'
    },
    {
      title: 'Come Back Daily! 📅',
      subtitle: 'The more you learn, the better the rewards',
      content: 'Your chest gets better rewards when you:\n• Keep your streak alive 🔥\n• Complete more lessons 📚\n• Earn achievements 🏆\n\nDon\'t miss a day!',
      showChest: false,
      interactive: false,
      buttonText: 'I\'ll be back!'
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  if (!showTutorial) return null;

  const renderChest = () => (
    <View style={styles.chestContainer}>
      <Animated.View
        style={[
          styles.chestWrapper,
          {
            transform: [
              { scale: chestScale },
              { translateX: chestShake }
            ]
          }
        ]}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Chest */}
        <TouchableOpacity
          style={styles.chest}
          onPress={currentStepData.interactive && !chestOpened ? openChest : undefined}
          disabled={!currentStepData.interactive || chestOpened}
        >
          <LinearGradient
            colors={['#8B4513', '#D2691E']}
            style={styles.chestGradient}
          >
            <MaterialCommunityIcons 
              name={chestOpened ? "treasure-chest" : "treasure-chest-outline"} 
              size={80} 
              color="#FFD700" 
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Falling coins animation */}
        {chestOpened && (
          <View style={styles.coinsContainer}>
            {[...Array(6)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.coin,
                  {
                    left: 50 + (index * 20) - 60,
                    transform: [
                      {
                        translateY: coinsFall.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 200 + (index * 30)],
                        }),
                      },
                      {
                        rotate: coinsFall.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${360 + (index * 180)}deg`],
                        }),
                      },
                    ],
                    opacity: coinsFall.interpolate({
                      inputRange: [0, 0.8, 1],
                      outputRange: [0, 1, 0],
                    }),
                  },
                ]}
              >
                <Text style={styles.coinText}>🥥</Text>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Tap hint */}
        {currentStepData.interactive && !chestOpened && (
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to open! 👆</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );

  return (
    <Modal
      visible={showTutorial}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
          style={styles.background}
        >
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
                    
                    {step.showChest && renderChest()}
                    
                    <Text style={styles.stepDescription}>{step.content}</Text>
                    
                    {step.buttonText && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={nextStep}
                      >
                        <LinearGradient
                          colors={Colors.gradients.primary}
                          style={styles.buttonGradient}
                        >
                          <Text style={styles.buttonText}>{step.buttonText}</Text>
                          <MaterialCommunityIcons 
                            name={currentStep === tutorialSteps.length - 1 ? "check" : "arrow-right"} 
                            size={20} 
                            color="white" 
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </Animated.View>
          </View>

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

  // Content
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
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
    marginBottom: 30,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  // Chest
  chestContainer: {
    alignItems: 'center',
    marginVertical: 40,
    height: 200,
  },
  chestWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFD700',
    top: -30,
    left: -30,
  },
  chest: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  chestGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapHint: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tapHintText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // Coins
  coinsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  coin: {
    position: 'absolute',
    top: 50,
  },
  coinText: {
    fontSize: 24,
  },

  // Actions
  actionButton: {
    marginTop: 20,
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