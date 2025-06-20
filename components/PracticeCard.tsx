import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface PracticeCardProps {
    title: string;
    type: 'vocabulary' | 'grammar' | 'listening' | 'speaking';
    difficulty: 'easy' | 'medium' | 'hard';
    nextReview: Date;
    masteryLevel: number;
    onPress: () => void;
}

export default function PracticeCard({
    title,
    type,
    difficulty,
    nextReview,
    masteryLevel,
    onPress,
}: PracticeCardProps) {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const glowAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (masteryLevel < 100) {
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
    }, [masteryLevel]);

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

    const getDifficultyColor = () => {
        switch (difficulty) {
            case 'easy':
                return ['#4CAF50', '#45A049'];
            case 'medium':
                return ['#FF9500', '#FF2D55'];
            case 'hard':
                return ['#FF2D55', '#FF3B30'];
            default:
                return ['#4CAF50', '#45A049'];
        }
    };

    const formatNextReview = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getMasteryIcon = () => {
        if (masteryLevel >= 100) return 'star-circle';
        if (masteryLevel >= 75) return 'star-circle-outline';
        if (masteryLevel >= 50) return 'star-half-full';
        if (masteryLevel >= 25) return 'star-outline';
        return 'star-off-outline';
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
            >
                <LinearGradient
                    colors={getDifficultyColor()}
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
                                    <Text style={styles.difficulty}>
                                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoContainer}>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons
                                        name={getMasteryIcon()}
                                        size={20}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.infoText}>
                                        {masteryLevel}% Mastery
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={20}
                                        color="rgba(255, 255, 255, 0.8)"
                                    />
                                    <Text style={styles.infoText}>
                                        Review in {formatNextReview(nextReview)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <Animated.View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${masteryLevel}%`,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {masteryLevel}% Complete
                                </Text>
                            </View>
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
    difficulty: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 8,
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
        textAlign: 'right',
    },
}); 