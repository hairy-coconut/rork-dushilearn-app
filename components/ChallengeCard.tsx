import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import { Challenge, ChallengeParticipant, formatChallengeType, getChallengeProgress, isChallengeActive, isChallengeCompleted, getChallengeTimeRemaining } from '../utils/social';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserParticipant?: ChallengeParticipant;
  onPress?: () => void;
  onInvite?: () => void;
}

export default function ChallengeCard({
  challenge,
  currentUserParticipant,
  onPress,
  onInvite,
}: ChallengeCardProps) {
  const { theme } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onInvite?.();
  };

  const getChallengeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'xp':
        return 'star';
      case 'lessons':
        return 'book-open-variant';
      case 'streak':
        return 'fire';
      case 'accuracy':
        return 'target';
      default:
        return 'trophy';
    }
  };

  const getProgressColor = () => {
    if (!currentUserParticipant) return [theme.colors.primary, theme.colors.primaryDark];
    const progress = getChallengeProgress(currentUserParticipant, challenge);
    if (progress >= 100) return ['#4CAF50', '#2E7D32']; // Green
    if (progress >= 50) return ['#FFC107', '#FFA000']; // Yellow
    return [theme.colors.primary, theme.colors.primaryDark];
  };

  const progress = getProgressColor();
  const progressPercentage = Math.min(100, (progress / challenge.target) * 100);
  const isCreator = challenge.creator_id === currentUserId;
  const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={getChallengeColor()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name={getChallengeIcon(challenge.type)}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.title}>{challenge.title}</Text>
          </View>
          {isCreator && (
            <View style={styles.creatorBadge}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress} / {challenge.target}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.rewardContainer}>
            <MaterialCommunityIcons
              name={getRewardIcon(challenge.reward.type)}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.rewardText}>
              {challenge.reward.type === 'coins'
                ? `${challenge.reward.value} Coins`
                : challenge.reward.value}
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.timeText}>
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  creatorBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
}); 