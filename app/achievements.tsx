import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useUser } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserAchievements, Achievement } from '../utils/achievements';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const AchievementCard = ({ achievement, onPress }) => {
    const { theme } = useTheme();
    const scale = new Animated.Value(1);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Animated.View
            style={[
                styles.achievementCard,
                {
                    transform: [{ scale }],
                    opacity: achievement.isUnlocked ? 1 : 0.7,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.achievementCardContent}
                onPress={handlePress}
            >
                <LinearGradient
                    colors={
                        achievement.isUnlocked
                            ? [theme.colors.primary, theme.colors.secondary]
                            : ['#e0e0e0', '#bdbdbd']
                    }
                    style={styles.achievementCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.achievementIconContainer}>
                        <MaterialCommunityIcons
                            name={achievement.icon}
                            size={32}
                            color="#fff"
                        />
                    </View>
                    <View style={styles.achievementInfo}>
                        <Text style={styles.achievementTitle}>
                            {achievement.title}
                        </Text>
                        <Text style={styles.achievementDescription}>
                            {achievement.description}
                        </Text>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${(achievement.progress /
                                                achievement.requirement) *
                                                100}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {achievement.progress}/{achievement.requirement}
                            </Text>
                        </View>
                    </View>
                    {achievement.isUnlocked && (
                        <View style={styles.rewardContainer}>
                            <View style={styles.rewardItem}>
                                <MaterialCommunityIcons
                                    name="star"
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.rewardText}>
                                    {achievement.reward.xp}
                                </Text>
                            </View>
                            <View style={styles.rewardItem}>
                                <MaterialCommunityIcons
                                    name="diamond-stone"
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.rewardText}>
                                    {achievement.reward.coconuts}
                                </Text>
                            </View>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const AchievementsScreen = () => {
    const { user } = useUser();
    const { theme } = useTheme();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAchievementDetails, setShowAchievementDetails] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(
        null
    );

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userAchievements = await getUserAchievements(user.id);
            setAchievements(userAchievements);
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
        setLoading(false);
    };

    const handleCategorySelect = (category: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategory(category);
    };

    const handleAchievementPress = (achievement: Achievement) => {
        setSelectedAchievement(achievement);
        setShowAchievementDetails(true);
    };

    const filteredAchievements = achievements.filter(
        achievement =>
            selectedCategory === 'all' || achievement.category === selectedCategory
    );

    const categories = [
        { id: 'all', name: 'All', icon: 'trophy' },
        { id: 'learning', name: 'Learning', icon: 'book-open-variant' },
        { id: 'streak', name: 'Streak', icon: 'fire' },
        { id: 'social', name: 'Social', icon: 'share-variant' },
        { id: 'special', name: 'Special', icon: 'star' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Achievements</Text>
                    <Text style={styles.headerSubtitle}>
                        Unlock achievements to earn rewards
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {categories.map(category => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.id &&
                                styles.selectedCategory,
                        ]}
                        onPress={() => handleCategorySelect(category.id)}
                    >
                        <MaterialCommunityIcons
                            name={category.icon}
                            size={24}
                            color={
                                selectedCategory === category.id
                                    ? '#fff'
                                    : theme.colors.primary
                            }
                        />
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category.id &&
                                    styles.selectedCategoryText,
                            ]}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.achievementsContainer}
                    contentContainerStyle={styles.achievementsContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredAchievements.map(achievement => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            onPress={() => handleAchievementPress(achievement)}
                        />
                    ))}
                </ScrollView>
            )}

            {showAchievementDetails && selectedAchievement && (
                <BlurView
                    style={styles.modalOverlay}
                    intensity={50}
                    tint="dark"
                >
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            style={styles.modalGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.modalHeader}>
                                <MaterialCommunityIcons
                                    name={selectedAchievement.icon}
                                    size={48}
                                    color="#fff"
                                />
                                <Text style={styles.modalTitle}>
                                    {selectedAchievement.title}
                                </Text>
                            </View>
                            <Text style={styles.modalDescription}>
                                {selectedAchievement.description}
                            </Text>
                            <View style={styles.modalRewards}>
                                <Text style={styles.modalRewardsTitle}>
                                    Rewards:
                                </Text>
                                <View style={styles.modalRewardItem}>
                                    <MaterialCommunityIcons
                                        name="star"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.modalRewardText}>
                                        {selectedAchievement.reward.xp} XP
                                    </Text>
                                </View>
                                <View style={styles.modalRewardItem}>
                                    <MaterialCommunityIcons
                                        name="diamond-stone"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.modalRewardText}>
                                        {selectedAchievement.reward.coconuts} Coconuts
                                    </Text>
                                </View>
                                {selectedAchievement.reward.special && (
                                    <View style={styles.modalRewardItem}>
                                        <MaterialCommunityIcons
                                            name="gift"
                                            size={24}
                                            color="#fff"
                                        />
                                        <Text style={styles.modalRewardText}>
                                            {selectedAchievement.reward.special}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowAchievementDetails(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </BlurView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
    categoriesContainer: {
        maxHeight: 60,
    },
    categoriesContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    selectedCategory: {
        backgroundColor: '#4A90E2',
    },
    categoryText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#4A90E2',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    achievementsContainer: {
        flex: 1,
    },
    achievementsContent: {
        padding: 20,
    },
    achievementCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    achievementCardContent: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    achievementCardGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginBottom: 12,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        marginRight: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
    },
    rewardContainer: {
        marginLeft: 16,
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    rewardText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width - 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalGradient: {
        padding: 24,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 24,
    },
    modalRewards: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    modalRewardsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    modalRewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalRewardText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 12,
    },
    modalCloseButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AchievementsScreen; 