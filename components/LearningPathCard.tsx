import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LearningPath } from '../utils/learningPaths';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface LearningPathCardProps {
    path: LearningPath;
    onPress: (path: LearningPath) => void;
    userLevel: number;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({
    path,
    onPress,
    userLevel,
}) => {
    const { theme } = useTheme();
    const scaleAnim = new Animated.Value(1);
    const progressAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: path.progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [path.progress]);

    const handlePress = () => {
        if (path.isLocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onPress(path);
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: path.isLocked ? 0.7 : 1,
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.touchable}
                disabled={path.isLocked}
            >
                <LinearGradient
                    colors={[path.color, path.color + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <BlurView intensity={20} style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name={path.icon as any}
                                    size={32}
                                    color="#fff"
                                />
                            </View>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>{path.title}</Text>
                                <Text style={styles.description}>{path.description}</Text>
                            </View>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        { width: progressWidth },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {Math.round(path.progress)}% Complete
                            </Text>
                        </View>

                        <View style={styles.footer}>
                            <View style={styles.rewardContainer}>
                                <MaterialCommunityIcons
                                    name="star"
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.rewardText}>
                                    {path.xpReward} XP
                                </Text>
                            </View>
                            {path.isLocked && (
                                <View style={styles.lockContainer}>
                                    <MaterialCommunityIcons
                                        name="lock"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.lockText}>
                                        Level {path.requiredLevel}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: 180,
        marginHorizontal: 10,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    touchable: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        padding: 2,
    },
    content: {
        flex: 1,
        padding: 15,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    progressContainer: {
        marginBottom: 15,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    rewardText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
    },
    lockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    lockText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
    },
}); 