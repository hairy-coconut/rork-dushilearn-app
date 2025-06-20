import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LeaderboardEntry as LeaderboardEntryType } from '../utils/social';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

interface LeaderboardEntryProps {
    entry: LeaderboardEntryType;
    isCurrentUser?: boolean;
    index: number;
}

export default function LeaderboardEntry({ entry, isCurrentUser, index }: LeaderboardEntryProps) {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(0)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                delay: index * 100,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                delay: index * 100,
            }),
        ]).start();
    }, []);

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return ['#FFD700', '#FFA500']; // Gold
            case 2:
                return ['#C0C0C0', '#A9A9A9']; // Silver
            case 3:
                return ['#CD7F32', '#8B4513']; // Bronze
            default:
                return [theme.colors.primary, theme.colors.primaryDark];
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return 'trophy';
            case 2:
                return 'medal';
            case 3:
                return 'star';
            default:
                return 'numeric-' + rank;
        }
    };

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
            <LinearGradient
                colors={getRankColor(entry.rank)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <BlurView intensity={20} style={styles.blur}>
                    <View style={styles.content}>
                        <View style={styles.rankContainer}>
                            <MaterialCommunityIcons
                                name={getRankIcon(entry.rank)}
                                size={24}
                                color={theme.colors.text}
                            />
                            <Text style={[styles.rank, { color: theme.colors.text }]}>
                                #{entry.rank}
                            </Text>
                        </View>

                        <View style={styles.userInfo}>
                            <Text style={[styles.username, { color: theme.colors.text }]}>
                                {entry.user?.user_metadata?.username || 'Anonymous'}
                            </Text>
                            <Text style={[styles.xp, { color: theme.colors.textSecondary }]}>
                                {entry.xp} XP
                            </Text>
                        </View>

                        {isCurrentUser && (
                            <View style={styles.currentUserIndicator}>
                                <MaterialCommunityIcons
                                    name="account"
                                    size={20}
                                    color={theme.colors.primary}
                                />
                            </View>
                        )}
                    </View>
                </BlurView>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        borderRadius: 12,
    },
    blur: {
        overflow: 'hidden',
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    rankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    rank: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
    },
    xp: {
        fontSize: 14,
        marginTop: 2,
    },
    currentUserIndicator: {
        marginLeft: 8,
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
}); 