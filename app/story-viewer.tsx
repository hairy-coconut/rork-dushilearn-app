import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Colors from '../constants/colors';
import { useUser } from '../contexts/UserContext';
import { IslandStory, StoryDialogue } from '../utils/stories';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface StoryViewerProps {
    storyId: string;
}

export default function StoryViewerScreen({ storyId }: StoryViewerProps) {
    const { theme } = useTheme();
    const { user } = useUser();
    const [story, setStory] = useState<IslandStory | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentDialogue, setCurrentDialogue] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [showCulturalNote, setShowCulturalNote] = useState(false);

    useEffect(() => {
        loadStory();
    }, [storyId]);

    const loadStory = async () => {
        try {
            const storyData = await getStoryById(storyId);
            setStory(storyData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading story:', error);
            setLoading(false);
        }
    };

    const handleNextDialogue = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentDialogue < (story?.dialogues.length || 0) - 1) {
            setCurrentDialogue(currentDialogue + 1);
            setShowTranslation(false);
            setShowCulturalNote(false);
        }
    };

    const handlePreviousDialogue = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentDialogue > 0) {
            setCurrentDialogue(currentDialogue - 1);
            setShowTranslation(false);
            setShowCulturalNote(false);
        }
    };

    const toggleTranslation = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowTranslation(!showTranslation);
    };

    const toggleCulturalNote = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowCulturalNote(!showCulturalNote);
    };

    const renderDialogue = (dialogue: StoryDialogue) => {
        const character = story?.characters.find(c => c.id === dialogue.character_id);

        return (
            <View style={styles.dialogueContainer}>
                <View style={styles.characterInfo}>
                    <Image
                        source={{ uri: character?.image_url }}
                        style={styles.characterImage}
                    />
                    <View>
                        <Text style={[styles.characterName, { color: Colors.text }]}>
                            {character?.name}
                        </Text>
                        <Text style={[styles.characterRole, { color: Colors.textLight }]}>
                            {character?.role}
                        </Text>
                    </View>
                </View>

                <View style={[styles.dialogueBubble, { backgroundColor: Colors.card }]}>
                    <Text style={[styles.dialogueText, { color: Colors.text }]}>
                        {dialogue.text}
                    </Text>
                </View>

                {showTranslation && (
                    <View style={[styles.translationBubble, { backgroundColor: Colors.primary }]}>
                        <Text style={styles.translationText}>
                            {dialogue.translation}
                        </Text>
                    </View>
                )}

                {dialogue.cultural_note && showCulturalNote && (
                    <View style={[styles.culturalNote, { backgroundColor: Colors.card }]}>
                        <MaterialCommunityIcons
                            name="information"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={[styles.culturalNoteText, { color: Colors.text }]}>
                            {dialogue.cultural_note}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!story) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <Text style={[styles.errorText, { color: Colors.text }]}>
                    Story not found
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>{story.title}</Text>
                <Text style={styles.description}>{story.description}</Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {renderDialogue(story.dialogues[currentDialogue])}
            </ScrollView>

            <View style={[styles.controls, { backgroundColor: Colors.card }]}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={handlePreviousDialogue}
                    disabled={currentDialogue === 0}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={currentDialogue === 0 ? Colors.textLight : Colors.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleTranslation}
                >
                    <MaterialCommunityIcons
                        name="translate"
                        size={24}
                        color={Colors.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleCulturalNote}
                    disabled={!story.dialogues[currentDialogue].cultural_note}
                >
                    <MaterialCommunityIcons
                        name="information"
                        size={24}
                        color={story.dialogues[currentDialogue].cultural_note ? Colors.text : Colors.textLight}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={handleNextDialogue}
                    disabled={currentDialogue === story.dialogues.length - 1}
                >
                    <MaterialCommunityIcons
                        name="arrow-right"
                        size={24}
                        color={currentDialogue === story.dialogues.length - 1 ? Colors.textLight : Colors.text}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    dialogueContainer: {
        marginBottom: 20,
    },
    characterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    characterImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    characterName: {
        fontSize: 18,
        fontWeight: '600',
    },
    characterRole: {
        fontSize: 14,
    },
    dialogueBubble: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    dialogueText: {
        fontSize: 16,
        lineHeight: 24,
    },
    translationBubble: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    translationText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 24,
    },
    culturalNote: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        gap: 10,
    },
    culturalNoteText: {
        flex: 1,
        fontSize: 14,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    controlButton: {
        padding: 10,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
    },
}); 