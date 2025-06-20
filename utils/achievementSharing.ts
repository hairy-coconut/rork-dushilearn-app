import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Achievement } from './achievements';

export async function shareAchievement(achievement: Achievement) {
  try {
    const message = generateShareMessage(achievement);
    
    if (Platform.OS === 'web') {
      // For web, use the Web Share API
      if (navigator.share) {
        await navigator.share({
          title: 'Achievement Unlocked!',
          text: message,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(message);
        alert('Share message copied to clipboard!');
      }
    } else {
      // For mobile, use Expo Sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(message);
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error sharing achievement:', error);
    throw error;
  }
}

function generateShareMessage(achievement: Achievement): string {
  const rarityEmoji = getRarityEmoji(achievement.rarity);
  const rewardText = achievement.reward
    ? `\nReward: ${achievement.reward.description}`
    : '';

  return `🏆 Achievement Unlocked! 🏆\n\n${rarityEmoji} ${achievement.title}\n\n${achievement.description}${rewardText}\n\n#DushiLearn #Achievement`;
}

function getRarityEmoji(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return '🌟';
    case 'epic':
      return '💫';
    case 'rare':
      return '✨';
    case 'uncommon':
      return '⭐';
    default:
      return '🎯';
  }
}

export function generateAchievementImage(achievement: Achievement): string {
  // This is a placeholder for future implementation of image generation
  // We could use a canvas or a third-party service to generate achievement cards
  return '';
}

export function getShareOptions(achievement: Achievement) {
  return {
    title: 'Share Achievement',
    message: generateShareMessage(achievement),
    url: generateAchievementImage(achievement),
    social: {
      twitter: {
        message: generateShareMessage(achievement),
        url: generateAchievementImage(achievement),
      },
      facebook: {
        message: generateShareMessage(achievement),
        url: generateAchievementImage(achievement),
      },
    },
  };
} 