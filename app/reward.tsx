import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Reward } from '../constants/dailyChest';
import Colors from '../constants/colors';
import soundManager from '../utils/soundEffects';
import { usePremiumFeature } from '../hooks/useFeatureAccess';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

export default function RewardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [reward, setReward] = useState<Reward | null>(null);
  const { isPremium } = usePremiumFeature();
  
  // Animation values
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  const confettiAnim = new Animated.Value(0);

  useEffect(() => {
    if (params.reward) {
      const parsedReward = JSON.parse(params.reward as string) as Reward;
      setReward(parsedReward);
      startAnimations();
      playRewardSound(parsedReward);
    }
  }, [params.reward]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Start confetti animation
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const playRewardSound = (reward: Reward) => {
    if (reward.specialEvent) {
      soundManager.playSound('special_reward');
    } else if (reward.rarity === 'legendary') {
      soundManager.playSound('legendary_reward');
    } else {
      soundManager.playSound('rewardGet');
    }
  };

  const getRewardIcon = () => {
    switch (reward?.type) {
      case 'coins':
        return 'coin';
      case 'phrase':
        return 'book-open-variant';
      case 'boost':
        return 'lightning-bolt';
      case 'discount':
        return 'tag-multiple';
      case 'streak_saver':
        return 'fire';
      case 'badge':
        return 'medal';
      case 'special_phrase':
        return 'star';
      case 'bonus_chest':
        return 'gift';
      case 'premium_trial':
        return 'crown';
      case 'theme_unlock':
        return 'palette';
      default:
        return 'gift';
    }
  };

  const getRewardColor = () => {
    switch (reward?.rarity) {
      case 'legendary':
        return '#FFD700';
      case 'epic':
        return '#FF6B6B';
      case 'rare':
        return '#4ECDC4';
      case 'uncommon':
        return '#95E1D3';
      default:
        return Colors.primary;
    }
  };

  const handleClose = () => {
    soundManager.playSound('click');
    router.back();
  };

  if (!reward) return null;

  return (
    <View style={styles.container}>
      <ConfettiCannon
        ref={(ref) => ref?.startConfetti()}
        duration={3000}
        colors={[getRewardColor()]}
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: getRewardColor() + '20' }]}>
          <MaterialCommunityIcons
            name={getRewardIcon()}
            size={48}
            color={getRewardColor()}
          />
        </View>

        <Text style={styles.title}>Reward Unlocked!</Text>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardType}>{reward.type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.rewardDescription}>{reward.description}</Text>
          
          {reward.specialEvent && (
            <View style={styles.specialEventContainer}>
              <MaterialCommunityIcons
                name="star"
                size={20}
                color={getRewardColor()}
              />
              <Text style={styles.specialEventText}>
                Special {reward.specialEvent} Reward!
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: getRewardColor() }]}
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  rewardContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  rewardType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  rewardDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  specialEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  specialEventText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 