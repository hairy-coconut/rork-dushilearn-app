import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Colors from '../constants/colors';
import { useUser } from '../contexts/UserContext';
import { LessonContent, LessonType } from '../utils/lessonTypes';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface LessonPlayerProps {
    lessonId: string;
}

export default function LessonPlayerScreen({ lessonId }: LessonPlayerProps) {
    const { theme } = useTheme();
    const { user } = useUser();
    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        loadLesson();
    }, [lessonId]);

    const loadLesson = async () => {
        try {
            const lessonData = await getLessonById(lessonId);
            setLesson(lessonData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading lesson:', error);
            setLoading(false);
        }
    };

    const handleAnswer = (answer: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setUserAnswers([...userAnswers, answer]);
        setShowFeedback(true);

        // Check if answer is correct
        if (answer === lesson?.content.correct_answer) {
            setScore(score + 1);
        }

        // Move to next question after delay
        setTimeout(() => {
            setShowFeedback(false);
            setCurrentQuestion(currentQuestion + 1);
        }, 1500);
    };

    const renderQuestion = () => {
        if (!lesson) return null;

        switch (lesson.type) {
            case 'multiple_choice':
                return (
                    <View style={styles.questionContainer}>
                        <Text style={[styles.questionText, { color: Colors.text }]}>
                            {lesson.content.text}
                        </Text>
                        <View style={styles.optionsContainer}>
                            {lesson.content.options?.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor: Colors.card,
                                            borderColor: Colors.border,
                                        },
                                    ]}
                                    onPress={() => handleAnswer(option)}
                                >
                                    <Text style={[styles.optionText, { color: Colors.text }]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'fill_blank':
                return (
                    <View style={styles.questionContainer}>
                        <Text style={[styles.questionText, { color: Colors.text }]}>
                            {lesson.content.text?.replace('_____', '_____')}
                        </Text>
                        <View style={styles.optionsContainer}>
                            {lesson.content.options?.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor: Colors.card,
                                            borderColor: Colors.border,
                                        },
                                    ]}
                                    onPress={() => handleAnswer(option)}
                                >
                                    <Text style={[styles.optionText, { color: Colors.text }]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'word_order':
                return (
                    <View style={styles.questionContainer}>
                        <Text style={[styles.questionText, { color: Colors.text }]}>
                            Arrange the words in the correct order
                        </Text>
                        <View style={styles.wordOrderContainer}>
                            {lesson.content.text?.split(' ').map((word, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.wordButton,
                                        {
                                            backgroundColor: Colors.card,
                                            borderColor: Colors.border,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.wordText, { color: Colors.text }]}>
                                        {word}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            default:
                return (
                    <View style={styles.questionContainer}>
                        <Text style={[styles.questionText, { color: Colors.text }]}>
                            Lesson type not implemented yet
                        </Text>
                    </View>
                );
        }
    };

    const renderFeedback = () => {
        if (!showFeedback || !lesson) return null;

        const isCorrect = userAnswers[userAnswers.length - 1] === lesson.content.correct_answer;

        return (
            <BlurView intensity={80} style={styles.feedbackContainer}>
                <MaterialCommunityIcons
                    name={isCorrect ? 'check-circle' : 'close-circle'}
                    size={48}
                    color={isCorrect ? Colors.success : Colors.error}
                />
                <Text style={[styles.feedbackText, { color: Colors.text }]}>
                    {isCorrect ? 'Correct!' : 'Try again!'}
                </Text>
            </BlurView>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!lesson) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <Text style={[styles.errorText, { color: Colors.text }]}>
                    Lesson not found
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
                <Text style={styles.title}>{lesson.title}</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        Question {currentQuestion + 1} of {lesson.content.options?.length || 1}
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${((currentQuestion + 1) / (lesson.content.options?.length || 1)) * 100}%`,
                                },
                            ]}
                        />
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {renderQuestion()}
                {renderFeedback()}

                {lesson.content.cultural_notes && (
                    <View style={[styles.culturalNote, { backgroundColor: Colors.card }]}>
                        <MaterialCommunityIcons
                            name="information"
                            size={24}
                            color={Colors.primary}
                        />
                        <Text style={[styles.culturalNoteText, { color: Colors.text }]}>
                            {lesson.content.cultural_notes}
                        </Text>
                    </View>
                )}
            </ScrollView>
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
        marginBottom: 20,
    },
    progressContainer: {
        marginTop: 10,
    },
    progressText: {
        color: '#fff',
        marginBottom: 5,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
    },
    optionsContainer: {
        gap: 10,
    },
    optionButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 16,
    },
    wordOrderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 20,
    },
    wordButton: {
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    wordText: {
        fontSize: 16,
    },
    feedbackContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -100 }, { translateY: -50 }],
        width: 200,
        height: 100,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: '600',
    },
    culturalNote: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        gap: 10,
    },
    culturalNoteText: {
        flex: 1,
        fontSize: 14,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
    },
}); 