import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/colors';
import { typography } from '../constants/typography';
import { ComboState, COMBO_TIERS, comboManager } from './utils/comboSystem';

interface ComboDisplayProps {
  comboState: ComboState;
  visible: boolean;
  onTierUp?: (tier: typeof COMBO_TIERS[0]) => void;
}

const { width } = Dimensions.get('window');

export default function ComboDisplay({
  comboState,
  visible,
  onTierUp,
}: ComboDisplayProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAtRisk, setIsAtRisk] = useState(false);

  const currentTier = comboManager.getCurrentTier();
  const nextTier = comboManager.getNextTier();
  const hasCombo = comboState.currentCombo > 0;

  // Update timer
  useEffect(() => {
    if (!hasCombo) return;

    const interval = setInterval(() => {
      const remaining = comboManager.getComboTimeRemaining();
      const atRisk = comboManager.isComboAtRisk();
      
      setTimeRemaining(remaining);
      setIsAtRisk(atRisk);

      // Urgent animation when combo is at risk
      if (atRisk) {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasCombo]);

  // Entrance/exit animation
  useEffect(() => {
    if (visible && hasCombo) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 80,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      // Pulse animation
      const createPulse = () => {
        return Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]);
      };

      const pulseLoop = Animated.loop(createPulse());
      pulseLoop.start();

      return () => pulseLoop.stop();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, hasCombo]);

  // Tier up celebration
  useEffect(() => {
    if (currentTier.threshold > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Celebration animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      onTierUp?.(currentTier);
    }
  }, [currentTier.threshold]);

  if (!visible || !hasCombo) return null;

  const progressToNext = nextTier 
    ? (comboState.currentCombo - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)
    : 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[currentTier.color, `${currentTier.color}80`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Combo Counter */}
          <View style={styles.comboSection}>
            <Text style={styles.comboEmoji}>{currentTier.emoji}</Text>
            <Text style={styles.comboNumber}>{comboState.currentCombo}</Text>
            <Text style={styles.comboLabel}>COMBO</Text>
          </View>

          {/* Multiplier */}
          <View style={styles.multiplierSection}>
            <Text style={styles.multiplierText}>
              {comboState.comboMultiplier.toFixed(1)}x XP
            </Text>
            {currentTier.label && (
              <Text style={styles.tierLabel}>{currentTier.label}</Text>
            )}
          </View>

          {/* Timer */}
          {timeRemaining > 0 && (
            <View style={[styles.timerSection, isAtRisk && styles.timerAtRisk]}>
              <MaterialCommunityIcons 
                name="timer" 
                size={16} 
                color={isAtRisk ? Colors.error : Colors.textWhite} 
              />
              <Text style={[styles.timerText, isAtRisk && styles.timerTextAtRisk]}>
                {timeRemaining}s
              </Text>
            </View>
          )}

          {/* Progress to next tier */}
          {nextTier && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min(progressToNext * 100, 100)}%`,
                      backgroundColor: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.8)'],
                      }),
                    }
                  ]} 
                />
              </View>
              <Text style={styles.nextTierText}>
                {nextTier.threshold - comboState.currentCombo} to {nextTier.label}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1000,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    minWidth: 120,
    maxWidth: 180,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  comboSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  comboEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  comboNumber: {
    ...typography.stats.large,
    color: Colors.textWhite,
    fontSize: 28,
  },
  comboLabel: {
    ...typography.caption.small,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  multiplierSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  multiplierText: {
    ...typography.button.medium,
    color: Colors.textWhite,
    fontSize: 14,
  },
  tierLabel: {
    ...typography.caption.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 2,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  timerAtRisk: {
    backgroundColor: 'rgba(255, 87, 87, 0.3)',
  },
  timerText: {
    ...typography.caption.medium,
    color: Colors.textWhite,
    marginLeft: 4,
    fontWeight: '600',
  },
  timerTextAtRisk: {
    color: Colors.error,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  nextTierText: {
    ...typography.caption.small,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    textAlign: 'center',
  },
});