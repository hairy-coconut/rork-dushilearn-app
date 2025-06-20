import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { DailyReward } from '../utils/dailyRewards';

interface RewardHistoryListProps {
    rewards: DailyReward[];
    onRewardPress?: (reward: DailyReward) => void;
}

type FilterType = 'all' | 'xp' | 'hearts' | 'gems' | 'special';

export function RewardHistoryList({
    rewards,
    onRewardPress,
}: RewardHistoryListProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [scrollY] = useState(new Animated.Value(0));

    const handleFilterPress = async (newFilter: FilterType) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilter(newFilter);
    };

    const filteredRewards = rewards.filter(reward => {
        if (filter === 'all') return true;
        if (filter === 'special') return !!reward.specialReward;
        return reward.type === filter;
    });

    const renderFilterButton = (type: FilterType, icon: string, label: string) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filter === type && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterPress(type)}
        >
            <MaterialCommunityIcons
                name={icon}
                size={20}
                color={filter === type ? '#FFFFFF' : '#666666'}
            />
            <Text
                style={[
                    styles.filterButtonText,
                    filter === type && styles.filterButtonTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderRewardItem = ({ item, index }: { item: DailyReward; index: number }) => {
        const translateY = scrollY.interpolate({
            inputRange: [-1, 0, 100 * index, 100 * (index + 2)],
            outputRange: [0, 0, 0, 100],
        });

        const opacity = scrollY.interpolate({
            inputRange: [-1, 0, 100 * index, 100 * (index + 2)],
            outputRange: [1, 1, 1, 0],
        });

        return (
            <Animated.View
                style={[
                    styles.rewardItem,
                    {
                        transform: [{ translateY }],
                        opacity,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => onRewardPress?.(item)}
                    style={styles.rewardItemContent}
                >
                    <LinearGradient
                        colors={getRewardColors(item)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.rewardGradient}
                    >
                        <BlurView intensity={20} style={styles.rewardBlur}>
                            <View style={styles.rewardIconContainer}>
                                <MaterialCommunityIcons
                                    name={getRewardIcon(item)}
                                    size={24}
                                    color="#FFFFFF"
                                />
                            </View>
                            <View style={styles.rewardInfo}>
                                <Text style={styles.rewardTitle}>
                                    {getRewardTitle(item)}
                                </Text>
                                <Text style={styles.rewardDate}>
                                    {formatDate(item.claimDate)}
                                </Text>
                            </View>
                            {item.specialReward && (
                                <View style={styles.specialBadge}>
                                    <MaterialCommunityIcons
                                        name="crown"
                                        size={16}
                                        color="#FFD700"
                                    />
                                </View>
                            )}
                        </BlurView>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const getRewardIcon = (reward: DailyReward) => {
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

    const getRewardColors = (reward: DailyReward) => {
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

    const getRewardTitle = (reward: DailyReward) => {
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

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                {renderFilterButton('all', 'gift', 'All')}
                {renderFilterButton('xp', 'star', 'XP')}
                {renderFilterButton('hearts', 'heart', 'Hearts')}
                {renderFilterButton('gems', 'diamond-stone', 'Gems')}
                {renderFilterButton('special', 'crown', 'Special')}
            </View>
            <Animated.FlatList
                data={filteredRewards}
                renderItem={renderRewardItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    filterButtonActive: {
        backgroundColor: '#4A90E2',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#666666',
        marginLeft: 4,
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 10,
    },
    rewardItem: {
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    rewardItemContent: {
        height: 80,
    },
    rewardGradient: {
        flex: 1,
        padding: 2,
    },
    rewardBlur: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    rewardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rewardInfo: {
        flex: 1,
    },
    rewardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    rewardDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    specialBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
}); 