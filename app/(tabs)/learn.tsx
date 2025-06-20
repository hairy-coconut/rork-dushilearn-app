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
import { LearningPathCard } from '../../components/LearningPathCard';
import {
    getAvailablePaths,
    getUserProgress,
    getNextLesson,
    LearningPath,
} from '../../utils/learningPaths';
import { useUser } from '../../contexts/AuthContext';
import Colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const LearnScreen = () => {
    const { user, profile } = useUser();
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState(1);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const fabScale = new Animated.Value(1);

    useEffect(() => {
        loadUserProgress();
    }, []);

    const loadUserProgress = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const progress = await getUserProgress(user.id);
            setUserLevel(progress.level);
            setCurrentPath(progress.currentPath);
            setCompletedLessons(progress.completedLessons);

            const availablePaths = getAvailablePaths(progress.level);
            setPaths(availablePaths.map(path => ({
                ...path,
                progress: calculatePathProgress(path.id, progress.completedLessons),
            })));
        } catch (error) {
            console.error('Error loading progress:', error);
        }
        setLoading(false);
    };

    const calculatePathProgress = (pathId: string, completed: string[]): number => {
        const path = paths.find(p => p.id === pathId);
        if (!path) return 0;

        const completedInPath = path.lessons.filter(lesson =>
            completed.includes(lesson.id)
        ).length;

        return (completedInPath / path.lessons.length) * 100;
    };

    const handlePathPress = (path: LearningPath) => {
        if (path.isLocked) return;
        navigation.navigate('PathDetails', { pathId: path.id });
    };

    const handleContinuePress = async () => {
        if (!currentPath) return;

        const nextLesson = getNextLesson(currentPath, completedLessons);
        if (nextLesson) {
            navigation.navigate('Lesson', { lessonId: nextLesson.id });
        }
    };

    const animateFab = () => {
        Animated.sequence([
            Animated.timing(fabScale, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(fabScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Learn</Text>
                        <Text style={styles.headerSubtitle}>
                            Level {userLevel} • {profile?.xp || 0} XP
                        </Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons
                                name="star"
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.statText}>
                                {profile?.streak || 0}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons
                                name="diamond-stone"
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.statText}>
                                {profile?.gems || 0}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.pathsContainer}
                    contentContainerStyle={styles.pathsContent}
                    showsVerticalScrollIndicator={false}
                >
                    {paths.map(path => (
                        <LearningPathCard
                            key={path.id}
                            path={path}
                            onPress={handlePathPress}
                            userLevel={userLevel}
                        />
                    ))}
                </ScrollView>
            )}

            {currentPath && (
                <Animated.View
                    style={[
                        styles.fabContainer,
                        { transform: [{ scale: fabScale }] },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => {
                            animateFab();
                            handleContinuePress();
                        }}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            style={styles.fabGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons
                                name="play"
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.fabText}>Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
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
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 10,
    },
    statText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pathsContainer: {
        flex: 1,
    },
    pathsContent: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fab: {
        borderRadius: 30,
        overflow: 'hidden',
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default LearnScreen; 