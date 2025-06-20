import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

interface StreakStats {
    currentStreak: number;
    longestStreak: number;
    totalDaysLearned: number;
    streakMultiplier: number;
    streakHistory: {
        date: string;
        completed: boolean;
    }[];
    nextMilestone: {
        days: number;
        reward: string;
    };
}

export default function StreakDetailsScreen() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StreakStats | null>(null);

    useEffect(() => {
        loadStreakStats();
    }, []);

    const loadStreakStats = async () => {
        try {
            const { data: streakData, error: streakError } = await supabase
                .from('user_streaks')
                .select('*')
                .single();

            if (streakError) throw streakError;

            const { data: historyData, error: historyError } = await supabase
                .from('streak_history')
                .select('*')
                .order('date', { ascending: false })
                .limit(30);

            if (historyError) throw historyError;

            const nextMilestone = getNextMilestone(streakData.current_streak);

            setStats({
                currentStreak: streakData.current_streak,
                longestStreak: streakData.longest_streak,
                totalDaysLearned: streakData.total_days_learned,
                streakMultiplier: calculateStreakMultiplier(streakData.current_streak),
                streakHistory: historyData.map((item: any) => ({
                    date: item.date,
                    completed: item.completed,
                })),
                nextMilestone,
            });
        } catch (error) {
            console.error('Error loading streak stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStreakMultiplier = (currentStreak: number) => {
        if (currentStreak >= 30) return 2.0;
        if (currentStreak >= 14) return 1.5;
        if (currentStreak >= 7) return 1.3;
        if (currentStreak >= 3) return 1.2;
        return 1.0;
    };

    const getNextMilestone = (currentStreak: number) => {
        const milestones = [3, 7, 14, 30, 50, 100];
        const next = milestones.find((m) => m > currentStreak) || 100;
        return {
            days: next,
            reward: `${calculateStreakMultiplier(next)}x XP Multiplier`,
        };
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!stats) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <Text style={[styles.errorText, { color: Colors.text }]}>
                    Failed to load streak statistics
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={Colors.text}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: Colors.text }]}>
                        Streak Details
                    </Text>
                </View>

                <View style={styles.statsContainer}>
                    <LinearGradient
                        colors={['#FF9500', '#FF2D55']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        <BlurView intensity={20} style={styles.blur}>
                            <View style={styles.statsContent}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{stats.currentStreak}</Text>
                                    <Text style={styles.statLabel}>Current Streak</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{stats.longestStreak}</Text>
                                    <Text style={styles.statLabel}>Longest Streak</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{stats.totalDaysLearned}</Text>
                                    <Text style={styles.statLabel}>Total Days</Text>
                                </View>
                            </View>
                        </BlurView>
                    </LinearGradient>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                        Current Bonus
                    </Text>
                    <View style={styles.bonusCard}>
                        <MaterialCommunityIcons
                            name="lightning-bolt"
                            size={32}
                            color="#FFD700"
                        />
                        <View style={styles.bonusInfo}>
                            <Text style={styles.bonusValue}>
                                {stats.streakMultiplier}x XP Multiplier
                            </Text>
                            <Text style={styles.bonusDescription}>
                                Keep your streak going to earn more XP!
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                        Next Milestone
                    </Text>
                    <View style={styles.milestoneCard}>
                        <View style={styles.milestoneInfo}>
                            <Text style={styles.milestoneValue}>
                                {stats.nextMilestone.days} Days
                            </Text>
                            <Text style={styles.milestoneReward}>
                                {stats.nextMilestone.reward}
                            </Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${(stats.currentStreak / stats.nextMilestone.days) * 100}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {stats.currentStreak}/{stats.nextMilestone.days} days
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                        Streak History
                    </Text>
                    <View style={styles.historyContainer}>
                        {stats.streakHistory.map((day, index) => (
                            <View key={day.date} style={styles.historyDay}>
                                <View
                                    style={[
                                        styles.historyDot,
                                        {
                                            backgroundColor: day.completed
                                                ? '#4CAF50'
                                                : '#666666',
                                        },
                                    ]}
                                />
                                {index < stats.streakHistory.length - 1 && (
                                    <View
                                        style={[
                                            styles.historyLine,
                                            {
                                                backgroundColor: day.completed
                                                    ? '#4CAF50'
                                                    : '#666666',
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsContainer: {
        margin: 16,
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
    statsContent: {
        flexDirection: 'row',
        padding: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    section: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    bonusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
    },
    bonusInfo: {
        marginLeft: 16,
        flex: 1,
    },
    bonusValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    bonusDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    milestoneCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
    },
    milestoneInfo: {
        marginBottom: 12,
    },
    milestoneValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    milestoneReward: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
        textAlign: 'right',
    },
    historyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    historyDay: {
        alignItems: 'center',
    },
    historyDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 4,
    },
    historyLine: {
        width: 2,
        height: 20,
        position: 'absolute',
        top: 12,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        margin: 20,
    },
}); 