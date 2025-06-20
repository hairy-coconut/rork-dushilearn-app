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
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    getAvailablePaths,
    getUserProgress,
    LearningPath,
    Lesson,
} from '../utils/learningPaths';

const { width } = Dimensions.get('window');

const LessonCard = ({ lesson, onPress, isCompleted, isLocked }) => {
    const { theme } = useTheme();
    const scale = new Animated.Value(1);

    const handlePress = () => {
        if (isLocked) return;
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
        onPress();
    };

    return (
        <Animated.View
            style={[
                styles.lessonCard,
                {
                    transform: [{ scale }],
                    opacity: isLocked ? 0.6 : 1,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.lessonCardContent}
                onPress={handlePress}
                disabled={isLocked}
            >
                <LinearGradient
                    colors={[
                        theme.colors.primary,
                        theme.colors.secondary,
                    ]}
                    style={styles.lessonCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.lessonCardHeader}>
                        <View style={styles.lessonIconContainer}>
                            <MaterialCommunityIcons
                                name={getLessonIcon(lesson.type)}
                                size={24}
                                color="#fff"
                            />
                        </View>
                        {isCompleted && (
                            <View style={styles.completedBadge}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color="#fff"
                                />
                            </View>
                        )}
                    </View>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                        {lesson.description}
                    </Text>
                    <View style={styles.lessonFooter}>
                        <View style={styles.rewardContainer}>
                            <MaterialCommunityIcons
                                name="star"
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.rewardText}>
                                {lesson.xpReward} XP
                            </Text>
                        </View>
                        <View style={styles.rewardContainer}>
                            <MaterialCommunityIcons
                                name="diamond-stone"
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.rewardText}>
                                {lesson.coconutReward}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const getLessonIcon = (type: string) => {
    switch (type) {
        case 'vocabulary':
            return 'book-open-variant';
        case 'grammar':
            return 'pencil-ruler';
        case 'pronunciation':
            return 'microphone';
        case 'conversation':
            return 'chat-processing';
        default:
            return 'book';
    }
};

const PathDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useUser();
    const { theme } = useTheme();
    const [path, setPath] = useState<LearningPath | null>(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const scrollY = new Animated.Value(0);

    useEffect(() => {
        loadPathDetails();
    }, []);

    const loadPathDetails = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const progress = await getUserProgress(user.id);
            setCompletedLessons(progress.completedLessons);

            const paths = getAvailablePaths(progress.level);
            const currentPath = paths.find(p => p.id === route.params?.pathId);
            if (currentPath) {
                setPath(currentPath);
            }
        } catch (error) {
            console.error('Error loading path details:', error);
        }
        setLoading(false);
    };

    const handleLessonPress = (lesson: Lesson) => {
        navigation.navigate('Lesson', { lessonId: lesson.id });
    };

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [200, 100],
        extrapolate: 'clamp',
    });

    if (loading || !path) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Animated.View
                style={[
                    styles.header,
                    {
                        height: headerHeight,
                    },
                ]}
            >
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>{path.title}</Text>
                            <Text style={styles.headerDescription}>
                                {path.description}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${path.progress}%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {Math.round(path.progress)}% Complete
                        </Text>
                    </View>
                </LinearGradient>
            </Animated.View>

            <Animated.ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {path.lessons.map((lesson, index) => (
                    <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        onPress={() => handleLessonPress(lesson)}
                        isCompleted={completedLessons.includes(lesson.id)}
                        isLocked={index > 0 && !completedLessons.includes(path.lessons[index - 1].id)}
                    />
                ))}
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    headerGradient: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerDescription: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
    progressContainer: {
        marginTop: 20,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    progressText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        marginTop: 200,
    },
    contentContainer: {
        padding: 20,
    },
    lessonCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    lessonCardContent: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    lessonCardGradient: {
        padding: 20,
    },
    lessonCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    lessonIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lessonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginBottom: 16,
    },
    lessonFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    rewardText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PathDetailsScreen; 