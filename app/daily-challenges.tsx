import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    type: 'vocabulary' | 'grammar' | 'listening' | 'speaking';
    xpReward: number;
    streakBonus: number;
    timeRemaining: number;
    isCompleted: boolean;
}

export default function DailyChallengesScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
    const [streakInfo, setStreakInfo] = useState({
        currentStreak: 0,
        longestStreak: 0,
        streakMultiplier: 1,
    });
    const headerAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadData();
        animateHeader();
    }, []);

    const animateHeader = () => {
        Animated.spring(headerAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    };

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadChallenges(),
                loadStreakInfo(),
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadChallenges = async () => {
        const { data: challengesData, error } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedChallenges = challengesData.map(challenge => ({
            ...challenge,
            timeRemaining: calculateTimeRemaining(challenge.expires_at),
        }));

        setChallenges(formattedChallenges);
    };

    const loadStreakInfo = async () => {
        const { data: streakData, error } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user?.id)
            .single();

        if (error) throw error;

        setStreakInfo({
            currentStreak: streakData.current_streak,
            longestStreak: streakData.longest_streak,
            streakMultiplier: calculateStreakMultiplier(streakData.current_streak),
        });
    };

    const calculateTimeRemaining = (expiresAt: string) => {
        const now = new Date().getTime();
        const expires = new Date(expiresAt).getTime();
        return Math.max(0, Math.floor((expires - now) / 1000));
    };

    const calculateStreakMultiplier = (streak: number) => {
        if (streak >= 30) return 2.0;
        if (streak >= 14) return 1.5;
        if (streak >= 7) return 1.3;
        if (streak >= 3) return 1.2;
        return 1.0;
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleChallengePress = async (challenge: DailyChallenge) => {
        if (challenge.isCompleted) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Navigate to challenge screen
        // router.push(`/challenge/${challenge.id}`);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-100, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#FF9500', '#FF2D55']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <BlurView intensity={20} style={styles.headerBlur}>
                        <View style={styles.streakInfo}>
                            <View style={styles.streakItem}>
                                <MaterialCommunityIcons
                                    name="fire"
                                    size={24}
                                    color="#FF9500"
                                />
                                <Text style={styles.streakText}>
                                    {streakInfo.currentStreak} Day Streak
                                </Text>
                            </View>
                            <View style={styles.streakItem}>
                                <MaterialCommunityIcons
                                    name="trophy"
                                    size={24}
                                    color="#FFD700"
                                />
                                <Text style={styles.streakText}>
                                    Best: {streakInfo.longestStreak} Days
                                </Text>
                            </View>
                            <View style={styles.streakItem}>
                                <MaterialCommunityIcons
                                    name="star"
                                    size={24}
                                    color="#FFD700"
                                />
                                <Text style={styles.streakText}>
                                    {streakInfo.streakMultiplier}x Multiplier
                                </Text>
                            </View>
                        </View>
                    </BlurView>
                </LinearGradient>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                <Text style={styles.sectionTitle}>Daily Challenges</Text>
                {challenges.map((challenge) => (
                    <DailyChallengeCard
                        key={challenge.id}
                        {...challenge}
                        onPress={() => handleChallengePress(challenge)}
                    />
                ))}

                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips for Success</Text>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons
                            name="lightbulb"
                            size={20}
                            color={Colors.primary}
                        />
                        <Text style={styles.tipText}>
                            Complete challenges early to maximize your streak bonus
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons
                            name="clock-fast"
                            size={20}
                            color={Colors.primary}
                        />
                        <Text style={styles.tipText}>
                            Challenges refresh every 24 hours
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons
                            name="star"
                            size={20}
                            color={Colors.primary}
                        />
                        <Text style={styles.tipText}>
                            Longer streaks give you higher XP multipliers
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 120,
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    headerGradient: {
        flex: 1,
    },
    headerBlur: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-end',
    },
    streakInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    streakItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 8,
    },
    streakText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        marginTop: 120,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16,
        color: '#333',
    },
    tipsContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
}); 