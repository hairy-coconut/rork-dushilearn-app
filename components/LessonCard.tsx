import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { LessonContent, LessonType } from '../utils/lessonTypes';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface LessonCardProps {
    lesson: LessonContent;
    onPress: () => void;
    isLocked?: boolean;
    isCompleted?: boolean;
    progress?: number;
}

const getLessonTypeIcon = (type: LessonType): string => {
    switch (type) {
        case 'listen_match':
            return 'ear-hearing';
        case 'fill_blank':
            return 'pencil';
        case 'multiple_choice':
            return 'format-list-checks';
        case 'speak_record':
            return 'microphone';
        case 'drag_drop':
            return 'drag';
        case 'conversation':
            return 'chat';
        case 'cultural_quiz':
            return 'island';
        case 'word_order':
            return 'order-alphabetical-ascending';
        case 'picture_match':
            return 'image-multiple';
        case 'role_play':
            return 'account-group';
        default:
            return 'book-open-variant';
    }
};

const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
        case 'beginner':
            return '#4CAF50';
        case 'intermediate':
            return '#FFC107';
        case 'advanced':
            return '#F44336';
        default:
            return '#9E9E9E';
    }
};

export const LessonCard: React.FC<LessonCardProps> = ({
    lesson,
    onPress,
    isLocked = false,
    isCompleted = false,
    progress = 0,
}) => {
    const { theme } = useTheme();
    const scale = new Animated.Value(1);
    const progressAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const handlePress = () => {
        if (isLocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

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
                styles.container,
                {
                    transform: [{ scale }],
                    opacity: isLocked ? 0.7 : 1,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.touchable}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.header}>
                        <View style={styles.typeContainer}>
                            <MaterialCommunityIcons
                                name={getLessonTypeIcon(lesson.type)}
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.typeText}>
                                {lesson.type.replace('_', ' ')}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.difficultyBadge,
                                { backgroundColor: getDifficultyColor(lesson.difficulty) },
                            ]}
                        >
                            <Text style={styles.difficultyText}>
                                {lesson.difficulty}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>{lesson.title}</Text>
                        <Text style={styles.description}>
                            {lesson.description}
                        </Text>

                        <View style={styles.metadata}>
                            <View style={styles.metadataItem}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.metadataText}>
                                    {lesson.timeEstimate} min
                                </Text>
                            </View>
                            <View style={styles.metadataItem}>
                                <MaterialCommunityIcons
                                    name="star"
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.metadataText}>
                                    {lesson.xpReward} XP
                                </Text>
                            </View>
                            <View style={styles.metadataItem}>
                                <MaterialCommunityIcons
                                    name="diamond-stone"
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.metadataText}>
                                    {lesson.coconutReward}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={24}
                                color="#4CAF50"
                            />
                        </View>
                    )}

                    {isLocked && (
                        <BlurView
                            style={styles.lockedOverlay}
                            intensity={50}
                            tint="dark"
                        >
                            <MaterialCommunityIcons
                                name="lock"
                                size={32}
                                color="#fff"
                            />
                            <Text style={styles.lockedText}>
                                Level {lesson.requiredLevel} required
                            </Text>
                        </BlurView>
                    )}

                    {progress > 0 && !isCompleted && (
                        <View style={styles.progressContainer}>
                            <Animated.View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                        }),
                                    },
                                ]}
                            />
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width - 40,
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    touchable: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    typeText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    difficultyText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
        marginBottom: 16,
    },
    metadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    metadataText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '600',
    },
    completedBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 4,
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    lockedText: {
        color: '#fff',
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#fff',
    },
});