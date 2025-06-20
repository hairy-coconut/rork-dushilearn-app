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

interface TooltipData {
  id: string;
  icon: string;
  color: string[];
  title: string;
  explanation: string;
  benefits: string[];
  mascotTip: string;
}

interface GameElementTooltipsProps {
  visible: boolean;
  elementType: 'xp' | 'coins' | 'streaks' | 'hearts' | 'badges';
  onComplete: () => void;
}

const tooltipData: Record<string, TooltipData> = {
  xp: {
    id: 'xp',
    icon: 'star-outline',
    color: ['#FFD700', '#FFA500'],
    title: 'Experience Points (XP)',
    explanation: 'XP shows your learning progress and unlocks new levels!',
    benefits: [
      'Level up to unlock new content',
      'Earn combo multipliers for bonus XP',
      'Use XP boosts for even faster progress',
      'Compare progress with friends'
    ],
    mascotTip: 'Every correct answer earns XP! Keep learning to level up faster! ⚡'
  },
  coins: {
    id: 'coins',
    icon: 'circle-multiple',
    color: ['#8B4513', '#D2691E'],
    title: 'Coconut Coins',
    explanation: 'Your island currency for special rewards and power-ups!',
    benefits: [
      'Buy XP boosts and streak freezes',
      'Unlock premium mascot outfits',
      'Purchase hints during difficult lessons',
      'Get exclusive island content'
    ],
    mascotTip: 'Save your coconut coins for when you really need them, dushi! 🥥'
  },
  streaks: {
    id: 'streaks',
    icon: 'fire',
    color: ['#FF6B35', '#FF4500'],
    title: 'Learning Streaks',
    explanation: 'Keep learning daily to build your streak and unlock amazing rewards!',
    benefits: [
      'Streak multipliers boost your XP',
      'Unlock exclusive streak badges',
      'Get bonus coconut coins daily',
      'Show off your dedication'
    ],
    mascotTip: 'Even 5 minutes a day keeps your streak alive! Consistency is key! 🔥'
  },
  hearts: {
    id: 'hearts',
    icon: 'heart',
    color: ['#E91E63', '#F06292'],
    title: 'Hearts (Lives)',
    explanation: 'Hearts let you make mistakes while learning - don\'t worry about being perfect!',
    benefits: [
      'Learn without pressure',
      'Hearts refill over time',
      'Practice mode uses no hearts',
      'Premium users get unlimited hearts'
    ],
    mascotTip: 'Making mistakes is part of learning! Your hearts will come back, mi amor! 💕'
  },
  badges: {
    id: 'badges',
    icon: 'medal',
    color: ['#9C27B0', '#BA68C8'],
    title: 'Achievement Badges',
    explanation: 'Badges celebrate your milestones and show your learning journey!',
    benefits: [
      'Track your accomplishments',
      'Unlock special rewards',
      'Share achievements with friends',
      'Get motivated by progress'
    ],
    mascotTip: 'Each badge tells your unique story! Collect them all, champion! 🏆'
  }
};

export default function GameElementTooltips({
  visible,
  elementType,
  onComplete,
}: GameElementTooltipsProps) {
  const [showTooltip, setShowTooltip] = useState(visible);
  const data = tooltipData[elementType];

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setShowTooltip(true);
      startAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Icon rotation
    Animated.loop(
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
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

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowTooltip(false);
      onComplete();
    });
  };

  if (!showTooltip || !data) return null;

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={showTooltip}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={data.color}
            style={styles.header}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate: iconRotation }
                  ]
                }
              ]}
            >
              <MaterialCommunityIcons 
                name={data.icon as any} 
                size={48} 
                color="white" 
              />
            </Animated.View>
            
            <Text style={styles.title}>{data.title}</Text>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.explanation}>{data.explanation}</Text>
            
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What you can do:</Text>
              {data.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={20} 
                    color={Colors.success} 
                  />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Mascot tip */}
            <View style={styles.mascotTipContainer}>
              <View style={styles.mascotAvatar}>
                <Text style={styles.mascotEmoji}>🥥</Text>
              </View>
              <View style={styles.speechBubble}>
                <Text style={styles.mascotTipText}>{data.mascotTip}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClose}
            >
              <LinearGradient
                colors={data.color}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Got it!</Text>
                <MaterialCommunityIcons name="check" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Higher-order component for easy integration
interface TooltipTriggerProps {
  children: React.ReactElement;
  elementType: 'xp' | 'coins' | 'streaks' | 'hearts' | 'badges';
  showOnMount?: boolean;
}

export function TooltipTrigger({ 
  children, 
  elementType, 
  showOnMount = false 
}: TooltipTriggerProps) {
  const [showTooltip, setShowTooltip] = useState(showOnMount);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowTooltip(true);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress}>
        {children}
      </TouchableOpacity>
      
      <GameElementTooltips
        visible={showTooltip}
        elementType={elementType}
        onComplete={() => setShowTooltip(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
  },
  tooltipContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },

  // Content
  content: {
    padding: 24,
  },
  explanation: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },

  // Mascot tip
  mascotTipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  mascotAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mascotEmoji: {
    fontSize: 18,
  },
  speechBubble: {
    flex: 1,
  },
  mascotTipText: {
    fontSize: 14,
    color: Colors.primary,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Action button
  actionButton: {
    alignSelf: 'stretch',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});