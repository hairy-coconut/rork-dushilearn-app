import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';
import Colors from './constants/colors';

interface RewardCelebrationModalProps {
    visible: boolean;
    reward: {
        type: string;
        amount: number;
        streakDay: number;
        specialReward?: {
            title: string;
            description: string;
            icon: string;
        };
    };
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function RewardCelebrationModal({
    visible,
    reward,
    onClose,
}: RewardCelebrationModalProps) {
    const scaleAnim = new Animated.Value(0);
    const opacityAnim = new Animated.Value(0);
    const confettiRef = React.useRef<ConfettiCannon>(null);
    const [sound, setSound] = React.useState<Audio.Sound>();

    useEffect(() => {
        if (visible) {
            // Play celebration sound
            playCelebrationSound();
            
            // Trigger haptic feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Start animations
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 40,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Fire confetti
            setTimeout(() => {
                confettiRef.current?.start();
            }, 500);
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const playCelebrationSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/celebration.mp3')
            );
            setSound(sound);
            await sound.playAsync();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    const getRewardIcon = () => {
        if (reward.specialReward) {
            return reward.specialReward.icon;
        }

        switch (reward.type) {
            case 'xp':
                return 'star';
            case 'hearts':
                return 'heart';
            case 'streak_freeze':
                return 'snowflake';
            case 'gem':
                return 'diamond-stone';
            default:
                return 'gift';
        }
    };

    const getRewardColor = () => {
        if (reward.specialReward) {
            return Colors.gradients.sunset;
        }

        switch (reward.type) {
            case 'xp':
                return Colors.gradients.success;
            case 'hearts':
                return Colors.gradients.secondary;
            case 'streak_freeze':
                return Colors.gradients.ocean;
            case 'gem':
                return Colors.gradients.primary;
            case 'coconut':
                return Colors.gradients.tropical;
            default:
                return Colors.gradients.primary;
        }
    };

    const getRewardTitle = () => {
        if (reward.specialReward) {
            return reward.specialReward.title;
        }

        switch (reward.type) {
            case 'xp':
                return `${reward.amount} XP`;
            case 'hearts':
                return `${reward.amount} Heart${reward.amount > 1 ? 's' : ''}`;
            case 'streak_freeze':
                return 'Streak Freeze';
            case 'gem':
                return `${reward.amount} Gems`;
            default:
                return 'Reward';
        }
    };

    const getRewardDescription = () => {
        if (reward.specialReward) {
            return reward.specialReward.description;
        }

        return `Day ${reward.streakDay} Reward`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <BlurView intensity={20} style={styles.blurContainer}>
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={getRewardColor()}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradient}
                        >
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name={getRewardIcon()}
                                    size={64}
                                    color="#FFFFFF"
                                />
                            </View>
                            <Text style={styles.title}>{getRewardTitle()}</Text>
                            <Text style={styles.description}>
                                {getRewardDescription()}
                            </Text>
                            {reward.specialReward && (
                                <View style={styles.specialRewardContainer}>
                                    <MaterialCommunityIcons
                                        name="crown"
                                        size={24}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.specialRewardText}>
                                        Special Milestone Reward!
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <Text style={styles.closeButtonText}>
                                    Awesome!
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </Animated.View>
                </BlurView>
                <ConfettiCannon
                    ref={confettiRef}
                    count={200}
                    origin={{ x: width / 2, y: 0 }}
                    autoStart={false}
                    fadeOut={true}
                    fallSpeed={3000}
                    colors={[Colors.accent, Colors.secondary, Colors.primary, Colors.success, Colors.coralPink]}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: width * 0.8,
        aspectRatio: 1,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 20,
    },
    specialRewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        padding: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    specialRewardText: {
        fontSize: 16,
        color: '#FFD700',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
}); 