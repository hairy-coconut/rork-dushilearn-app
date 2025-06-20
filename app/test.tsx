import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { TEST_LESSON } from '../utils/testData';
import { TEST_STORY } from '../utils/testData';
import { router } from 'expo-router';

export default function TestScreen() {
    const { theme } = useTheme();

    const handleLessonPress = () => {
        router.push({
            pathname: '/lesson-player',
            params: { lessonId: TEST_LESSON.id },
        });
    };

    const handleStoryPress = () => {
        router.push({
            pathname: '/story-viewer',
            params: { storyId: TEST_STORY.id },
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                Test Components
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={handleLessonPress}
            >
                <Text style={styles.buttonText}>Test Lesson Player</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.secondary }]}
                onPress={handleStoryPress}
            >
                <Text style={styles.buttonText}>Test Story Viewer</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        width: '80%',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
}); 