import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, spacing } from '../theme';

interface LessonCardProps {
  title: string;
  description: string;
  icon: string;
  level: number;
  exerciseCount: number;
  category: 'basics' | 'phrases' | 'culture' | 'missions';
  isLocked?: boolean;
  onPress: () => void;
  onPreview?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.base * 2;

export default function LessonCard({
  title,
  description,
  icon,
  level,
  exerciseCount,
  category,
  isLocked = false,
  onPress,
  onPreview,
}: LessonCardProps) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const getCategoryColor = () => {
    switch (category) {
      case 'basics':
        return colors.aqua;
      case 'phrases':
        return colors.coral;
      case 'culture':
        return colors.purple;
      case 'missions':
        return colors.jungle;
      default:
        return colors.aqua;
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLongPress = () => {
    if (onPreview && !isLocked) {
      setIsPreviewVisible(true);
      onPreview();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: isLocked ? 0.7 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        disabled={isLocked}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[getCategoryColor(), `${getCategoryColor()}80`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={icon}
                  size={24}
                  color={colors.surface}
                />
              </View>
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Level {level}</Text>
              </View>
            </View>

            <View style={styles.details}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
              <View style={styles.exerciseCount}>
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={16}
                  color={colors.surface}
                />
                <Text style={styles.exerciseCountText}>
                  {exerciseCount} exercises
                </Text>
              </View>
            </View>

            {isLocked && (
              <View style={styles.lockedOverlay}>
                <MaterialCommunityIcons
                  name="lock"
                  size={24}
                  color={colors.surface}
                />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginVertical: spacing.sm,
    borderRadius: spacing.lg,
    ...shadows.base,
  },
  touchable: {
    borderRadius: spacing.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.base,
  },
  content: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.full,
  },
  levelText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  details: {
    gap: spacing.xs,
  },
  title: {
    color: colors.surface,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  description: {
    color: colors.surface,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    opacity: 0.9,
  },
  exerciseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  exerciseCountText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 