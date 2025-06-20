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
import Colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface StreakResetModalProps {
  visible: boolean;
  previousStreak: number;
  onRestart: () => void;
  onClose: () => void;
}

export default function StreakResetModal({
  visible,
  previousStreak,
  onRestart,
  onClose,
}: StreakResetModalProps) {
  const [showModal, setShowModal] = useState(visible);
  const [currentStep, setCurrentStep] = useState(0);

  // Animations
  const loraScale = useRef(new Animated.Value(0)).current;
  const loraY = useRef(new Animated.Value(50)).current;
  const tearFall = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      startAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    // Fade in background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Lora entrance (sad but gentle)
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(loraScale, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(loraY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Gentle tear falling animation
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tearFall, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(tearFall, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1500);
  };

  const nextStep = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep < steps.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
    }
  };

  const handleRestart = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setShowModal(false);
    onRestart();
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const steps = [
    {
      title: 'Ayó... 😢',
      subtitle: 'You missed a day',
      message: `Your ${previousStreak}-day streak has ended, but no worries mi dushi...`,
      loraMood: 'sad',
      action: {
        text: 'Tell me more',
        onPress: nextStep,
      }
    },
    {
      title: 'It\'s Okay! 💝',
      subtitle: 'Life happens to all of us',
      message: 'Even the strongest waves sometimes miss the shore. What matters is getting back in the water, mi amor.',
      loraMood: 'understanding',
      action: {
        text: 'I understand',
        onPress: nextStep,
      }
    },
    {
      title: 'Let\'s Start Again! 🌅',
      subtitle: 'Every sunset brings a new sunrise',
      message: 'Your learning journey doesn\'t end here. Let\'s build an even stronger streak together!',
      loraMood: 'encouraging',
      action: {
        text: 'Start fresh! 🚀',
        onPress: handleRestart,
      }
    }
  ];

  const currentStepData = steps[currentStep];

  if (!showModal) return null;

  // Lora expressions based on mood
  const getLoraExpression = (mood: string) => {
    switch (mood) {
      case 'sad': return '😢';
      case 'understanding': return '🥺';
      case 'encouraging': return '🌟';
      default: return '🦜';
    }
  };

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.background}
        >
          {/* Lora Character */}
          <View style={styles.loraContainer}>
            <Animated.View
              style={[
                styles.loraWrapper,
                {
                  transform: [
                    { scale: loraScale },
                    { translateY: loraY }
                  ]
                }
              ]}
            >
              {/* Lora body */}
              <View style={styles.loraBody}>
                <LinearGradient
                  colors={['#E91E63', '#F06292']}
                  style={styles.loraGradient}
                >
                  <Text style={styles.loraFace}>
                    {getLoraExpression(currentStepData.loraMood)}
                  </Text>
                </LinearGradient>
              </View>

              {/* Gentle tears (only for sad mood) */}
              {currentStepData.loraMood === 'sad' && (
                <Animated.View
                  style={[
                    styles.tear,
                    {
                      opacity: tearFall,
                      transform: [
                        {
                          translateY: tearFall.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 100],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.tearDrop}>💧</Text>
                </Animated.View>
              )}

              {/* Comforting glow for encouraging mood */}
              {currentStepData.loraMood === 'encouraging' && (
                <View style={styles.encouragingGlow} />
              )}
            </Animated.View>
          </View>

          {/* Message Content */}
          <View style={styles.contentContainer}>
            <Animated.View
              style={[
                styles.stepsWrapper,
                { transform: [{ translateX: slideAnim }] }
              ]}
            >
              {steps.map((step, index) => (
                <View key={index} style={[styles.stepContent, { width }]}>
                  <View style={styles.messageContainer}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                    <Text style={styles.stepMessage}>{step.message}</Text>

                    {/* Previous streak memory */}
                    {index === 0 && previousStreak > 0 && (
                      <View style={styles.streakMemoryContainer}>
                        <MaterialCommunityIcons 
                          name="fire-off" 
                          size={32} 
                          color="rgba(255,255,255,0.6)" 
                        />
                        <Text style={styles.streakMemoryText}>
                          {previousStreak} days of learning together
                        </Text>
                      </View>
                    )}

                    {/* Encouragement stats */}
                    {index === 2 && (
                      <View style={styles.encouragementStats}>
                        <View style={styles.statItem}>
                          <MaterialCommunityIcons name="heart" size={24} color="#E91E63" />
                          <Text style={styles.statText}>Your progress is saved</Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
                          <Text style={styles.statText}>Your badges remain yours</Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialCommunityIcons name="star" size={24} color="#4CAF50" />
                          <Text style={styles.statText}>Your knowledge grows stronger</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </Animated.View>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={currentStepData.action.onPress}
            >
              <LinearGradient
                colors={
                  currentStepData.loraMood === 'encouraging' 
                    ? Colors.gradients.primary 
                    : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
                }
                style={styles.buttonGradient}
              >
                <Text style={[
                  styles.buttonText,
                  currentStepData.loraMood === 'encouraging' && styles.brightButtonText
                ]}>
                  {currentStepData.action.text}
                </Text>
                <MaterialCommunityIcons 
                  name={currentStepData.loraMood === 'encouraging' ? "rocket" : "arrow-right"} 
                  size={20} 
                  color={currentStepData.loraMood === 'encouraging' ? "white" : "rgba(255,255,255,0.8)"} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  currentStep === index && styles.activeDot,
                  currentStep > index && styles.completedDot,
                ]}
              />
            ))}
          </View>

          {/* Skip option (only show after first step) */}
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleClose}
            >
              <Text style={styles.skipText}>Maybe later</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>
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

  // Lora character
  loraContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loraWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  loraBody: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  loraGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loraFace: {
    fontSize: 48,
  },
  tear: {
    position: 'absolute',
    top: 20,
    right: 25,
  },
  tearDrop: {
    fontSize: 16,
  },
  encouragingGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    top: -25,
    left: -25,
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
  messageContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  // Streak memory
  streakMemoryContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  streakMemoryText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Encouragement stats
  encouragementStats: {
    marginTop: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  brightButtonText: {
    color: 'white',
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#E91E63',
  },
  completedDot: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  // Skip
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});