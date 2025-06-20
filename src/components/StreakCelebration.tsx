import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { STREAK_MILESTONES } from '../types/streak';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StreakCelebrationProps {
  streak: number;
  onComplete: () => void;
}

export default function StreakCelebration({ streak, onComplete }: StreakCelebrationProps) {
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  const confettiAnim = new Animated.Value(0);

  useEffect(() => {
    // Start the celebration animation
    Animated.sequence([
      // Scale up with bounce
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      // Fade in confetti
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Animate confetti
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call onComplete after animation finishes
      setTimeout(onComplete, 500);
    });
  }, []);

  const milestone = STREAK_MILESTONES[streak as keyof typeof STREAK_MILESTONES];
  if (!milestone) return null;

  const confettiStyle = {
    transform: [
      {
        translateY: confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -200],
        }),
      },
    ],
    opacity: opacityAnim,
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialCommunityIcons
          name="fire"
          size={64}
          color="#FF6B6B"
          style={styles.icon}
        />
        <Text style={styles.title}>{milestone.title}</Text>
        <Text style={styles.description}>{milestone.description}</Text>
        <Text style={styles.reward}>+{milestone.xpReward} XP</Text>
      </Animated.View>

      {/* Confetti animation */}
      {[...Array(20)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.confetti,
            {
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFD93D'][Math.floor(Math.random() * 3)],
              transform: [
                {
                  rotate: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200],
                  }),
                },
              ],
              opacity: opacityAnim,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  reward: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
}); 