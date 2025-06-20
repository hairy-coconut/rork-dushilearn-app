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
import { ShopItem } from '../utils/shop';
import { useTheme } from '../contexts/ThemeContext';

interface ShopItemCardProps {
    item: ShopItem;
    onPress: (item: ShopItem) => void;
    isOwned?: boolean;
    isActive?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const RARITY_COLORS = {
    common: ['#4a4a4a', '#2a2a2a'],
    rare: ['#4a90e2', '#2a5298'],
    epic: ['#9b4dca', '#6a1b9a'],
    legendary: ['#ffd700', '#ff8c00'],
};

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
    item,
    onPress,
    isOwned,
    isActive,
}) => {
    const { theme } = useTheme();
    const scaleAnim = new Animated.Value(1);
    const glowAnim = new Animated.Value(0);

    useEffect(() => {
        if (isActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isActive]);

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
        onPress(item);
    };

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    });

    const getRarityGradient = () => {
        return RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.touchable}
            >
                <LinearGradient
                    colors={getRarityGradient()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {isActive && (
                        <Animated.View
                            style={[
                                styles.glow,
                                {
                                    opacity: glowOpacity,
                                    backgroundColor: getRarityGradient()[0],
                                },
                            ]}
                        />
                    )}
                    <BlurView intensity={20} style={styles.content}>
                        <View style={styles.header}>
                            <MaterialCommunityIcons
                                name={item.icon as any}
                                size={32}
                                color={theme.colors.text}
                            />
                            <View style={styles.priceContainer}>
                                <MaterialCommunityIcons
                                    name={item.currency === 'gems' ? 'diamond-stone' : 'star'}
                                    size={20}
                                    color={theme.colors.text}
                                />
                                <Text style={[styles.price, { color: theme.colors.text }]}>
                                    {item.price}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.details}>
                            <Text style={[styles.name, { color: theme.colors.text }]}>
                                {item.name}
                            </Text>
                            <Text style={[styles.description, { color: theme.colors.text }]}>
                                {item.description}
                            </Text>
                        </View>

                        {item.duration && (
                            <View style={styles.duration}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={16}
                                    color={theme.colors.text}
                                />
                                <Text style={[styles.durationText, { color: theme.colors.text }]}>
                                    {item.duration}h
                                </Text>
                            </View>
                        )}

                        {isOwned && (
                            <View style={styles.ownedBadge}>
                                <Text style={styles.ownedText}>
                                    {isActive ? 'Active' : 'Owned'}
                                </Text>
                            </View>
                        )}
                    </BlurView>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: 200,
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
    glow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
    },
    content: {
        flex: 1,
        padding: 15,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    price: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        opacity: 0.8,
    },
    duration: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    durationText: {
        marginLeft: 5,
        fontSize: 14,
    },
    ownedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    ownedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
}); 