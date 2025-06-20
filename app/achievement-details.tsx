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
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    total: number;
    isCompleted: boolean;
    reward: {
        type: 'xp' | 'badge' | 'streak_freeze';
        value: number;
    };
    requirements: {
        type: string;
        description: string;
        progress: number;
        total: number;
    }[];
    unlockedAt?: string;
}

export default function AchievementDetailsScreen() {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [achievement, setAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        loadAchievementDetails();
    }, [id]);

    const loadAchievementDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setAchievement({
                id: data.id,
                title: data.title,
                description: data.description,
                icon: data.icon,
                progress: data.progress,
                total: data.total,
                isCompleted: data.is_completed,
                reward: data.reward,
                requirements: data.requirements,
                unlockedAt: data.unlocked_at,
            });
        } catch (error) {
            console.error('Error loading achievement details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!achievement) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.text }]}>
                    Failed to load achievement details
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Achievement Details
                    </Text>
                </View>

                <View style={styles.achievementContainer}>
                    <LinearGradient
                        colors={achievement.isCompleted ? ['#4CAF50', '#45A049'] : ['#2C2C2C', '#1C1C1C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        <BlurView intensity={20} style={styles.blur}>
                            <View style={styles.achievementContent}>
                                <MaterialCommunityIcons
                                    name={achievement.icon}
                                    size={64}
                                    color={achievement.isCompleted ? '#4CAF50' : theme.colors.primary}
                                />
                                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                                <Text style={styles.achievementDescription}>
                                    {achievement.description}
                                </Text>
                            </View>
                        </BlurView>
                    </LinearGradient>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Progress
                    </Text>
                    <View style={styles.progressCard}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(achievement.progress / achievement.total) * 100}%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {achievement.progress}/{achievement.total}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Requirements
                    </Text>
                    {achievement.requirements.map((req, index) => (
                        <View key={index} style={styles.requirementCard}>
                            <View style={styles.requirementHeader}>
                                <MaterialCommunityIcons
                                    name={getRequirementIcon(req.type)}
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.requirementTitle}>
                                    {req.description}
                                </Text>
                            </View>
                            <View style={styles.requirementProgress}>
                                <View style={styles.requirementBar}>
                                    <View
                                        style={[
                                            styles.requirementFill,
                                            {
                                                width: `${(req.progress / req.total) * 100}%`,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.requirementText}>
                                    {req.progress}/{req.total}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Reward
                    </Text>
                    <View style={styles.rewardCard}>
                        <MaterialCommunityIcons
                            name={getRewardIcon(achievement.reward.type)}
                            size={32}
                            color="#FFD700"
                        />
                        <View style={styles.rewardInfo}>
                            <Text style={styles.rewardValue}>
                                {formatReward(achievement.reward)}
                            </Text>
                            <Text style={styles.rewardDescription}>
                                {getRewardDescription(achievement.reward)}
                            </Text>
                        </View>
                    </View>
                </View>

                {achievement.unlockedAt && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Unlocked
                        </Text>
                        <Text style={styles.unlockedText}>
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const getRequirementIcon = (type: string) => {
    switch (type) {
        case 'lessons':
            return 'book-open-variant';
        case 'streak':
            return 'fire';
        case 'xp':
            return 'star';
        default:
            return 'check-circle';
    }
};

const getRewardIcon = (type: string) => {
    switch (type) {
        case 'xp':
            return 'star';
        case 'badge':
            return 'medal';
        case 'streak_freeze':
            return 'snowflake';
        default:
            return 'gift';
    }
};

const formatReward = (reward: { type: string; value: number }) => {
    switch (reward.type) {
        case 'xp':
            return `${reward.value} XP`;
        case 'badge':
            return 'Special Badge';
        case 'streak_freeze':
            return 'Streak Freeze';
        default:
            return 'Unknown Reward';
    }
};

const getRewardDescription = (reward: { type: string; value: number }) => {
    switch (reward.type) {
        case 'xp':
            return 'Earn extra experience points';
        case 'badge':
            return 'Unlock a special achievement badge';
        case 'streak_freeze':
            return 'Protect your streak for one day';
        default:
            return 'Complete the achievement to claim your reward';
    }
};

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
    achievementContainer: {
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
    achievementContent: {
        padding: 24,
        alignItems: 'center',
    },
    achievementTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    achievementDescription: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    section: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    progressCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    progressText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right',
    },
    requirementCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    requirementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    requirementTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        marginLeft: 12,
        flex: 1,
    },
    requirementProgress: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requirementBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        marginRight: 8,
    },
    requirementFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    requirementText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        minWidth: 40,
        textAlign: 'right',
    },
    rewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
    },
    rewardInfo: {
        marginLeft: 16,
        flex: 1,
    },
    rewardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    rewardDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    unlockedText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        margin: 20,
    },
}); 