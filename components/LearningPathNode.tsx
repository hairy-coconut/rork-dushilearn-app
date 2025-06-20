import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface LearningPathNodeProps {
    title: string;
    type: 'lesson' | 'checkpoint' | 'boss';
    status: 'locked' | 'available' | 'completed';
    xp: number;
    onPress?: () => void;
    isActive?: boolean;
    index: number;
}

export default function LearningPathNode({
    title,
    type,
    status,
    xp,
    onPress,
    isActive,
    index,
}: LearningPathNodeProps) {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(0)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                delay: index * 100,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                delay: index * 100,
            }),
        ]).start();
    }, []);

    const handlePress = () => {
        if (status === 'locked') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const getNodeIcon = () => {
        switch (type) {
            case 'lesson':
                return 'book-open-variant';
            case 'checkpoint':
                return 'shield-check';
            case 'boss':
                return 'crown';
        }
    };

    const getNodeColors = () => {
        switch (status) {
            case 'locked':
                return ['#666666', '#444444'];
            case 'available':
                return [theme.colors.primary, theme.colors.primaryDark];
            case 'completed':
                return ['#4CAF50', '#2E7D32'];
        }
    };

    const getNodeSize = () => {
        switch (type) {
            case 'lesson':
                return 60;
            case 'checkpoint':
                return 70;
            case 'boss':
                return 80;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <TouchableOpacity
                onPress={handlePress}
                disabled={status === 'locked'}
                style={styles.nodeContainer}
            >
                <LinearGradient
                    colors={getNodeColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.node,
                        {
                            width: getNodeSize(),
                            height: getNodeSize(),
                            borderRadius: getNodeSize() / 2,
                        },
                    ]}
                >
                    <BlurView intensity={20} style={styles.blur}>
                        <MaterialCommunityIcons
                            name={getNodeIcon()}
                            size={getNodeSize() / 2}
                            color={status === 'locked' ? '#999999' : '#FFFFFF'}
                        />
                        {status === 'completed' && (
                            <View style={styles.completedBadge}>
                                <MaterialCommunityIcons
                                    name="check"
                                    size={16}
                                    color="#FFFFFF"
                                />
                            </View>
                        )}
                    </BlurView>
                </LinearGradient>
                <Text
                    style={[
                        styles.title,
                        {
                            color:
                                status === 'locked'
                                    ? theme.colors.textSecondary
                                    : theme.colors.text,
                        },
                    ]}
                >
                    {title}
                </Text>
                <Text
                    style={[
                        styles.xp,
                        {
                            color:
                                status === 'locked'
                                    ? theme.colors.textSecondary
                                    : theme.colors.primary,
                        },
                    ]}
                >
                    {xp} XP
                </Text>
            </TouchableOpacity>
            {isActive && (
                <View style={styles.activeIndicator}>
                    <MaterialCommunityIcons
                        name="star"
                        size={16}
                        color={theme.colors.primary}
                    />
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    nodeContainer: {
        alignItems: 'center',
    },
    node: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    blur: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
    },
    completedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    xp: {
        fontSize: 12,
        fontWeight: '500',
    },
    activeIndicator: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
}); 