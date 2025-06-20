import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Skill } from '../utils/skillStrengthening';

interface SkillStrengthCardProps {
    skill: Skill;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
}

export default function SkillStrengthCard({
    skill,
    onPress,
    size = 'medium',
}: SkillStrengthCardProps) {
    const strengthAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animate strength bar
        Animated.timing(strengthAnim, {
            toValue: skill.strength / 100,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();

        // Start pulsing animation if skill needs practice
        if (skill.strength < 50) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [skill.strength]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
    };

    const getStrengthColor = (strength: number) => {
        if (strength >= 80) return ['#4CAF50', '#45A049'];
        if (strength >= 50) return ['#FFC107', '#FFA000'];
        return ['#FF5252', '#FF1744'];
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    container: styles.smallContainer,
                    title: styles.smallTitle,
                    description: styles.smallDescription,
                    strengthText: styles.smallStrengthText,
                };
            case 'large':
                return {
                    container: styles.largeContainer,
                    title: styles.largeTitle,
                    description: styles.largeDescription,
                    strengthText: styles.largeStrengthText,
                };
            default:
                return {
                    container: styles.mediumContainer,
                    title: styles.mediumTitle,
                    description: styles.mediumDescription,
                    strengthText: styles.mediumStrengthText,
                };
        }
    };

    const sizeStyles = getSizeStyles();
    const strengthColors = getStrengthColor(skill.strength);
    const needsPractice = skill.strength < 50;

    return (
        <Animated.View
            style={[
                styles.container,
                sizeStyles.container,
                needsPractice && {
                    transform: [{ scale: pulseAnim }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.touchable}
                onPress={handlePress}
                disabled={!onPress}
            >
                <LinearGradient
                    colors={strengthColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <BlurView intensity={20} style={styles.blur}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Text style={[styles.title, sizeStyles.title]}>
                                    {skill.title}
                                </Text>
                                <MaterialCommunityIcons
                                    name={needsPractice ? 'alert-circle' : 'check-circle'}
                                    size={size === 'small' ? 16 : size === 'large' ? 32 : 24}
                                    color={needsPractice ? '#FF5252' : '#4CAF50'}
                                />
                            </View>

                            <Text
                                style={[styles.description, sizeStyles.description]}
                                numberOfLines={2}
                            >
                                {skill.description}
                            </Text>

                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBar}>
                                    <Animated.View
                                        style={[
                                            styles.strengthFill,
                                            {
                                                width: strengthAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                }),
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.strengthText, sizeStyles.strengthText]}>
                                    {Math.round(skill.strength)}% Strength
                                </Text>
                            </View>

                            {needsPractice && (
                                <View style={styles.practiceBadge}>
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.practiceText}>
                                        Practice Needed
                                    </Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    smallContainer: {
        marginVertical: 4,
    },
    mediumContainer: {
        marginVertical: 8,
    },
    largeContainer: {
        marginVertical: 12,
    },
    touchable: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    blur: {
        flex: 1,
        padding: 16,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    smallTitle: {
        fontSize: 14,
    },
    mediumTitle: {
        fontSize: 18,
    },
    largeTitle: {
        fontSize: 24,
    },
    description: {
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 12,
    },
    smallDescription: {
        fontSize: 12,
    },
    mediumDescription: {
        fontSize: 14,
    },
    largeDescription: {
        fontSize: 16,
    },
    strengthContainer: {
        marginTop: 8,
    },
    strengthBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    strengthText: {
        color: '#FFFFFF',
        marginTop: 4,
        textAlign: 'right',
    },
    smallStrengthText: {
        fontSize: 12,
    },
    mediumStrengthText: {
        fontSize: 14,
    },
    largeStrengthText: {
        fontSize: 16,
    },
    practiceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 82, 82, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    practiceText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
}); 