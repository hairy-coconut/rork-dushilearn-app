import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  position: 'top' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Daily Chests! 🎁',
    description: 'Open a chest every day to earn rewards and build your streak.',
    icon: 'gift',
    position: 'top',
  },
  {
    title: 'Build Your Streak 🔥',
    description: 'Open chests daily to increase your streak and earn better rewards.',
    icon: 'fire',
    position: 'bottom',
  },
  {
    title: 'Special Events 🎉',
    description: 'Get bonus rewards on weekends and holidays!',
    icon: 'star',
    position: 'top',
  },
  {
    title: 'Premium Rewards 💎',
    description: 'Gold chests can contain premium content and special themes.',
    icon: 'diamond',
    position: 'bottom',
  },
];

interface ChestTutorialProps {
  onComplete: () => void;
}

export default function ChestTutorial({ onComplete }: ChestTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  const handleNext = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentStep < TUTORIAL_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        onComplete();
      }
    });
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      
      <Animated.View
        style={[
          styles.stepContainer,
          {
            top: step.position === 'top' ? 100 : undefined,
            bottom: step.position === 'bottom' ? 100 : undefined,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={step.icon}
            size={32}
            color={Colors.primary}
          />
        </View>
        
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  stepContainer: {
    position: 'absolute',
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text,
    opacity: 0.3,
    marginHorizontal: 4,
  },
  progressDotActive: {
    opacity: 1,
    backgroundColor: Colors.primary,
  },
}); 