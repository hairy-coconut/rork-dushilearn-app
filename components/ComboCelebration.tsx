import React, { useEffect, useRef } from 'react';
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
import ConfettiCannon from 'react-native-confetti-cannon';
import Colors from '../constants/colors';
import { typography } from '../constants/typography';
import { COMBO_TIERS } from '../utils/comboSystem';

interface ComboCelebrationProps {
  visible: boolean;
  tier: typeof COMBO_TIERS[0];
  combo: number;
  bonusXP: number;
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export default function ComboCelebration({
  visible,
  tier,
  combo,
  bonusXP,
  onComplete,
}: ComboCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      // Trigger intense haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Start entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 80,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
      ]).start();

      // Rotation animation for the emoji
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Fire confetti
      setTimeout(() => {
        confettiRef.current?.start();
      }, 200);

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        exitAnimation();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const exitAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  if (!visible) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getIntensityLevel = (combo: number) => {
    if (combo >= 20) return 'LEGENDARY';
    if (combo >= 15) return 'EPIC';
    if (combo >= 10) return 'AMAZING';
    if (combo >= 5) return 'GREAT';
    return 'GOOD';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Background overlay */}
      <View style={styles.overlay} />
      
      {/* Main celebration content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[tier.color, `${tier.color}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Animated emoji */}
          <Animated.Text
            style={[
              styles.emoji,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            {tier.emoji}
          </Animated.Text>

          {/* Combo number */}
          <Text style={styles.comboNumber}>{combo}</Text>
          <Text style={styles.comboText}>COMBO!</Text>

          {/* Tier label */}
          <Text style={styles.tierLabel}>{tier.label}</Text>

          {/* Multiplier display */}
          <View style={styles.multiplierContainer}>
            <MaterialCommunityIcons 
              name="close" 
              size={20} 
              color={Colors.textWhite} 
            />
            <Text style={styles.multiplierText}>{tier.multiplier}</Text>
            <Text style={styles.xpText}>XP</Text>
          </View>

          {/* Bonus XP earned */}
          <View style={styles.bonusContainer}>
            <MaterialCommunityIcons 
              name="plus" 
              size={16} 
              color={Colors.accent} 
            />
            <Text style={styles.bonusText}>{bonusXP} Bonus XP!</Text>
          </View>

          {/* Intensity level */}
          <Text style={styles.intensityText}>{getIntensityLevel(combo)}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: width / 2, y: height / 3 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={2000}
        colors={[tier.color, Colors.accent, Colors.secondary, Colors.success]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    width: width * 0.8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  comboNumber: {
    ...typography.display.large,
    color: Colors.textWhite,
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 8,
  },
  comboText: {
    ...typography.heading.h2,
    color: Colors.textWhite,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  tierLabel: {
    ...typography.heading.h3,
    color: Colors.textWhite,
    fontWeight: '700',
    marginBottom: 20,
  },
  multiplierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  multiplierText: {
    ...typography.stats.medium,
    color: Colors.textWhite,
    fontWeight: '800',
    marginHorizontal: 8,
  },
  xpText: {
    ...typography.button.medium,
    color: Colors.textWhite,
    fontWeight: '600',
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bonusText: {
    ...typography.body.medium,
    color: Colors.accent,
    fontWeight: '700',
    marginLeft: 8,
  },
  intensityText: {
    ...typography.caption.large,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});