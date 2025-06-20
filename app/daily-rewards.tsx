import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Carousel from 'react-native-snap-carousel';
import { WebCarousel } from '../components/WebCarousel';
import { useAuth } from '../contexts/AuthContext';
import { DailyRewardCard } from '../components/DailyRewardCard';
import {
    getDailyRewards,
    getRewardProgress,
    claimDailyReward,
    generateNextRewards,
    DailyReward,
    RewardProgress,
} from '../utils/dailyRewards';

const { width: screenWidth } = Dimensions.get('window');

export default function DailyRewardsScreen() {
    const theme = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [rewards, setRewards] = useState<DailyReward[]>([]);
    const [progress, setProgress] = useState<RewardProgress | null>(null);
    const [carouselRef, setCarouselRef] = useState<Carousel<DailyReward> | null>(null);

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            setLoading(true);
            const [rewardsData, progressData] = await Promise.all([
                getDailyRewards(user!.id),
                getRewardProgress(user!.id),
            ]);
            setRewards(rewardsData);
            setProgress(progressData);

            // Generate next rewards if needed
            if (rewardsData.length < 7) {
                await generateNextRewards(user!.id);
                const updatedRewards = await getDailyRewards(user!.id);
                setRewards(updatedRewards);
            }
        } catch (error) {
            console.error('Error loading rewards:', error);
            Alert.alert('Error', 'Failed to load daily rewards');
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async (reward: DailyReward) => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            const result = await claimDailyReward(user!.id, reward.id);
            
            if (result.success) {
                // Update rewards and progress
                const [updatedRewards, updatedProgress] = await Promise.all([
                    getDailyRewards(user!.id),
                    getRewardProgress(user!.id),
                ]);
                setRewards(updatedRewards);
                setProgress(updatedProgress);

                // Show success message
                Alert.alert(
                    'Reward Claimed!',
                    `You received ${result.reward.amount} ${result.reward.type.toUpperCase()}${
                        result.bonusXp ? ` + ${result.bonusXp} bonus XP` : ''
                    }`
                );
            }
        } catch (error) {
            console.error('Error claiming reward:', error);
            Alert.alert('Error', 'Failed to claim reward');
        }
    };

    const renderRewardCard = ({ item, index }: { item: DailyReward; index: number }) => {
        const isNext = !item.claimed && index === rewards.findIndex(r => !r.claimed);
        return (
            <DailyRewardCard
                reward={item}
                streakMultiplier={progress?.streakMultiplier || 1}
                onClaim={() => handleClaimReward(item)}
                isNext={isNext}
            />
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={styles.header}
            >
                <BlurView intensity={20} style={styles.headerContent}>
                    <View style={styles.streakContainer}>
                        <MaterialCommunityIcons
                            name="fire"
                            size={32}
                            color="#FFD700"
                        />
                        <Text style={styles.streakText}>
                            {progress?.currentStreak || 0} Day Streak
                        </Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {progress?.longestStreak || 0}
                            </Text>
                            <Text style={styles.statLabel}>Longest</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {progress?.totalRewardsClaimed || 0}
                            </Text>
                            <Text style={styles.statLabel}>Claimed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {progress?.streakMultiplier || 1}x
                            </Text>
                            <Text style={styles.statLabel}>Multiplier</Text>
                        </View>
                    </View>
                </BlurView>
            </LinearGradient>

            <View style={styles.carouselContainer}>
                {Platform.OS === 'web' ? (
                    <WebCarousel
                        data={rewards}
                        renderItem={renderRewardCard}
                        itemWidth={screenWidth * 0.8}
                    />
                ) : (
                    <Carousel
                        ref={ref => setCarouselRef(ref)}
                        data={rewards}
                        renderItem={renderRewardCard}
                        sliderWidth={screenWidth}
                        itemWidth={screenWidth * 0.8}
                        inactiveSlideScale={0.9}
                        inactiveSlideOpacity={0.7}
                        enableMomentum={true}
                        activeSlideAlignment="center"
                        containerCustomStyle={styles.carousel}
                    />
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Daily Rewards</Text>
                <Text style={styles.infoText}>
                    Claim your daily reward to maintain your streak and earn bonus XP!
                    The longer your streak, the bigger your rewards.
                </Text>
                <View style={styles.multiplierInfo}>
                    <MaterialCommunityIcons
                        name="lightning-bolt"
                        size={20}
                        color="#FFD700"
                    />
                    <Text style={styles.multiplierText}>
                        Streak multipliers: 3 days (1.5x), 7 days (2x), 14 days (2.5x), 30 days (3x)
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 200,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerContent: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    streakText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    carouselContainer: {
        marginTop: -50,
        paddingBottom: 20,
    },
    carousel: {
        paddingTop: 20,
    },
    infoContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        margin: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    multiplierInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: '#FFF9E6',
        padding: 10,
        borderRadius: 8,
    },
    multiplierText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
}); 