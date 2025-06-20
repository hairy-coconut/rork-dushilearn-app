import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, shadows } from '../theme';

const TABS = [
  { key: 'Home', label: 'Home', icon: 'home', emoji: '🏠' },
  { key: 'Lessons', label: 'Lessons', icon: 'book-open-variant', emoji: '📘' },
  { key: 'Progress', label: 'Progress', icon: 'chart-bar', emoji: '📊' },
  { key: 'Profile', label: 'Profile', icon: 'account-circle', emoji: '👤' },
  { key: 'Pricing', label: 'Pricing', icon: 'currency-usd', emoji: '💰' },
  { key: 'Landing', label: 'Landing', icon: 'rocket-launch', emoji: '🚀' },
];

interface BottomNavBarProps {
  currentTab: string;
  onTabPress: (tabKey: string) => void;
}

export default function BottomNavBar({ currentTab, onTabPress }: BottomNavBarProps) {
  const bounceAnim = useRef(TABS.map(() => new Animated.Value(1))).current;

  const handlePress = (idx: number, tabKey: string) => {
    Animated.sequence([
      Animated.spring(bounceAnim[idx], {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim[idx], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    onTabPress(tabKey);
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab, idx) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handlePress(idx, tab.key)}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: bounceAnim[idx] }] }}>
              <MaterialCommunityIcons
                name={tab.icon}
                size={28}
                color={isActive ? colors.aqua : colors.text.secondary}
              />
              <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.emoji}</Text>
            </Animated.View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.base,
    paddingTop: spacing.sm,
    ...shadows.base,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.aqua,
    fontWeight: 'bold',
  },
}); 