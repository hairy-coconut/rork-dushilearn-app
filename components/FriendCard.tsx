import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface FriendCardProps {
    id: string;
    name: string;
    avatar: string;
    streak: number;
    xp: number;
    level: number;
    isOnline: boolean;
    lastActive: Date;
    onPress: () => void;
    onChallenge: () => void;
}

export default function FriendCard({
    id,
    name,
    avatar,
    streak,
    xp,
    level,
    isOnline,
    lastActive,
    onPress,
    onChallenge,
}: FriendCardProps) {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

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

    const handleChallenge = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onChallenge();
    };

    const formatLastActive = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.touchable}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#4CAF50', '#45A049']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <BlurView intensity={20} style={styles.blur}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={{ uri: avatar }}
                                        style={styles.avatar}
                                    />
                                    {isOnline && (
                                        <View style={styles.onlineIndicator} />
                                    )}
                                </View>
                                <View style={styles.nameContainer}>
                                    <Text style={styles.name}>{name}</Text>
                                    <Text style={styles.lastActive}>
                                        {isOnline ? 'Online' : formatLastActive(lastActive)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.challengeButton}
                                    onPress={handleChallenge}
                                >
                                    <MaterialCommunityIcons
                                        name="trophy"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <MaterialCommunityIcons
                                        name="fire"
                                        size={20}
                                        color="#FF9500"
                                    />
                                    <Text style={styles.statText}>
                                        {streak} Day Streak
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <MaterialCommunityIcons
                                        name="star"
                                        size={20}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.statText}>
                                        {xp} XP
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <MaterialCommunityIcons
                                        name="trophy"
                                        size={20}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.statText}>
                                        Level {level}
                                    </Text>
                                </View>
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
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContainer: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    lastActive: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    challengeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 8,
    },
    statText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 8,
    },
}); 