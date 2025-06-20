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
    TextInput,
    Image,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import FriendCard from '../components/FriendCard';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    UserProfile,
} from '../utils/social';

const { width } = Dimensions.get('window');

interface LeaderboardEntry {
    id: string;
    name: string;
    avatar: string;
    xp: number;
    streak: number;
    rank: number;
}

const FriendsScreen = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [friendRequests, setFriendRequests] = useState<UserProfile[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [showSearch, setShowSearch] = useState(false);
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
                loadFriends(),
                loadLeaderboard(),
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadFriends = async () => {
        setLoading(true);
        try {
            const [friendsData, requestsData] = await Promise.all([
                getFriends(user?.id || ''),
                getFriendRequests(user?.id || ''),
            ]);
            setFriends(friendsData);
            setFriendRequests(requestsData);
        } catch (error) {
            console.error('Error loading friends:', error);
        }
        setLoading(false);
    };

    const loadLeaderboard = async () => {
        const { data: leaderboardData, error } = await supabase
            .rpc('get_leaderboard', { limit_count: 10 });

        if (error) throw error;

        setLeaderboard(leaderboardData);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleTabSelect = (tab: 'friends' | 'requests') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(tab);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            // Implement search functionality
            // This would typically call an API to search for users
            // For now, we'll just filter the friends list
            const filtered = friends.filter(friend =>
                friend.username.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            await sendFriendRequest(user?.id || '', userId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error sending friend request:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleAcceptRequest = async (userId: string) => {
        try {
            await acceptFriendRequest(userId, user?.id || '');
            await loadFriends();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error accepting friend request:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleRejectRequest = async (userId: string) => {
        try {
            await rejectFriendRequest(userId, user?.id || '');
            await loadFriends();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleRemoveFriend = async (userId: string) => {
        try {
            await removeFriend(user?.id || '', userId);
            await loadFriends();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error removing friend:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const renderFriendCard = (friend: UserProfile) => (
        <Animated.View
            key={friend.id}
            style={styles.friendCard}
        >
            <LinearGradient
                colors={['#fff', '#f5f5f5']}
                style={styles.friendCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Image
                    source={{ uri: friend.avatar_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.friendInfo}>
                    <Text style={styles.username}>{friend.username}</Text>
                    <Text style={styles.level}>Level {friend.level}</Text>
                </View>
                <View style={styles.friendStats}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="star"
                            size={16}
                            color={Colors.primary}
                        />
                        <Text style={styles.statText}>{friend.xp}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="fire"
                            size={16}
                            color={Colors.secondary}
                        />
                        <Text style={styles.statText}>{friend.streak}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFriend(friend.id)}
                >
                    <MaterialCommunityIcons
                        name="account-remove"
                        size={24}
                        color={Colors.error}
                    />
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>
    );

    const renderRequestCard = (request: UserProfile) => (
        <Animated.View
            key={request.id}
            style={styles.requestCard}
        >
            <LinearGradient
                colors={['#fff', '#f5f5f5']}
                style={styles.requestCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Image
                    source={{ uri: request.avatar_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.requestInfo}>
                    <Text style={styles.username}>{request.username}</Text>
                    <Text style={styles.level}>Level {request.level}</Text>
                </View>
                <View style={styles.requestActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptRequest(request.id)}
                    >
                        <MaterialCommunityIcons
                            name="check"
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleRejectRequest(request.id)}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
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
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <BlurView intensity={20} style={styles.headerBlur}>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.tabButton,
                                    activeTab === 'friends' && styles.selectedTabButton,
                                ]}
                                onPress={() => handleTabSelect('friends')}
                            >
                                <MaterialCommunityIcons
                                    name="account-group"
                                    size={20}
                                    color={activeTab === 'friends' ? '#fff' : Colors.primary}
                                />
                                <Text style={[
                                    styles.tabText,
                                    activeTab === 'friends' && styles.selectedTabText,
                                ]}>
                                    Friends
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.tabButton,
                                    activeTab === 'requests' && styles.selectedTabButton,
                                ]}
                                onPress={() => handleTabSelect('requests')}
                            >
                                <MaterialCommunityIcons
                                    name="bell"
                                    size={20}
                                    color={activeTab === 'requests' ? '#fff' : Colors.primary}
                                />
                                <Text style={[
                                    styles.tabText,
                                    activeTab === 'requests' && styles.selectedTabText,
                                ]}>
                                    Requests
                                    {friendRequests.length > 0 && (
                                        <Text style={styles.badge}>
                                            {' '}{friendRequests.length}
                                        </Text>
                                    )}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </LinearGradient>
            </Animated.View>

            <View style={styles.searchContainer}>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => setShowSearch(!showSearch)}
                >
                    <MaterialCommunityIcons
                        name={showSearch ? 'close' : 'account-plus'}
                        size={24}
                        color={Colors.primary}
                    />
                </TouchableOpacity>
                {showSearch && (
                    <View style={styles.searchInputContainer}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={20}
                            color={Colors.textLight}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users..."
                            value={searchQuery}
                            onChangeText={handleSearch}
                            placeholderTextColor={Colors.textLight}
                        />
                    </View>
                )}
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                {activeTab === 'friends' ? (
                    <>
                        {searchResults.length > 0 ? (
                            <View style={styles.searchResults}>
                                {searchResults.map(renderFriendCard)}
                            </View>
                        ) : (
                            <View style={styles.friendsList}>
                                {friends.map(renderFriendCard)}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.requestsList}>
                        {friendRequests.map(renderRequestCard)}
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
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    selectedTabButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    tabText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginLeft: 8,
    },
    selectedTabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    badge: {
        backgroundColor: '#fff',
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 40,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    friendsList: {
        paddingHorizontal: 20,
    },
    friendCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    friendCardGradient: {
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
    friendInfo: {
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
    friendStats: {
        flexDirection: 'row',
        marginRight: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    statText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    removeButton: {
        padding: 8,
    },
    requestsList: {
        paddingHorizontal: 20,
    },
    requestCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    requestCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    requestInfo: {
        flex: 1,
    },
    requestActions: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    acceptButton: {
        backgroundColor: Colors.success,
    },
    rejectButton: {
        backgroundColor: Colors.error,
    },
    searchResults: {
        paddingHorizontal: 20,
    },
});

export default FriendsScreen; 