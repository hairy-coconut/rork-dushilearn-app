import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface AchievementCardProps {
    title: string;
    description: string;
    icon: string;
    progress: number;
    total: number;
    isCompleted: boolean;
    onPress?: () => void;
}

export default function AchievementCard({
    title,
    description,
    icon,
    progress,
    total,
    isCompleted,
    onPress,
}: AchievementCardProps) {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const progressAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress / total,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [progress, total]);

    const handlePress = () => {
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
        onPress?.();
    };

    const getIconColor = () => {
        if (isCompleted) return '#4CAF50';
        if (progress > 0) return theme.colors.primary;
        return theme.colors.textSecondary;
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                style={styles.touchable}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={isCompleted ? ['#4CAF50', '#45A049'] : ['#2C2C2C', '#1C1C1C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <BlurView intensity={20} style={styles.blur}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <MaterialCommunityIcons
                                    name={icon}
                                    size={32}
                                    color={getIconColor()}
                                />
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>{title}</Text>
                                    <Text style={styles.description}>
                                        {description}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <Animated.View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: progressAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                }),
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {progress}/{total}
                                </Text>
                            </View>
                        </View>
                    </BlurView>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    touchable: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradient: {
        borderRadius: 16,
    },
    blur: {
        overflow: 'hidden',
        borderRadius: 16,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
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
        backgroundColor: '#4CAF50',
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        minWidth: 40,
        textAlign: 'right',
    },
}); 