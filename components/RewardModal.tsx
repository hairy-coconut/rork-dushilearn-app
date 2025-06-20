import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Reward } from './constants/dailyChest';
import Colors from './constants/colors';
import soundManager from './utils/soundEffects';

const { width, height } = Dimensions.get('window');

export default function RewardModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const reward: Reward = JSON.parse(params.reward as string);

  // Animation values
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  const iconScaleAnim = new Animated.Value(0);
  const confettiAnim = new Animated.Value(0);

  useEffect(() => {
    // Play reward sound
    soundManager.playSound('rewardGet');

    // Start entrance animations
    Animated.sequence([
      // Modal entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Icon bounce
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Start confetti animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleClose = () => {
    soundManager.playSound('click');
    
    // Start exit animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const getRewardIcon = () => {
    switch (reward.type) {
      case 'coins':
        return 'coin';
      case 'phrase':
        return 'book-open-variant';
      case 'boost':
        return 'lightning-bolt';
      case 'discount':
        return 'tag-multiple';
      case 'streak_saver':
        return 'shield-check';
      case 'badge':
        return 'medal';
      default:
        return 'gift';
    }
  };

  const getRewardColor = () => {
    switch (reward.type) {
      case 'coins':
        return '#FFD700';
      case 'phrase':
        return Colors.primary;
      case 'boost':
        return '#FF6B6B';
      case 'discount':
        return '#4CAF50';
      case 'streak_saver':
        return '#2196F3';
      case 'badge':
        return '#9C27B0';
      default:
        return Colors.text;
    }
  };

  const getRewardTitle = () => {
    switch (reward.type) {
      case 'coins':
        return 'Coconut Coins!';
      case 'phrase':
        return 'New Phrase!';
      case 'boost':
        return 'XP Boost!';
      case 'discount':
        return 'Special Discount!';
      case 'streak_saver':
        return 'Streak Saver!';
      case 'badge':
        return 'New Badge!';
      default:
        return 'Reward!';
    }
  };

  return (
    <Modal
      transparent
      visible={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>

          <View style={styles.rewardContainer}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: iconScaleAnim }],
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getRewardIcon()}
                size={80}
                color={getRewardColor()}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.confettiContainer,
                {
                  opacity: confettiAnim,
                  transform: [
                    {
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="star"
                size={20}
                color={getRewardColor()}
                style={styles.confetti}
              />
              <MaterialCommunityIcons
                name="star"
                size={16}
                color={getRewardColor()}
                style={[styles.confetti, styles.confetti2]}
              />
              <MaterialCommunityIcons
                name="star"
                size={24}
                color={getRewardColor()}
                style={[styles.confetti, styles.confetti3]}
              />
            </Animated.View>

            <Text style={styles.rewardTitle}>{getRewardTitle()}</Text>
            <Text style={styles.rewardDescription}>
              {reward.description}
            </Text>
            {reward.value && (
              <Text style={styles.rewardValue}>
                +{reward.value}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.claimButton}
            onPress={handleClose}
          >
            <Text style={styles.claimButtonText}>Claim Reward</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  rewardContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 16,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
  },
  confetti2: {
    left: -30,
    top: 20,
  },
  confetti3: {
    right: -30,
    top: 40,
  },
  rewardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  rewardDescription: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  rewardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
  },
  claimButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 