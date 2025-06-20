import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface StreakCardProps {
    currentStreak: number;
    longestStreak: number;
    streakMultiplier: number;
    onPress?: () => void;
}

export default function StreakCard({
    currentStreak,
    longestStreak,
    streakMultiplier,
    onPress,
}: StreakCardProps) {
    const { theme } = useTheme();

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#FF9500', '#FF2D55']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <BlurView intensity={20} style={styles.blur}>
                    <View style={styles.content}>
                        <View style={styles.streakInfo}>
                            <MaterialCommunityIcons
                                name="fire"
                                size={32}
                                color="#FF9500"
                            />
                            <View style={styles.streakText}>
                                <Text style={styles.currentStreak}>
                                    {currentStreak} Day Streak
                                </Text>
                                <Text style={styles.longestStreak}>
                                    Longest: {longestStreak} days
                                </Text>
                            </View>
                        </View>
                        <View style={styles.multiplierContainer}>
                            <Text style={styles.multiplierLabel}>XP Multiplier</Text>
                            <Text style={styles.multiplierValue}>
                                {streakMultiplier}x
                            </Text>
                        </View>
                    </View>
                </BlurView>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginVertical: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    gradient: {
        borderRadius: 16,
    },
    blur: {
        overflow: 'hidden',
        borderRadius: 16,
    },
    content: {
        padding: 16,
    },
    streakInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    streakText: {
        marginLeft: 12,
    },
    currentStreak: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    longestStreak: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    multiplierContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    multiplierLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    multiplierValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
}); 