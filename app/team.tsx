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
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/AuthContext';
import {
    getTeam,
    getTeamMembers,
    getTeamChallenges,
    joinTeam,
    leaveTeam,
    Team,
    UserProfile,
    CommunityChallenge,
} from '../utils/social';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const TeamScreen = () => {
    const { theme } = useTheme();
    const { user } = useUser();
    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'members' | 'challenges'>('overview');

    useEffect(() => {
        loadTeamData();
    }, []);

    const loadTeamData = async () => {
        setLoading(true);
        try {
            const [teamData, membersData, challengesData] = await Promise.all([
                getTeam(user?.team_id || ''),
                getTeamMembers(user?.team_id || ''),
                getTeamChallenges(user?.team_id || ''),
            ]);
            setTeam(teamData);
            setMembers(membersData);
            setChallenges(challengesData);
        } catch (error) {
            console.error('Error loading team data:', error);
        }
        setLoading(false);
    };

    const handleTabSelect = (tab: 'overview' | 'members' | 'challenges') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTab(tab);
    };

    const handleJoinTeam = async () => {
        try {
            await joinTeam(user?.id || '', team?.id || '');
            await loadTeamData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error joining team:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleLeaveTeam = async () => {
        try {
            await leaveTeam(user?.id || '', team?.id || '');
            await loadTeamData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error leaving team:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const renderTeamOverview = () => (
        <View style={styles.overviewContainer}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.teamCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.teamName}>{team?.name}</Text>
                <Text style={styles.teamDescription}>{team?.description}</Text>
                <View style={styles.teamStats}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="account-group"
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.statValue}>{members.length}</Text>
                        <Text style={styles.statLabel}>Members</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="star"
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.statValue}>{team?.level}</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="trophy"
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.statValue}>{team?.achievements.length}</Text>
                        <Text style={styles.statLabel}>Achievements</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Weekly Goal</Text>
                <View style={styles.progressBar}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={[
                            styles.progressFill,
                            { width: `${(team?.weekly_progress || 0) / (team?.weekly_goal || 1) * 100}%` },
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </View>
                <Text style={styles.progressText}>
                    {team?.weekly_progress} / {team?.weekly_goal} XP
                </Text>
            </View>

            {user?.team_id !== team?.id && (
                <TouchableOpacity
                    style={styles.joinButton}
                    onPress={handleJoinTeam}
                >
                    <Text style={styles.joinButtonText}>Join Team</Text>
                </TouchableOpacity>
            )}

            {user?.team_id === team?.id && (
                <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={handleLeaveTeam}
                >
                    <Text style={styles.leaveButtonText}>Leave Team</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderMembers = () => (
        <View style={styles.membersContainer}>
            {members.map((member) => (
                <Animated.View
                    key={member.id}
                    style={styles.memberCard}
                >
                    <LinearGradient
                        colors={['#fff', '#f5f5f5']}
                        style={styles.memberCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Image
                            source={{ uri: member.avatar_url || 'https://via.placeholder.com/50' }}
                            style={styles.avatar}
                        />
                        <View style={styles.memberInfo}>
                            <Text style={styles.username}>{member.username}</Text>
                            <Text style={styles.level}>Level {member.level}</Text>
                        </View>
                        <View style={styles.memberStats}>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons
                                    name="star"
                                    size={16}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.statText}>{member.xp}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons
                                    name="fire"
                                    size={16}
                                    color={theme.colors.secondary}
                                />
                                <Text style={styles.statText}>{member.streak}</Text>
                            </View>
                        </View>
                        {member.id === team?.leader_id && (
                            <View style={styles.leaderBadge}>
                                <MaterialCommunityIcons
                                    name="crown"
                                    size={16}
                                    color="#FFD700"
                                />
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>
            ))}
        </View>
    );

    const renderChallenges = () => (
        <View style={styles.challengesContainer}>
            {challenges.map((challenge) => (
                <Animated.View
                    key={challenge.id}
                    style={styles.challengeCard}
                >
                    <LinearGradient
                        colors={['#fff', '#f5f5f5']}
                        style={styles.challengeCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.challengeHeader}>
                            <MaterialCommunityIcons
                                name={challenge.type === 'daily' ? 'calendar-today' : 'calendar-week'}
                                size={24}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        </View>
                        <Text style={styles.challengeDescription}>
                            {challenge.description}
                        </Text>
                        <View style={styles.challengeProgress}>
                            <View style={styles.progressBar}>
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.secondary]}
                                    style={[
                                        styles.progressFill,
                                        { width: `${challenge.participants.length / challenge.requirements.min_participants * 100}%` },
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {challenge.participants.length} / {challenge.requirements.min_participants} participants
                            </Text>
                        </View>
                        <View style={styles.challengeReward}>
                            <MaterialCommunityIcons
                                name="gift"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.rewardText}>
                                {challenge.reward.xp} XP + {challenge.reward.coconuts} Coconuts
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Team</Text>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'overview' && styles.selectedTabButton,
                        ]}
                        onPress={() => handleTabSelect('overview')}
                    >
                        <MaterialCommunityIcons
                            name="information"
                            size={20}
                            color={selectedTab === 'overview' ? '#fff' : theme.colors.primary}
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
                            selectedTab === 'members' && styles.selectedTabButton,
                        ]}
                        onPress={() => handleTabSelect('members')}
                    >
                        <MaterialCommunityIcons
                            name="account-group"
                            size={20}
                            color={selectedTab === 'members' ? '#fff' : theme.colors.primary}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === 'members' && styles.selectedTabText,
                        ]}>
                            Members
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'challenges' && styles.selectedTabButton,
                        ]}
                        onPress={() => handleTabSelect('challenges')}
                    >
                        <MaterialCommunityIcons
                            name="trophy"
                            size={20}
                            color={selectedTab === 'challenges' ? '#fff' : theme.colors.primary}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === 'challenges' && styles.selectedTabText,
                        ]}>
                            Challenges
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {selectedTab === 'overview' && renderTeamOverview()}
                {selectedTab === 'members' && renderMembers()}
                {selectedTab === 'challenges' && renderChallenges()}
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
    teamCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    teamName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    teamDescription: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 20,
    },
    teamStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    joinButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    leaveButton: {
        backgroundColor: theme.colors.error,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    leaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    membersContainer: {
        padding: 20,
    },
    memberCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    memberCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    memberInfo: {
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
    memberStats: {
        flexDirection: 'row',
        marginRight: 12,
    },
    statText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    leaderBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    challengesContainer: {
        padding: 20,
    },
    challengeCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    challengeCardGradient: {
        padding: 16,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    challengeTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    challengeDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    challengeProgress: {
        marginBottom: 12,
    },
    challengeReward: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rewardText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
});

export default TeamScreen; 