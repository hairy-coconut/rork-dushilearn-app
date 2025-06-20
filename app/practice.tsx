import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from "../constants/colors";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import PracticeCard from '../components/PracticeCard';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PracticeItem {
    id: string;
    title: string;
    type: 'vocabulary' | 'grammar' | 'listening' | 'speaking';
    difficulty: 'easy' | 'medium' | 'hard';
    nextReview: Date;
    masteryLevel: number;
}

export default function PracticeScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [practiceItems, setPracticeItems] = useState<PracticeItem[]>([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        masteredItems: 0,
        averageMastery: 0,
        nextReviewCount: 0,
    });
    const headerAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadData();
        animateHeader();
    }, []);

    const animateHeader = () => {
        Animated.spring(headerAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    };

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadPracticeItems(),
                loadStats(),
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadPracticeItems = async () => {
        const { data: items, error } = await supabase
            .from('practice_items')
            .select('*')
            .eq('user_id', user?.id)
            .order('next_review', { ascending: true });

        if (error) throw error;

        const formattedItems = items.map(item => ({
            ...item,
            nextReview: new Date(item.next_review),
        }));

        setPracticeItems(formattedItems);
    };

    const loadStats = async () => {
        const { data: statsData, error } = await supabase
            .rpc('get_practice_stats', { user_id: user?.id });

        if (error) throw error;

        setStats(statsData);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handlePracticePress = async (item: PracticeItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Navigate to practice exercise screen
        // router.push(`/practice-exercise/${item.id}`);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-100, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#4CAF50', '#45A049']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <BlurView intensity={20} style={styles.headerBlur}>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons
                                    name="book-open-variant"
                                    size={24}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.statText}>
                                    {stats.totalItems} Items
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons
                                    name="star-circle"
                                    size={24}
                                    color="#FFD700"
                                />
                                <Text style={styles.statText}>
                                    {stats.masteredItems} Mastered
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons
                                    name="chart-line"
                                    size={24}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.statText}>
                                    {stats.averageMastery}% Avg
                                </Text>
                            </View>
                        </View>
                    </BlurView>
                </LinearGradient>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                <Text style={styles.sectionTitle}>Practice Items</Text>
                {practiceItems.map((item) => (
                    <PracticeCard
                        key={item.id}
                        {...item}
                        onPress={() => handlePracticePress(item)}
                    />
                ))}

                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Practice Tips</Text>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons
                            name="clock-fast"
                            size={20}
                            color={Colors.primary}
                        />
                        <Text style={styles.tipText}>
                            Review items when they're due for optimal retention
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons
                            name="chart-bell-curve"
                            size={20}
                            color={Colors.primary}
                        />
                        <Text style={styles.tipText}>
                            Difficulty adjusts based on your performance
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <MaterialCommunityIcons
                            name="star"
                            size={20}
                            color={Colors.primary}
                        />
                        <Text style={styles.tipText}>
                            Master items to unlock new content
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 120,
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    headerGradient: {
        flex: 1,
    },
    headerBlur: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-end',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 8,
    },
    statText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        marginTop: 120,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16,
        color: '#333',
    },
    tipsContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
}); 