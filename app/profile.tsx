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
import Colors from './constants/colors';
import { useUser } from '../contexts/AuthContext';
import {
    getUserProfile,
    getAchievements,
    UserProfile,
    Achievement,
} from '../utils/social';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const { theme } = useTheme();
    const { user } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'stats'>('overview');

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        setLoading(true);
        try {
            const [profileData, achievementsData] = await Promise.all([
                getUserProfile(user?.id || ''),
                getAchievements(user?.id || ''),
            ]);
            setProfile(profileData);
            setAchievements(achievementsData);
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
        setLoading(false);
    };

    const handleTabSelect = (tab: 'overview' | 'achievements' | 'stats') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTab(tab);
    };

    const renderProfileOverview = () => (
        <View style={styles.overviewContainer}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.profileCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Image
                    source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/100' }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>{profile?.username}</Text>
                <Text style={styles.level}>Level {profile?.level}</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="star"
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.statValue}>{profile?.xp}</Text>
                        <Text style={styles.statLabel}>XP</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="fire"
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.statValue}>{profile?.streak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="crown"
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.statValue}>{profile?.achievements.length}</Text>
                        <Text style={styles.statLabel}>Achievements</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Level Progress</Text>
                <View style={styles.progressBar}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.secondary]}
                        style={[
                            styles.progressFill,
                            { width: `${(profile?.xp || 0) % 1000 / 10}%` },
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </View>
                <Text style={styles.progressText}>
                    {profile?.xp % 1000} / 1000 XP to next level
                </Text>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={20}
                        color={Colors.primary}
                    />
                    <Text style={styles.infoText}>{profile?.country}</Text>
                </View>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                        name="translate"
                        size={20}
                        color={Colors.primary}
                    />
                    <Text style={styles.infoText}>{profile?.language}</Text>
                </View>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                        name="calendar"
                        size={20}
                        color={Colors.primary}
                    />
                    <Text style={styles.infoText}>
                        Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderAchievements = () => (
        <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
                <Animated.View
                    key={achievement.id}
                    style={styles.achievementCard}
                >
                    <LinearGradient
                        colors={achievement.isUnlocked ? [Colors.primary, Colors.secondary] : ['#fff', '#f5f5f5']}
                        style={styles.achievementCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.achievementIcon}>
                            <MaterialCommunityIcons
                                name={achievement.icon}
                                size={32}
                                color={achievement.isUnlocked ? '#fff' : Colors.primary}
                            />
                        </View>
                        <View style={styles.achievementInfo}>
                            <Text style={[
                                styles.achievementTitle,
                                achievement.isUnlocked && styles.achievementTitleUnlocked,
                            ]}>
                                {achievement.title}
                            </Text>
                            <Text style={[
                                styles.achievementDescription,
                                achievement.isUnlocked && styles.achievementDescriptionUnlocked,
                            ]}>
                                {achievement.description}
                            </Text>
                            {!achievement.isUnlocked && (
                                <View style={styles.progressBar}>
                                    <LinearGradient
                                        colors={[Colors.primary, Colors.secondary]}
                                        style={[
                                            styles.progressFill,
                                            { width: `${achievement.progress}%` },
                                        ]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    />
                                </View>
                            )}
                        </View>
                        {achievement.isUnlocked && (
                            <View style={styles.rewardBadge}>
                                <MaterialCommunityIcons
                                    name="gift"
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.rewardText}>
                                    {achievement.reward.xp} XP
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>
            ))}
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statCardTitle}>Learning Stats</Text>
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="book-open"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={styles.statValue}>{profile?.lessons_completed || 0}</Text>
                        <Text style={styles.statLabel}>Lessons</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="clock"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={styles.statValue}>{profile?.total_study_time || 0}</Text>
                        <Text style={styles.statLabel}>Hours</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statCardTitle}>Achievement Stats</Text>
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="trophy"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={styles.statValue}>{profile?.achievements.length || 0}</Text>
                        <Text style={styles.statLabel}>Unlocked</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="star"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={styles.statValue}>{profile?.total_xp || 0}</Text>
                        <Text style={styles.statLabel}>Total XP</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statCardTitle}>Social Stats</Text>
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="account-group"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={styles.statValue}>{profile?.friends.length || 0}</Text>
                        <Text style={styles.statLabel}>Friends</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="crown"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={styles.statValue}>{profile?.rank || 0}</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'overview' && styles.selectedTabButton,
                        ]}
                        onPress={() => handleTabSelect('overview')}
                    >
                        <MaterialCommunityIcons
                            name="account"
                            size={20}
                            color={selectedTab === 'overview' ? '#fff' : Colors.primary}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === 'overview' && styles.selectedTabText,
                        ]}>
                            Overview
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'achievements' && styles.selectedTabButton,
                        ]}
                        onPress={() => handleTabSelect('achievements')}
                    >
                        <MaterialCommunityIcons
                            name="trophy"
                            size={20}
                            color={selectedTab === 'achievements' ? '#fff' : Colors.primary}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === 'achievements' && styles.selectedTabText,
                        ]}>
                            Achievements
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'stats' && styles.selectedTabButton,
                        ]}
                        onPress={() => handleTabSelect('stats')}
                    >
                        <MaterialCommunityIcons
                            name="chart-bar"
                            size={20}
                            color={selectedTab === 'stats' ? '#fff' : Colors.primary}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === 'stats' && styles.selectedTabText,
                        ]}>
                            Stats
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {selectedTab === 'overview' && renderProfileOverview()}
                {selectedTab === 'achievements' && renderAchievements()}
                {selectedTab === 'stats' && renderStats()}
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    selectedTabButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    tabText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    selectedTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    overviewContainer: {
        padding: 20,
    },
    profileCard: {
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#fff',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    level: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    progressContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    achievementsContainer: {
        padding: 20,
    },
    achievementCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    achievementCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    achievementTitleUnlocked: {
        color: '#fff',
    },
    achievementDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    achievementDescriptionUnlocked: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    rewardText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '600',
    },
    statsContainer: {
        padding: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});

export default ProfileScreen; 