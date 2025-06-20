import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Colors from './constants/colors';
import { useUser } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface PassportStamp {
    id: string;
    title: string;
    description: string;
    icon: string;
    date: string;
    type: 'achievement' | 'milestone' | 'special';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PassportPage {
    id: string;
    title: string;
    stamps: PassportStamp[];
    isUnlocked: boolean;
}

const PASSPORT_PAGES: PassportPage[] = [
    {
        id: 'basics',
        title: 'Language Basics',
        stamps: [
            {
                id: 'first_word',
                title: 'First Word',
                description: 'Learned your first word',
                icon: 'book-open-variant',
                date: '2024-03-20',
                type: 'milestone',
                rarity: 'common',
            },
            {
                id: 'first_phrase',
                title: 'First Phrase',
                description: 'Learned your first phrase',
                icon: 'chat-processing',
                date: '2024-03-21',
                type: 'milestone',
                rarity: 'common',
            },
        ],
        isUnlocked: true,
    },
    {
        id: 'conversations',
        title: 'Conversations',
        stamps: [
            {
                id: 'first_conversation',
                title: 'First Conversation',
                description: 'Completed your first conversation',
                icon: 'account-group',
                date: '2024-03-22',
                type: 'achievement',
                rarity: 'rare',
            },
        ],
        isUnlocked: true,
    },
    {
        id: 'culture',
        title: 'Cultural Knowledge',
        stamps: [
            {
                id: 'cultural_quiz',
                title: 'Cultural Explorer',
                description: 'Completed a cultural quiz',
                icon: 'earth',
                date: '2024-03-23',
                type: 'achievement',
                rarity: 'epic',
            },
        ],
        isUnlocked: false,
    },
];

const PassportScreen = () => {
    const { theme } = useTheme();
    const { user } = useUser();
    const [selectedPage, setSelectedPage] = useState<string>('basics');
    const [pageAnimation] = useState(new Animated.Value(0));

    const handlePageSelect = (pageId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPage(pageId);
    };

    const getRarityColor = (rarity: PassportStamp['rarity']) => {
        switch (rarity) {
            case 'common':
                return '#A0A0A0';
            case 'rare':
                return '#4CAF50';
            case 'epic':
                return '#9C27B0';
            case 'legendary':
                return '#FFD700';
            default:
                return '#A0A0A0';
        }
    };

    const renderStamp = (stamp: PassportStamp) => (
        <TouchableOpacity
            key={stamp.id}
            style={styles.stampCard}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Show stamp details
            }}
        >
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.stampIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <MaterialCommunityIcons
                    name={stamp.icon}
                    size={32}
                    color="#fff"
                />
            </LinearGradient>
            <View style={styles.stampInfo}>
                <Text style={styles.stampTitle}>{stamp.title}</Text>
                <Text style={styles.stampDescription}>{stamp.description}</Text>
                <View style={styles.stampMeta}>
                    <View style={[
                        styles.rarityBadge,
                        { backgroundColor: getRarityColor(stamp.rarity) },
                    ]}>
                        <Text style={styles.rarityText}>
                            {stamp.rarity.charAt(0).toUpperCase() + stamp.rarity.slice(1)}
                        </Text>
                    </View>
                    <Text style={styles.stampDate}>{stamp.date}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Tropical Passport</Text>
                <Text style={styles.headerSubtitle}>Your Learning Journey</Text>
            </LinearGradient>

            <View style={styles.passportContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.pageSelector}
                    contentContainerStyle={styles.pageSelectorContent}
                >
                    {PASSPORT_PAGES.map((page) => (
                        <TouchableOpacity
                            key={page.id}
                            style={[
                                styles.pageButton,
                                selectedPage === page.id && styles.selectedPageButton,
                                !page.isUnlocked && styles.lockedPageButton,
                            ]}
                            onPress={() => page.isUnlocked && handlePageSelect(page.id)}
                            disabled={!page.isUnlocked}
                        >
                            <MaterialCommunityIcons
                                name={
                                    page.id === 'basics' ? 'book-open-variant' :
                                    page.id === 'conversations' ? 'account-group' :
                                    'earth'
                                }
                                size={24}
                                color={selectedPage === page.id ? '#fff' : Colors.primary}
                            />
                            <Text style={[
                                styles.pageText,
                                selectedPage === page.id && styles.selectedPageText,
                                !page.isUnlocked && styles.lockedPageText,
                            ]}>
                                {page.title}
                            </Text>
                            {!page.isUnlocked && (
                                <MaterialCommunityIcons
                                    name="lock"
                                    size={16}
                                    color="#666"
                                    style={styles.lockIcon}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView
                    style={styles.stampsContainer}
                    contentContainerStyle={styles.stampsContent}
                >
                    {PASSPORT_PAGES.find(page => page.id === selectedPage)?.stamps.map(renderStamp)}
                </ScrollView>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {PASSPORT_PAGES.reduce((acc, page) => acc + page.stamps.length, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Total Stamps</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {PASSPORT_PAGES.filter(page => page.isUnlocked).length}
                    </Text>
                    <Text style={styles.statLabel}>Pages Unlocked</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {PASSPORT_PAGES.reduce((acc, page) => 
                            acc + page.stamps.filter(stamp => stamp.rarity === 'legendary').length, 0
                        )}
                    </Text>
                    <Text style={styles.statLabel}>Legendary Stamps</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    passportContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -20,
        padding: 20,
    },
    pageSelector: {
        maxHeight: 80,
    },
    pageSelectorContent: {
        paddingVertical: 10,
    },
    pageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    selectedPageButton: {
        backgroundColor: Colors.primary,
    },
    lockedPageButton: {
        opacity: 0.5,
    },
    pageText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    selectedPageText: {
        color: '#fff',
    },
    lockedPageText: {
        color: '#666',
    },
    lockIcon: {
        marginLeft: 4,
    },
    stampsContainer: {
        flex: 1,
    },
    stampsContent: {
        paddingVertical: 20,
    },
    stampCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    stampIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stampInfo: {
        flex: 1,
        marginLeft: 15,
    },
    stampTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    stampDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    stampMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    rarityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    rarityText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    stampDate: {
        fontSize: 12,
        color: '#999',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});

export default PassportScreen; 