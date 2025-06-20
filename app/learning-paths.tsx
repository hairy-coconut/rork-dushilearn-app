import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from './constants/colors';
import { router } from 'expo-router';
import { supabase } from '../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import LearningPathNode from '../components/LearningPathNode';
import LearningPathConnector from '../components/LearningPathConnector';
import StreakCard from '../components/StreakCard';
import AchievementCard from '../components/AchievementCard';

const { width } = Dimensions.get('window');
const NODE_SIZE = width * 0.25;

interface LearningModule {
    id: string;
    title: string;
    description: string;
    level: number;
    order: number;
    lessons: Lesson[];
    prerequisites: string[];
    xpReward: number;
}

interface Lesson {
    id: string;
    title: string;
    description: string;
    type: 'vocabulary' | 'grammar' | 'listening' | 'speaking';
    order: number;
    xpReward: number;
    prerequisites: string[];
    status: 'locked' | 'available' | 'completed';
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    total: number;
    isCompleted: boolean;
}

export default function LearningPathsScreen() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modules, setModules] = useState<LearningModule[]>([]);
    const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
    const [streak, setStreak] = useState({
        current: 0,
        longest: 0,
        multiplier: 1,
    });
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    useEffect(() => {
        loadLearningPaths();
        loadStreakAndAchievements();
    }, []);

    const loadLearningPaths = async () => {
        try {
            const { data: modulesData, error } = await supabase
                .from('learning_modules')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;

            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .order('order', { ascending: true });

            if (lessonsError) throw lessonsError;

            const { data: progressData, error: progressError } = await supabase
                .from('lesson_progress')
                .select('*');

            if (progressError) throw progressError;

            const modulesWithLessons = modulesData.map((module: any) => ({
                ...module,
                lessons: lessonsData
                    .filter((lesson: any) => lesson.module_id === module.id)
                    .map((lesson: any) => ({
                        ...lesson,
                        status: getLessonStatus(lesson, progressData),
                    })),
            }));

            setModules(modulesWithLessons);
            if (modulesWithLessons.length > 0) {
                setSelectedModule(modulesWithLessons[0]);
            }
        } catch (error) {
            console.error('Error loading learning paths:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadStreakAndAchievements = async () => {
        try {
            const { data: streakData, error: streakError } = await supabase
                .from('user_streaks')
                .select('*')
                .single();

            if (streakError) throw streakError;

            const { data: achievementsData, error: achievementsError } = await supabase
                .from('achievements')
                .select('*');

            if (achievementsError) throw achievementsError;

            setStreak({
                current: streakData.current_streak,
                longest: streakData.longest_streak,
                multiplier: calculateStreakMultiplier(streakData.current_streak),
            });

            setAchievements(achievementsData.map((achievement: any) => ({
                id: achievement.id,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                progress: achievement.progress,
                total: achievement.total,
                isCompleted: achievement.is_completed,
            })));
        } catch (error) {
            console.error('Error loading streak and achievements:', error);
        }
    };

    const calculateStreakMultiplier = (currentStreak: number) => {
        if (currentStreak >= 30) return 2.0;
        if (currentStreak >= 14) return 1.5;
        if (currentStreak >= 7) return 1.3;
        if (currentStreak >= 3) return 1.2;
        return 1.0;
    };

    const getLessonStatus = (lesson: any, progressData: any[]) => {
        const progress = progressData.find((p) => p.lesson_id === lesson.id);
        if (progress?.completed) return 'completed';
        if (isLessonAvailable(lesson, progressData)) return 'available';
        return 'locked';
    };

    const isLessonAvailable = (lesson: any, progressData: any[]) => {
        if (!lesson.prerequisites || lesson.prerequisites.length === 0) return true;
        return lesson.prerequisites.every((prereqId: string) =>
            progressData.some((p) => p.lesson_id === prereqId && p.completed)
        );
    };

    const handleModuleSelect = (module: LearningModule) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedModule(module);
    };

    const handleLessonPress = (lesson: Lesson) => {
        if (lesson.status === 'locked') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/lesson-preview',
            params: { id: lesson.id },
        });
    };

    const handleStreakPress = () => {
        router.push('/streak-details');
    };

    const handleAchievementPress = (achievement: Achievement) => {
        router.push({
            pathname: '/achievement-details',
            params: { id: achievement.id },
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadLearningPaths();
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: Colors.text }]}>
                        Learning Path
                    </Text>
                    <Text style={[styles.subtitle, { color: Colors.textLight }]}>
                        Master Papiamento at your own pace
                    </Text>
                </View>

                <StreakCard
                    currentStreak={streak.current}
                    longestStreak={streak.longest}
                    streakMultiplier={streak.multiplier}
                    onPress={handleStreakPress}
                />

                <View style={styles.achievementsContainer}>
                    <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                        Recent Achievements
                    </Text>
                    {achievements.slice(0, 3).map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            title={achievement.title}
                            description={achievement.description}
                            icon={achievement.icon}
                            progress={achievement.progress}
                            total={achievement.total}
                            isCompleted={achievement.isCompleted}
                            onPress={() => handleAchievementPress(achievement)}
                        />
                    ))}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modulesContainer}
                >
                    {modules.map((module) => (
                        <TouchableOpacity
                            key={module.id}
                            onPress={() => handleModuleSelect(module)}
                            style={[
                                styles.moduleTab,
                                selectedModule?.id === module.id && styles.selectedModuleTab,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.moduleTitle,
                                    { color: Colors.text },
                                    selectedModule?.id === module.id && {
                                        color: Colors.primary,
                                    },
                                ]}
                            >
                                {module.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {selectedModule && (
                    <View style={styles.moduleContent}>
                        <View style={styles.moduleHeader}>
                            <Text style={[styles.moduleHeaderTitle, { color: Colors.text }]}>
                                {selectedModule.title}
                            </Text>
                            <Text
                                style={[
                                    styles.moduleHeaderDescription,
                                    { color: Colors.textLight },
                                ]}
                            >
                                {selectedModule.description}
                            </Text>
                        </View>

                        <View style={styles.lessonsContainer}>
                            {selectedModule.lessons.map((lesson, index) => (
                                <View key={lesson.id} style={styles.lessonRow}>
                                    <LearningPathNode
                                        title={lesson.title}
                                        type={lesson.type}
                                        status={lesson.status}
                                        xp={lesson.xpReward}
                                        onPress={() => handleLessonPress(lesson)}
                                        isActive={lesson.status === 'available'}
                                        index={index}
                                    />
                                    <LearningPathConnector
                                        status={lesson.status}
                                        isLast={index === selectedModule.lessons.length - 1}
                                        index={index}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )}
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
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    modulesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    moduleTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedModuleTab: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    moduleContent: {
        padding: 20,
    },
    moduleHeader: {
        marginBottom: 20,
    },
    moduleHeaderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    moduleHeaderDescription: {
        fontSize: 16,
        lineHeight: 24,
    },
    lessonsContainer: {
        marginTop: 20,
    },
    lessonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    achievementsContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginBottom: 8,
    },
}); 