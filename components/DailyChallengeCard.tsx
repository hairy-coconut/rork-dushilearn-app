import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface DailyChallengeCardProps {
    title: string;
    description: string;
    type: 'vocabulary' | 'grammar' | 'listening' | 'speaking';
    xpReward: number;
    streakBonus: number;
    timeRemaining: number;
    isCompleted: boolean;
    onPress: () => void;
}

export default function DailyChallengeCard({
    title,
    description,
    type,
    xpReward,
    streakBonus,
    timeRemaining,
    isCompleted,
    onPress,
}: DailyChallengeCardProps) {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const glowAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isCompleted) {
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
        }
    }, [isCompleted]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onPress();
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'vocabulary':
                return 'book-alphabet';
            case 'grammar':
                return 'book-open-variant';
            case 'listening':
                return 'ear-hearing';
            case 'speaking':
                return 'microphone';
            default:
                return 'star';
        }
    };

    const formatTimeRemaining = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.8],
                    }),
                },
            ]}
        >
            <TouchableOpacity
                style={styles.touchable}
                onPress={handlePress}
                activeOpacity={0.8}
                disabled={isCompleted}
            >
                <LinearGradient
                    colors={isCompleted ? ['#4CAF50', '#45A049'] : ['#FF9500', '#FF2D55']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <BlurView intensity={20} style={styles.blur}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <MaterialCommunityIcons
                                    name={getTypeIcon()}
                                    size={32}
                                    color="#FFFFFF"
                                />
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>{title}</Text>
                                    <Text style={styles.description}>
                                        {description}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.rewardsContainer}>
                                <View style={styles.rewardItem}>
                                    <MaterialCommunityIcons
                                        name="star"
                                        size={20}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.rewardText}>
                                        {xpReward} XP
                                    </Text>
                                </View>
                                <View style={styles.rewardItem}>
                                    <MaterialCommunityIcons
                                        name="fire"
                                        size={20}
                                        color="#FF9500"
                                    />
                                    <Text style={styles.rewardText}>
                                        +{streakBonus} Streak
                                    </Text>
                                </View>
                            </View>

                            {!isCompleted && (
                                <View style={styles.timeContainer}>
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={16}
                                        color="rgba(255, 255, 255, 0.8)"
                                    />
                                    <Text style={styles.timeText}>
                                        {formatTimeRemaining(timeRemaining)} remaining
                                    </Text>
                                </View>
                            )}

                            {isCompleted && (
                                <View style={styles.completedContainer}>
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.completedText}>
                                        Challenge Completed!
                                    </Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    touchable: {
        borderRadius: 16,
        overflow: 'hidden',
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    rewardsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    rewardText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    timeText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginLeft: 4,
    },
    completedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    completedText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 8,
    },
}); 