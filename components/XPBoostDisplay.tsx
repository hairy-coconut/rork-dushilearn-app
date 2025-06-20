import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/colors';
import { typography } from '../constants/typography';
import { XPBoost, xpBoostManager } from '../utils/xpBoosts';

interface XPBoostDisplayProps {
  boost: XPBoost;
  onPress?: () => void;
  compact?: boolean;
}

export default function XPBoostDisplay({
  boost,
  onPress,
  compact = false,
}: XPBoostDisplayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  // Update timer for timed boosts
  useEffect(() => {
    if (boost.type !== 'timed' || !boost.expiresAt) return;

    const interval = setInterval(() => {
      const remainingText = xpBoostManager.getTimeRemainingText(boost);
      const expiringSoon = xpBoostManager.isBoostExpiringSoon(boost, 120); // 2 minutes
      
      setTimeRemaining(remainingText);
      setIsExpiringSoon(expiringSoon);

      // Urgent pulsing when expiring soon
      if (expiringSoon) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [boost]);

  // Glow animation
  useEffect(() => {
    const createGlow = () => {
      return Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]);
    };

    const glowLoop = Animated.loop(createGlow());
    glowLoop.start();

    return () => glowLoop.stop();
  }, []);

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getRarityColor = () => {
    switch (boost.rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9C27B0';
      case 'rare': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const getMultiplierColor = () => {
    if (boost.multiplier >= 5) return '#FFD700';
    if (boost.multiplier >= 3) return '#FF6B35';
    if (boost.multiplier >= 2) return '#4CAF50';
    return '#2196F3';
  };

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          {
            transform: [{ scale: pulseAnim }],
            borderColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [boost.color + '40', boost.color + 'AA'],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.compactContent}
          onPress={handlePress}
          disabled={!onPress}
        >
          <LinearGradient
            colors={[boost.color, `${boost.color}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.compactGradient}
          >
            <MaterialCommunityIcons 
              name={boost.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
              size={16} 
              color={Colors.textWhite} 
            />
            <Text style={styles.compactMultiplier}>
              {boost.multiplier}x
            </Text>
            {boost.type === 'timed' && timeRemaining && (
              <Text style={[
                styles.compactTimer,
                isExpiringSoon && styles.compactTimerUrgent
              ]}>
                {timeRemaining}
              </Text>
            )}
            {boost.type === 'lesson_based' && boost.lessonsRemaining && (
              <Text style={styles.compactTimer}>
                {boost.lessonsRemaining} left
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        disabled={!onPress}
      >
        <LinearGradient
          colors={[boost.color, `${boost.color}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Rarity indicator */}
          <View style={[styles.rarityIndicator, { backgroundColor: getRarityColor() }]}>
            <Text style={styles.rarityText}>{boost.rarity.toUpperCase()}</Text>
          </View>

          {/* Main content */}
          <View style={styles.content}>
            {/* Icon and multiplier */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={boost.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
                  size={32} 
                  color={Colors.textWhite} 
                />
              </View>
              <View style={styles.multiplierContainer}>
                <Text style={[styles.multiplierText, { color: getMultiplierColor() }]}>
                  {boost.multiplier}x
                </Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </View>

            {/* Name and description */}
            <Text style={styles.name}>{boost.name}</Text>
            <Text style={styles.description}>{boost.description}</Text>

            {/* Timer or lesson count */}
            {boost.type === 'timed' && timeRemaining && (
              <View style={[styles.timerContainer, isExpiringSoon && styles.timerUrgent]}>
                <MaterialCommunityIcons 
                  name="timer" 
                  size={16} 
                  color={isExpiringSoon ? Colors.error : Colors.textWhite} 
                />
                <Text style={[
                  styles.timerText,
                  isExpiringSoon && styles.timerTextUrgent
                ]}>
                  {timeRemaining}
                </Text>
              </View>
            )}

            {boost.type === 'lesson_based' && boost.lessonsRemaining && (
              <View style={styles.lessonContainer}>
                <MaterialCommunityIcons 
                  name="school" 
                  size={16} 
                  color={Colors.textWhite} 
                />
                <Text style={styles.lessonText}>
                  {boost.lessonsRemaining} lessons remaining
                </Text>
              </View>
            )}

            {/* Cost (if applicable) */}
            {boost.coconutCost && (
              <View style={styles.costContainer}>
                <MaterialCommunityIcons 
                  name="circle" 
                  size={16} 
                  color={Colors.coconut} 
                />
                <Text style={styles.costText}>{boost.coconutCost}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Compact styles
  compactContainer: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    margin: 4,
  },
  compactContent: {
    // No additional styles needed
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  compactMultiplier: {
    ...typography.button.small,
    color: Colors.textWhite,
    fontWeight: '800',
  },
  compactTimer: {
    ...typography.caption.small,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  compactTimerUrgent: {
    color: Colors.error,
  },

  // Full styles
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  touchable: {
    // No additional styles needed
  },
  gradient: {
    padding: 20,
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  rarityText: {
    ...typography.caption.small,
    color: Colors.textWhite,
    fontWeight: '800',
    fontSize: 10,
  },
  content: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  multiplierContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  multiplierText: {
    ...typography.stats.large,
    fontWeight: '900',
    fontSize: 28,
  },
  xpLabel: {
    ...typography.caption.medium,
    color: Colors.textWhite,
    fontWeight: '600',
  },
  name: {
    ...typography.heading.h3,
    color: Colors.textWhite,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    ...typography.body.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  timerUrgent: {
    backgroundColor: 'rgba(255, 87, 87, 0.3)',
  },
  timerText: {
    ...typography.caption.medium,
    color: Colors.textWhite,
    fontWeight: '600',
    marginLeft: 6,
  },
  timerTextUrgent: {
    color: Colors.error,
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  lessonText: {
    ...typography.caption.medium,
    color: Colors.textWhite,
    fontWeight: '600',
    marginLeft: 6,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  costText: {
    ...typography.caption.medium,
    color: Colors.textWhite,
    fontWeight: '600',
    marginLeft: 4,
  },
});