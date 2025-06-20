import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ChestState, getChestState, updateChestState } from '@/utils/chestStorage';
import { getRandomReward, Reward } from '@/constants/dailyChest';
import Colors from '@/constants/colors';
import soundManager from '@/utils/soundEffects';
import { usePremiumFeature } from '@/hooks/useFeatureAccess';
import PremiumFeatureGate from './PremiumFeatureGate';

const { width } = Dimensions.get('window');

export default function DailyChest() {
  const router = useRouter();
  const [chestState, setChestState] = useState<ChestState | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const { isPremium, isLoading: isSubscriptionLoading } = usePremiumFeature();
  
  // Animation values
  const shakeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(1);
  const opacityAnim = new Animated.Value(1);
  const glowAnim = new Animated.Value(0);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    loadChestState();
    startContinuousAnimations();
  }, []);

  const startContinuousAnimations = () => {
    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gentle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadChestState = async () => {
    const state = await getChestState();
    setChestState(state);
  };

  const startShakeAnimation = () => {
    if (!chestState?.isAvailable || isShaking) return;

    setIsShaking(true);
    soundManager.playSound('click');
    Vibration.vibrate(100);

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsShaking(false);
      openChest();
    });
  };

  const openChest = async () => {
    if (!chestState?.isAvailable) return;

    soundManager.playSound('chestOpen');
    
    // Opening animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Get reward based on subscription status
    const newReward = getRandomReward(isPremium ? 'premium' : 'free');
    setReward(newReward);

    // Update chest state
    const newState = {
      ...chestState,
      lastOpened: Date.now(),
      currentStreak: chestState.currentStreak + 1,
      longestStreak: Math.max(chestState.currentStreak + 1, chestState.longestStreak),
      isAvailable: false,
    };
    await updateChestState(newState);
    setChestState(newState);

    // Navigate to reward screen
    router.push({
      pathname: '/reward',
      params: { reward: JSON.stringify(newReward) },
    });
  };

  const getChestIcon = () => {
    if (!chestState?.isAvailable) return 'chest';
    return isPremium ? 'chest-open' : 'chest';
  };

  const getChestColor = () => {
    if (!chestState?.isAvailable) return Colors.textSecondary;
    return isPremium ? Colors.primary : Colors.text;
  };

  if (isSubscriptionLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isAvailable = chestState?.isAvailable ?? false;

  return (
    <PremiumFeatureGate
      featureName="Premium Chest"
      description="Unlock premium rewards and special bonuses with a premium subscription!"
      showUpgradeButton={!isPremium}
    >
      <View style={styles.container}>
        <TouchableOpacity
          onPress={startShakeAnimation}
          disabled={!isAvailable || isShaking}
          style={styles.chestButton}
        >
          <Animated.View
            style={[
              styles.chestContainer,
              {
                transform: [
                  { translateX: shakeAnim },
                  { scale: scaleAnim },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: opacityAnim,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowAnim,
                  transform: [{ scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }) }],
                },
              ]}
            />
            <MaterialCommunityIcons
              name={getChestIcon()}
              size={40}
              color={getChestColor()}
            />
            <Text style={styles.chestText}>
              {isAvailable ? 'Tap to Open!' : 'Come back tomorrow!'}
            </Text>
            {chestState?.currentStreak > 0 && (
              <Text style={styles.streakText}>
                {chestState.currentStreak} Day Streak! 🔥
              </Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </PremiumFeatureGate>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  chestButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
  },
  chestText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  streakText: {
    marginTop: 5,
    fontSize: 14,
    color: Colors.primary,
  },
}); 