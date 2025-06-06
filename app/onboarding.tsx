import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mascots } from '@/constants/mascots';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LearningReason = 'tourist' | 'expat' | 'local' | 'romance' | 'other';
type PreferredMascot = 'coco' | 'lora';
type DailyGoal = 5 | 10 | 15 | 20;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [learningReason, setLearningReason] = useState<LearningReason | null>(null);
  const [preferredMascot, setPreferredMascot] = useState<PreferredMascot | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  
  const handleComplete = async () => {
    // Save user preferences
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('learning_reason', learningReason || 'other');
      await AsyncStorage.setItem('preferred_mascot', preferredMascot || 'coco');
      await AsyncStorage.setItem('daily_goal', String(dailyGoal || 5));
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };
  
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Why are you learning Papiamento?</Text>
      <Text style={styles.stepDescription}>
        We will personalize your experience based on your goals.
      </Text>
      
      <View style={styles.optionsContainer}>
        {[
          { value: 'tourist', label: "I'm visiting Curaçao/Aruba", icon: "🏝️" },
          { value: 'expat', label: "I'm moving to the islands", icon: "🏠" },
          { value: 'local', label: "I'm a local who wants to improve", icon: "🌴" },
          { value: 'romance', label: "I have a special someone who speaks it", icon: "❤️" },
          { value: 'other', label: "Just curious about the language", icon: "🧠" }
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              learningReason === option.value && styles.selectedOption,
            ]}
            onPress={() => setLearningReason(option.value as LearningReason)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionLabel,
              learningReason === option.value && styles.selectedOptionLabel,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, !learningReason && styles.disabledButton]}
        onPress={() => learningReason && setStep(2)}
        disabled={!learningReason}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
  
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose your guide</Text>
      <Text style={styles.stepDescription}>
        Who would you like to learn with on your Papiamento journey?
      </Text>
      
      <View style={styles.mascotsContainer}>
        <TouchableOpacity
          style={[
            styles.mascotOption,
            preferredMascot === 'coco' && styles.selectedMascot,
          ]}
          onPress={() => setPreferredMascot('coco')}
        >
          <Image
            source={{ uri: mascots.coco.image }}
            style={styles.mascotImage}
          />
          <Text style={styles.mascotName}>Coco</Text>
          <Text style={styles.mascotDescription}>
            Your friendly coconut guide to Papiamento!
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.mascotOption,
            preferredMascot === 'lora' && styles.selectedMascot,
          ]}
          onPress={() => setPreferredMascot('lora')}
        >
          <Image
            source={{ uri: mascots.lora.image }}
            style={styles.mascotImage}
          />
          <Text style={styles.mascotName}>Lora</Text>
          <Text style={styles.mascotDescription}>
            The chatty parrot who helps you perfect your pronunciation!
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, !preferredMascot && styles.disabledButton]}
        onPress={() => preferredMascot && setStep(3)}
        disabled={!preferredMascot}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
  
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Set your daily goal</Text>
      <Text style={styles.stepDescription}>
        How many minutes would you like to practice each day?
      </Text>
      
      <View style={styles.goalsContainer}>
        {[5, 10, 15, 20].map((minutes) => (
          <TouchableOpacity
            key={minutes}
            style={[
              styles.goalOption,
              dailyGoal === minutes && styles.selectedGoal,
            ]}
            onPress={() => setDailyGoal(minutes as DailyGoal)}
          >
            <Text style={[
              styles.goalMinutes,
              dailyGoal === minutes && styles.selectedGoalText,
            ]}>
              {minutes}
            </Text>
            <Text style={[
              styles.goalLabel,
              dailyGoal === minutes && styles.selectedGoalText,
            ]}>
              minutes
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, !dailyGoal && styles.disabledButton]}
        onPress={handleComplete}
        disabled={!dailyGoal}
      >
        <Text style={styles.nextButtonText}>Start Learning</Text>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>dushiLearn</Text>
        <Text style={styles.subtitle}>Learn Papiamento the fun way!</Text>
      </View>
      
      <View style={styles.stepsIndicator}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              step === i && styles.activeStepDot,
              step > i && styles.completedStepDot,
            ]}
          />
        ))}
      </View>
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginHorizontal: 5,
  },
  activeStepDot: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
  },
  completedStepDot: {
    backgroundColor: Colors.success,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedOptionLabel: {
    fontWeight: '600',
    color: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: Colors.inactive,
    opacity: 0.7,
  },
  mascotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  mascotOption: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMascot: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  mascotImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  mascotName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  mascotDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  goalOption: {
    width: '23%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoal: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  goalMinutes: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  goalLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedGoalText: {
    color: 'white',
  },
});