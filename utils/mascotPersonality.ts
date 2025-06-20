import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MascotMessage {
  id: string;
  text: string;
  emotion: 'happy' | 'excited' | 'encouraging' | 'proud' | 'playful' | 'concerned' | 'celebrating';
  context: 'greeting' | 'lesson_start' | 'correct_answer' | 'wrong_answer' | 'lesson_complete' | 'streak_milestone' | 'achievement' | 'motivation' | 'tip' | 'goodbye';
  mascot: 'coco' | 'lora';
  animation?: 'bounce' | 'wave' | 'dance' | 'nod' | 'cheer' | 'point' | 'wink';
  soundEffect?: string;
}

export interface MascotState {
  preferredMascot: 'coco' | 'lora';
  relationship: {
    coco: number; // 0-100 friendship level
    lora: number; // 0-100 friendship level
  };
  interactions: number;
  lastInteraction: number;
  personalityTraits: {
    helpfulness: number; // How often they give tips
    encouragement: number; // How motivational they are
    playfulness: number; // How fun and silly they are
    wisdom: number; // How educational their messages are
  };
  messageHistory: string[]; // Track recent messages to avoid repetition
}

const MASCOT_STORAGE_KEY = '@dushi_learn_mascot';

// Coco's messages (more playful, energetic, fun-loving)
const COCO_MESSAGES: Omit<MascotMessage, 'id' | 'mascot'>[] = [
  // Greetings
  { text: "Bon dia! Ready to splash into some Papiamento?", emotion: 'happy', context: 'greeting', animation: 'wave' },
  { text: "Ayó! Let's make some waves with your learning today!", emotion: 'excited', context: 'greeting', animation: 'bounce' },
  { text: "Welcome back to paradise, dushi! Time to learn!", emotion: 'playful', context: 'greeting', animation: 'dance' },
  
  // Lesson start
  { text: "Let's dive deep into this lesson like the Caribbean sea!", emotion: 'excited', context: 'lesson_start', animation: 'cheer' },
  { text: "Time to ride the learning wave! Vamonos!", emotion: 'encouraging', context: 'lesson_start', animation: 'point' },
  
  // Correct answers
  { text: "Excelente! You're surfing those answers perfectly!", emotion: 'celebrating', context: 'correct_answer', animation: 'dance' },
  { text: "Dushi! That was smooth as Caribbean waters!", emotion: 'happy', context: 'correct_answer', animation: 'cheer' },
  { text: "¡Mashá bon! You're making me proud!", emotion: 'proud', context: 'correct_answer', animation: 'bounce' },
  
  // Wrong answers
  { text: "No worries, we all wipe out sometimes! Try again!", emotion: 'encouraging', context: 'wrong_answer', animation: 'nod' },
  { text: "That's okay, dushi! Even the best surfers fall off their boards!", emotion: 'playful', context: 'wrong_answer', animation: 'wave' },
  
  // Lesson complete
  { text: "You conquered that lesson like a true island champion!", emotion: 'celebrating', context: 'lesson_complete', animation: 'cheer' },
  { text: "Fantastic work! Time to celebrate beach-style!", emotion: 'excited', context: 'lesson_complete', animation: 'dance' },
  
  // Streak milestones
  { text: "Your streak is hotter than the Caribbean sun! Keep it burning!", emotion: 'celebrating', context: 'streak_milestone', animation: 'cheer' },
  { text: "That streak is making bigger waves than a hurricane! Incredible!", emotion: 'excited', context: 'streak_milestone', animation: 'dance' },
  
  // Motivation
  { text: "Remember, every expert was once a beginner! Keep swimming!", emotion: 'encouraging', context: 'motivation', animation: 'nod' },
  { text: "You've got island spirit! That's what makes you special!", emotion: 'playful', context: 'motivation', animation: 'wink' },
  
  // Tips
  { text: "Pro tip: Practice your Papiamento while walking on the beach!", emotion: 'happy', context: 'tip', animation: 'point' },
  { text: "Try saying these words with a smile - it makes them stick better!", emotion: 'playful', context: 'tip', animation: 'wink' },
];

// Lora's messages (more wise, cultural, nurturing)
const LORA_MESSAGES: Omit<MascotMessage, 'id' | 'mascot'>[] = [
  // Greetings
  { text: "Bon dia, mi dushi! Ready to embrace our beautiful language?", emotion: 'happy', context: 'greeting', animation: 'wave' },
  { text: "Welcome, mi amor! Let's explore Papiamento together today.", emotion: 'encouraging', context: 'greeting', animation: 'nod' },
  { text: "Ayó! Time to connect with your Caribbean roots through language.", emotion: 'proud', context: 'greeting', animation: 'point' },
  
  // Lesson start
  { text: "Each word you learn carries the soul of our islands.", emotion: 'encouraging', context: 'lesson_start', animation: 'nod' },
  { text: "Let's weave these beautiful words into your heart.", emotion: 'happy', context: 'lesson_start', animation: 'wave' },
  
  // Correct answers
  { text: "Perfecto! You're speaking like a true islander now!", emotion: 'proud', context: 'correct_answer', animation: 'nod' },
  { text: "Mashá bon! Your ancestors would be proud of your progress!", emotion: 'celebrating', context: 'correct_answer', animation: 'cheer' },
  { text: "Beautiful! You're preserving our culture with every word.", emotion: 'happy', context: 'correct_answer', animation: 'wave' },
  
  // Wrong answers
  { text: "Don't worry, mi dushi. Learning is a journey, not a race.", emotion: 'encouraging', context: 'wrong_answer', animation: 'nod' },
  { text: "That's alright, sweetheart. Even I'm still learning new words!", emotion: 'playful', context: 'wrong_answer', animation: 'wink' },
  
  // Lesson complete
  { text: "You've honored our language today. Thank you, mi dushi!", emotion: 'proud', context: 'lesson_complete', animation: 'nod' },
  { text: "Another step closer to your Caribbean heart. Well done!", emotion: 'celebrating', context: 'lesson_complete', animation: 'cheer' },
  
  // Streak milestones
  { text: "Your dedication flows like the eternal Caribbean currents!", emotion: 'proud', context: 'streak_milestone', animation: 'nod' },
  { text: "This consistency shows true island wisdom. Mashá bon!", emotion: 'celebrating', context: 'streak_milestone', animation: 'cheer' },
  
  // Motivation
  { text: "Remember, you're not just learning words - you're connecting to culture.", emotion: 'encouraging', context: 'motivation', animation: 'point' },
  { text: "Trust in yourself, mi dushi. The ocean teaches patience.", emotion: 'happy', context: 'motivation', animation: 'wave' },
  
  // Tips
  { text: "Listen to how locals speak - rhythm is as important as words.", emotion: 'encouraging', context: 'tip', animation: 'point' },
  { text: "Connect new words to Caribbean memories - food, music, family.", emotion: 'happy', context: 'tip', animation: 'nod' },
];

export class MascotPersonalityManager {
  private static instance: MascotPersonalityManager;
  private mascotState: MascotState = {
    preferredMascot: 'coco',
    relationship: { coco: 50, lora: 50 },
    interactions: 0,
    lastInteraction: 0,
    personalityTraits: {
      helpfulness: 70,
      encouragement: 80,
      playfulness: 60,
      wisdom: 50,
    },
    messageHistory: [],
  };

  static getInstance(): MascotPersonalityManager {
    if (!MascotPersonalityManager.instance) {
      MascotPersonalityManager.instance = new MascotPersonalityManager();
    }
    return MascotPersonalityManager.instance;
  }

  async loadMascotState(): Promise<MascotState> {
    try {
      const stored = await AsyncStorage.getItem(MASCOT_STORAGE_KEY);
      if (stored) {
        this.mascotState = { ...this.mascotState, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading mascot state:', error);
    }
    return this.mascotState;
  }

  async saveMascotState(): Promise<void> {
    try {
      await AsyncStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(this.mascotState));
    } catch (error) {
      console.error('Error saving mascot state:', error);
    }
  }

  async recordInteraction(mascot: 'coco' | 'lora', positive: boolean = true): Promise<void> {
    this.mascotState.interactions += 1;
    this.mascotState.lastInteraction = Date.now();
    
    // Update relationship
    const relationshipChange = positive ? 2 : -1;
    this.mascotState.relationship[mascot] = Math.max(0, Math.min(100, 
      this.mascotState.relationship[mascot] + relationshipChange
    ));

    // Evolve personality traits based on interactions
    if (positive) {
      this.mascotState.personalityTraits.encouragement = Math.min(100, 
        this.mascotState.personalityTraits.encouragement + 1
      );
    }

    await this.saveMascotState();
  }

  getPersonalizedMessage(
    context: MascotMessage['context'],
    userState?: {
      streak?: number;
      level?: number;
      recentPerformance?: 'good' | 'struggling' | 'excellent';
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
    }
  ): MascotMessage {
    const mascot = this.mascotState.preferredMascot;
    const messages = mascot === 'coco' ? COCO_MESSAGES : LORA_MESSAGES;
    
    // Filter messages by context
    const contextMessages = messages.filter(m => m.context === context);
    
    // Fallback to general messages if no context matches
    const fallbackMessages = contextMessages.length > 0 ? contextMessages : messages.slice(0, 3);
    
    // Filter out recently used messages
    const availableMessages = fallbackMessages.filter(m => 
      !this.mascotState.messageHistory.includes(m.text)
    );
    
    // If all messages were used recently, reset history and use all context messages
    const finalMessages = availableMessages.length > 0 ? availableMessages : fallbackMessages;
    
    // Select message based on personality and user state
    let selectedMessage = finalMessages[Math.floor(Math.random() * finalMessages.length)];
    
    // Customize message based on user state
    if (userState) {
      selectedMessage = this.customizeMessage(selectedMessage, userState);
    }

    // Create full message object
    const fullMessage: MascotMessage = {
      ...selectedMessage,
      id: `${mascot}_${Date.now()}_${context}`,
      mascot,
    };

    // Update message history
    this.mascotState.messageHistory.push(selectedMessage.text);
    if (this.mascotState.messageHistory.length > 20) {
      this.mascotState.messageHistory = this.mascotState.messageHistory.slice(-10);
    }

    this.saveMascotState();
    return fullMessage;
  }

  private customizeMessage(
    message: Omit<MascotMessage, 'id' | 'mascot'>,
    userState: {
      streak?: number;
      level?: number;
      recentPerformance?: 'good' | 'struggling' | 'excellent';
      timeOfDay?: 'morning' | 'afternoon' | 'evening';
    }
  ): Omit<MascotMessage, 'id' | 'mascot'> {
    let customizedText = message.text;

    // Add streak-specific encouragement
    if (userState.streak && userState.streak >= 7) {
      if (message.context === 'greeting') {
        customizedText += ` Your ${userState.streak}-day streak is amazing!`;
      }
    }

    // Adjust for performance
    if (userState.recentPerformance === 'struggling' && message.emotion === 'encouraging') {
      message.emotion = 'concerned';
      if (this.mascotState.preferredMascot === 'coco') {
        customizedText = "Hey dushi, I believe in you! Every wave teaches us something new.";
      } else {
        customizedText = "Don't give up, mi amor. Even the mightiest ceiba tree grows slowly.";
      }
    }

    // Time-of-day customization
    if (userState.timeOfDay === 'morning' && message.context === 'greeting') {
      customizedText = customizedText.replace('Ayó!', 'Bon dia!').replace('Welcome back', 'Good morning');
    }

    return { ...message, text: customizedText };
  }

  async switchPreferredMascot(): Promise<'coco' | 'lora'> {
    this.mascotState.preferredMascot = this.mascotState.preferredMascot === 'coco' ? 'lora' : 'coco';
    await this.saveMascotState();
    return this.mascotState.preferredMascot;
  }

  getRelationshipLevel(mascot: 'coco' | 'lora'): string {
    const relationship = this.mascotState.relationship[mascot];
    
    if (relationship >= 90) return 'Best Friends';
    if (relationship >= 75) return 'Close Friends';
    if (relationship >= 60) return 'Good Friends';
    if (relationship >= 40) return 'Friends';
    if (relationship >= 25) return 'Acquaintances';
    return 'Just Met';
  }

  shouldShowMascot(context: string): boolean {
    const timeSinceLastInteraction = Date.now() - this.mascotState.lastInteraction;
    const hoursSinceLastInteraction = timeSinceLastInteraction / (1000 * 60 * 60);
    
    // Show more frequently if relationship is strong
    const relationshipBonus = this.mascotState.relationship[this.mascotState.preferredMascot] / 100;
    
    // Different contexts have different probabilities
    const contextProbability = {
      'lesson_start': 0.8,
      'lesson_complete': 0.9,
      'correct_answer': 0.3 + relationshipBonus * 0.2,
      'wrong_answer': 0.6 + relationshipBonus * 0.3,
      'greeting': 0.7,
      'achievement': 1.0,
      'streak_milestone': 1.0,
      'motivation': 0.5 + relationshipBonus * 0.3,
    };

    const baseProbability = contextProbability[context as keyof typeof contextProbability] || 0.4;
    
    // Increase probability if it's been a while
    const timeFactor = Math.min(1, hoursSinceLastInteraction / 4); // Max factor after 4 hours
    
    return Math.random() < (baseProbability + timeFactor * 0.2);
  }

  getMascotState(): MascotState {
    return { ...this.mascotState };
  }

  async resetRelationships(): Promise<void> {
    this.mascotState.relationship = { coco: 50, lora: 50 };
    this.mascotState.interactions = 0;
    this.mascotState.messageHistory = [];
    await this.saveMascotState();
  }

  // Get contextual animation based on user performance and relationship
  getContextualAnimation(context: string, userPerformance?: 'excellent' | 'good' | 'struggling'): string {
    const relationship = this.mascotState.relationship[this.mascotState.preferredMascot];
    
    if (context === 'correct_answer') {
      if (userPerformance === 'excellent') return 'dance';
      if (relationship >= 75) return 'cheer';
      return 'bounce';
    }
    
    if (context === 'wrong_answer') {
      if (relationship >= 75) return 'nod';
      return 'wave';
    }
    
    if (context === 'achievement' || context === 'streak_milestone') {
      return 'cheer';
    }
    
    return 'wave'; // Default
  }
}

export const mascotPersonalityManager = MascotPersonalityManager.getInstance();