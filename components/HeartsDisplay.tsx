import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HeartsState } from '../utils/hearts';

interface HeartsDisplayProps {
    heartsState: HeartsState;
    onRefillPress?: () => void;
    size?: 'small' | 'medium' | 'large';
}

export default function HeartsDisplay({
    heartsState,
    onRefillPress,
    size = 'medium',
}: HeartsDisplayProps) {
    const [timeUntilRefill, setTimeUntilRefill] = useState<string>('');
    const heartAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const calculateTimeUntilRefill = () => {
            const now = new Date();
            const lastRefill = heartsState.lastRefillTime;
            const minutesPassed = (now.getTime() - lastRefill.getTime()) / (1000 * 60);
            const minutesUntilNextHeart = heartsState.heartsRefillRate - (minutesPassed % heartsState.heartsRefillRate);
            
            if (minutesUntilNextHeart <= 0) {
                setTimeUntilRefill('Ready!');
            } else {
                const hours = Math.floor(minutesUntilNextHeart / 60);
                const minutes = Math.floor(minutesUntilNextHeart % 60);
                setTimeUntilRefill(
                    hours > 0
                        ? `${hours}h ${minutes}m`
                        : `${minutes}m`
                );
            }
        };

        calculateTimeUntilRefill();
        const interval = setInterval(calculateTimeUntilRefill, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [heartsState]);

    const animateHeart = () => {
        Animated.sequence([
            Animated.timing(heartAnim, {
                toValue: 1.2,
                duration: 200,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.timing(heartAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        animateHeart();
        onRefillPress?.();
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    container: styles.smallContainer,
                    heart: styles.smallHeart,
                    text: styles.smallText,
                };
            case 'large':
                return {
                    container: styles.largeContainer,
                    heart: styles.largeHeart,
                    text: styles.largeText,
                };
            default:
                return {
                    container: styles.mediumContainer,
                    heart: styles.mediumHeart,
                    text: styles.mediumText,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    return (
        <TouchableOpacity
            style={[styles.container, sizeStyles.container]}
            onPress={handlePress}
            disabled={!onRefillPress}
        >
            <View style={styles.heartsContainer}>
                {Array.from({ length: heartsState.maxHearts }).map((_, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.heartWrapper,
                            index === heartsState.currentHearts - 1 && {
                                transform: [{ scale: heartAnim }],
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={index < heartsState.currentHearts ? 'heart' : 'heart-outline'}
                            size={size === 'small' ? 16 : size === 'large' ? 32 : 24}
                            color={index < heartsState.currentHearts ? '#FF4B4B' : '#999'}
                        />
                    </Animated.View>
                ))}
            </View>
            {heartsState.currentHearts < heartsState.maxHearts && (
                <Text style={[styles.timerText, sizeStyles.text]}>
                    Next heart in {timeUntilRefill}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    smallContainer: {
        padding: 6,
    },
    mediumContainer: {
        padding: 8,
    },
    largeContainer: {
        padding: 12,
    },
    heartsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heartWrapper: {
        marginHorizontal: 2,
    },
    smallHeart: {
        marginHorizontal: 1,
    },
    mediumHeart: {
        marginHorizontal: 2,
    },
    largeHeart: {
        marginHorizontal: 3,
    },
    timerText: {
        marginLeft: 8,
        color: '#666',
    },
    smallText: {
        fontSize: 12,
    },
    mediumText: {
        fontSize: 14,
    },
    largeText: {
        fontSize: 16,
    },
}); 