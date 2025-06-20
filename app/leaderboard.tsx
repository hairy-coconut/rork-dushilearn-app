import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Colors from '../constants/colors';
import { useUser } from '../contexts/AuthContext';
import {
    getGlobalLeaderboard,
    getFriendsLeaderboard,
    LeaderboardEntry,
} from '../utils/social';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'allTime';

const LeaderboardScreen = () => {
    const { theme } = useTheme();
    const { user } = useUser();
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('weekly');
    const [leaderboardType, setLeaderboardType] = useState<'global' | 'friends'>('global');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, [selectedTimeFrame, leaderboardType]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = leaderboardType === 'global'
                ? await getGlobalLeaderboard(selectedTimeFrame)
                : await getFriendsLeaderboard(user?.id || '', selectedTimeFrame);
            setLeaderboard(data);

            // Find user's rank
            const userEntry = data.find(entry => entry.user_id === user?.id);
            setUserRank(userEntry || null);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
        setLoading(false);
    };

    const handleTimeFrameSelect = (timeFrame: TimeFrame) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTimeFrame(timeFrame);
    };

    const handleLeaderboardTypeSelect = (type: 'global' | 'friends') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLeaderboardType(type);
    };

    const renderTopThree = () => {
        const topThree = leaderboard.slice(0, 3);
        return (
            <View style={styles.topThreeContainer}>
                {topThree.map((entry, index) => (
                    <Animated.View
                        key={entry.user_id}
                        style={[
                            styles.topThreeItem,
                            {
                                transform: [
                                    { translateY: index === 1 ? -20 : 0 },
                                    { scale: index === 1 ? 1.1 : 1 },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={
                                index === 0
                                    ? ['#FFD700', '#FFA500']
                                    : index === 1
                                    ? ['#C0C0C0', '#A9A9A9']
                                    : ['#CD7F32', '#8B4513']
                            }
                            style={styles.topThreeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.rankBadge}>
                                <Text style={styles.rankNumber}>{index + 1}</Text>
                            </View>
                            <Image
                                source={{ uri: entry.avatar_url || 'https://via.placeholder.com/100' }}
                                style={styles.topThreeAvatar}
                            />
                            <Text style={styles.topThreeUsername}>{entry.username}</Text>
                            <Text style={styles.topThreeScore}>{entry.score}</Text>
                        </LinearGradient>
                    </Animated.View>
                ))}
            </View>
        );
    };

    const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => {
        const isCurrentUser = entry.user_id === user?.id;
        return (
            <Animated.View
                key={entry.user_id}
                style={[
                    styles.leaderboardItem,
                    isCurrentUser && styles.currentUserItem,
                ]}
            >
                <LinearGradient
                    colors={isCurrentUser ? [Colors.primary, Colors.secondary] : ['#fff', '#f5f5f5']}
                    style={styles.leaderboardItemGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.rankContainer}>
                        <Text style={[
                            styles.rankText,
                            isCurrentUser && styles.currentUserText,
                        ]}>
                            #{index + 4}
                        </Text>
                    </View>
                    <Image
                        source={{ uri: entry.avatar_url || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={[
                            styles.username,
                            isCurrentUser && styles.currentUserText,
                        ]}>
                            {entry.username}
                        </Text>
                        <Text style={[
                            styles.level,
                            isCurrentUser && styles.currentUserText,
                        ]}>
                            Level {entry.level}
                        </Text>
                    </View>
                    <View style={styles.scoreContainer}>
                        <Text style={[
                            styles.score,
                            isCurrentUser && styles.currentUserText,
                        ]}>
                            {entry.score}
                        </Text>
                        <Text style={[
                            styles.scoreLabel,
                            isCurrentUser && styles.currentUserText,
                        ]}>
                            points
                        </Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={styles.leaderboardTypeContainer}>
                    <TouchableOpacity
                        style={[
                            styles.leaderboardTypeButton,
                            leaderboardType === 'global' && styles.selectedTypeButton,
                        ]}
                        onPress={() => handleLeaderboardTypeSelect('global')}
                    >
                        <MaterialCommunityIcons
                            name="earth"
                            size={20}
                            color={leaderboardType === 'global' ? '#fff' : Colors.primary}
                        />
                        <Text style={[
                            styles.leaderboardTypeText,
                            leaderboardType === 'global' && styles.selectedTypeText,
                        ]}>
                            Global
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.leaderboardTypeButton,
                            leaderboardType === 'friends' && styles.selectedTypeButton,
                        ]}
                        onPress={() => handleLeaderboardTypeSelect('friends')}
                    >
                        <MaterialCommunityIcons
                            name="account-group"
                            size={20}
                            color={leaderboardType === 'friends' ? '#fff' : Colors.primary}
                        />
                        <Text style={[
                            styles.leaderboardTypeText,
                            leaderboardType === 'friends' && styles.selectedTypeText,
                        ]}>
                            Friends
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeFrameContainer}
                contentContainerStyle={styles.timeFrameContent}
            >
                {(['daily', 'weekly', 'monthly', 'allTime'] as TimeFrame[]).map((timeFrame) => (
                    <TouchableOpacity
                        key={timeFrame}
                        style={[
                            styles.timeFrameButton,
                            selectedTimeFrame === timeFrame && styles.selectedTimeFrame,
                        ]}
                        onPress={() => handleTimeFrameSelect(timeFrame)}
                    >
                        <Text style={[
                            styles.timeFrameText,
                            selectedTimeFrame === timeFrame && styles.selectedTimeFrameText,
                        ]}>
                            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {renderTopThree()}

                <View style={styles.leaderboardList}>
                    {leaderboard.slice(3).map((entry, index) =>
                        renderLeaderboardItem(entry, index)
                    )}
                </View>

                {userRank && (
                    <View style={styles.userRankContainer}>
                        <Text style={styles.userRankTitle}>Your Rank</Text>
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            style={styles.userRankCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.userRankInfo}>
                                <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
                                <Text style={styles.userRankScore}>{userRank.score} points</Text>
                            </View>
                            <View style={styles.userRankProgress}>
                                <Text style={styles.userRankProgressText}>
                                    {Math.round((userRank.score / leaderboard[0].score) * 100)}% of #1
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    leaderboardTypeContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 4,
    },
    leaderboardTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    selectedTypeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    leaderboardTypeText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    selectedTypeText: {
        color: '#fff',
    },
    timeFrameContainer: {
        maxHeight: 50,
    },
    timeFrameContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    timeFrameButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 12,
    },
    selectedTimeFrame: {
        backgroundColor: Colors.primary,
    },
    timeFrameText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    selectedTimeFrameText: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    topThreeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    topThreeItem: {
        width: (width - 80) / 3,
        marginHorizontal: 5,
    },
    topThreeGradient: {
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    rankBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    rankNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    topThreeAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        borderWidth: 3,
        borderColor: '#fff',
    },
    topThreeUsername: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    topThreeScore: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    leaderboardList: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    leaderboardItem: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    currentUserItem: {
        elevation: 4,
        shadowOpacity: 0.2,
    },
    leaderboardItemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    level: {
        fontSize: 12,
        color: '#666',
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scoreLabel: {
        fontSize: 12,
        color: '#666',
    },
    currentUserText: {
        color: '#fff',
    },
    userRankContainer: {
        padding: 20,
        marginTop: 20,
    },
    userRankTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    userRankCard: {
        borderRadius: 12,
        padding: 16,
    },
    userRankInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userRankNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userRankScore: {
        fontSize: 18,
        color: '#fff',
    },
    userRankProgress: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 8,
    },
    userRankProgressText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
    },
});

export default LeaderboardScreen; 