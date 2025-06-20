import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { DailyReward } from '../utils/dailyRewards';

interface DailyRewardCardProps {
    reward: DailyReward;
    streakMultiplier: number;
    onClaim: () => void;
    isNext?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

export function DailyRewardCard({
    reward,
    streakMultiplier,
    onClaim,
    isNext = false,
}: DailyRewardCardProps) {
    const theme = useTheme();
    const scaleAnim = new Animated.Value(1);
    const opacityAnim = new Animated.Value(1);
    const glowAnim = new Animated.Value(0);

    useEffect(() => {
        if (isNext) {
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
    }, [isNext]);

    const handlePress = async () => {
        if (reward.claimed || !isNext) return;

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
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

        onClaim();
    };

    const getRewardIcon = () => {
        if (reward.specialReward) {
            return reward.specialReward.icon;
        }

        switch (reward.type) {
            case 'xp':
                return 'star';
            case 'hearts':
                return 'heart';
            case 'streak_freeze':
                return 'snowflake';
            case 'gem':
                return 'diamond-stone';
            default:
                return 'gift';
        }
    };

    const getRewardColor = () => {
        if (reward.specialReward) {
            return ['#FFD700', '#FFA500'];
        }

        switch (reward.type) {
            case 'xp':
                return ['#4CAF50', '#2E7D32'];
            case 'hearts':
                return ['#F44336', '#C62828'];
            case 'streak_freeze':
                return ['#2196F3', '#1565C0'];
            case 'gem':
                return ['#9C27B0', '#6A1B9A'];
            default:
                return ['#757575', '#424242'];
        }
    };

    const getRewardTitle = () => {
        if (reward.specialReward) {
            return reward.specialReward.title;
        }

        switch (reward.type) {
            case 'xp':
                return `${reward.amount} XP`;
            case 'hearts':
                return `${reward.amount} Heart${reward.amount > 1 ? 's' : ''}`;
            case 'streak_freeze':
                return 'Streak Freeze';
            case 'gem':
                return `${reward.amount} Gems`;
            default:
                return 'Reward';
        }
    };

    const getRewardDescription = () => {
        if (reward.specialReward) {
            return reward.specialReward.description;
        }

        return `Day ${reward.streakDay} Reward`;
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <TouchableOpacity
                onPress={handlePress}
                disabled={reward.claimed || !isNext}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={getRewardColor()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {isNext && (
                        <Animated.View
                            style={[
                                styles.glow,
                                {
                                    opacity: glowOpacity,
                                    backgroundColor: getRewardColor()[0],
                                },
                            ]}
                        />
                    )}
                    <BlurView intensity={20} style={styles.content}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name={getRewardIcon()}
                                size={32}
                                color="#FFFFFF"
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{getRewardTitle()}</Text>
                            <Text style={styles.description}>
                                {getRewardDescription()}
                            </Text>
                            {streakMultiplier > 1 && (
                                <View style={styles.multiplierContainer}>
                                    <MaterialCommunityIcons
                                        name="lightning-bolt"
                                        size={16}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.multiplier}>
                                        {streakMultiplier}x
                                    </Text>
                                </View>
                            )}
                        </View>
                        {reward.claimed ? (
                            <View style={styles.claimedContainer}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={24}
                                    color="#4CAF50"
                                />
                            </View>
                        ) : (
                            isNext && (
                                <View style={styles.claimContainer}>
                                    <MaterialCommunityIcons
                                        name="gift-open"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </View>
                            )
                        )}
                    </BlurView>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: 120,
        marginHorizontal: 10,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        flex: 1,
        padding: 2,
    },
    glow: {
        position: 'absolute',
        top: -50,
        left: -50,
        right: -50,
        bottom: -50,
        borderRadius: 100,
        opacity: 0.3,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
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
    multiplierContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    multiplier: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFD700',
        marginLeft: 4,
    },
    claimedContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    claimContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 