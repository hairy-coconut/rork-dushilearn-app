import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Image,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from './constants/colors';
import { useUser } from '../contexts/AuthContext';
import { LessonContent, getLessonById } from '../utils/lessonTypes';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

const LessonScreen = () => {
    const { theme } = useTheme();
    const { user } = useUser();
    const router = useRouter();
    const { lessonId } = useLocalSearchParams();
    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef(null);

    useEffect(() => {
        loadLesson();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [lessonId]);

    const loadLesson = async () => {
        if (!lessonId) return;
        setLoading(true);
        try {
            const lessonData = getLessonById(lessonId as string);
            setLesson(lessonData || null);
        } catch (error) {
            console.error('Error loading lesson:', error);
        }
        setLoading(false);
    };

    const playAudio = async () => {
        if (!lesson?.audioUrl) return;
        try {
            if (sound) {
                await sound.unloadAsync();
            }
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: lesson.audioUrl }
            );
            setSound(newSound);
            await newSound.playAsync();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
        const correct = Array.isArray(lesson?.content.correctAnswer)
            ? lesson?.content.correctAnswer.includes(answer)
            : lesson?.content.correctAnswer === answer;
        setIsCorrect(correct);

        if (correct) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowConfetti(true);
            confettiRef.current?.start();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setShowResult(true);
    };

    const handleContinue = () => {
        if (isCorrect) {
            // Update progress and navigate
            router.push('/lesson-complete');
        } else {
            setShowResult(false);
            setSelectedAnswer(null);
        }
    };

    if (loading || !lesson) {
        return (
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const renderLessonContent = () => {
        switch (lesson.type) {
            case 'listen_match':
                return (
                    <View style={styles.listenMatchContainer}>
                        <TouchableOpacity
                            style={styles.audioButton}
                            onPress={playAudio}
                        >
                            <MaterialCommunityIcons
                                name="play-circle"
                                size={64}
                                color={Colors.primary}
                            />
                            <Text style={styles.audioButtonText}>
                                Listen to the phrase
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.optionsContainer}>
                            {lesson.content.options?.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        selectedAnswer === option && styles.selectedOption,
                                        showResult && selectedAnswer === option && (
                                            isCorrect ? styles.correctOption : styles.incorrectOption
                                        ),
                                    ]}
                                    onPress={() => handleAnswerSelect(option)}
                                    disabled={showResult}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedAnswer === option && styles.selectedOptionText,
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'fill_blank':
                return (
                    <View style={styles.fillBlankContainer}>
                        <Text style={styles.questionText}>
                            {lesson.content.question}
                        </Text>
                        <View style={styles.blankContainer}>
                            <TextInput
                                style={styles.blankInput}
                                placeholder="Type your answer"
                                value={selectedAnswer || ''}
                                onChangeText={setSelectedAnswer}
                                editable={!showResult}
                            />
                        </View>
                        {showResult && (
                            <View style={styles.feedbackContainer}>
                                <Text style={[
                                    styles.feedbackText,
                                    isCorrect ? styles.correctText : styles.incorrectText,
                                ]}>
                                    {isCorrect
                                        ? lesson.content.feedback?.correct
                                        : lesson.content.feedback?.incorrect}
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 'multiple_choice':
                return (
                    <View style={styles.multipleChoiceContainer}>
                        <Text style={styles.questionText}>
                            {lesson.content.question}
                        </Text>
                        <View style={styles.optionsContainer}>
                            {lesson.content.options?.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        selectedAnswer === option && styles.selectedOption,
                                        showResult && selectedAnswer === option && (
                                            isCorrect ? styles.correctOption : styles.incorrectOption
                                        ),
                                    ]}
                                    onPress={() => handleAnswerSelect(option)}
                                    disabled={showResult}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedAnswer === option && styles.selectedOptionText,
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            default:
                return (
                    <View style={styles.defaultContainer}>
                        <Text style={styles.unsupportedText}>
                            This lesson type is not supported yet.
                        </Text>
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{lesson.title}</Text>
                    <View style={styles.headerRight} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                {renderLessonContent()}
            </ScrollView>

            {showResult && (
                <View style={styles.resultContainer}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            { backgroundColor: isCorrect ? '#4CAF50' : Colors.primary },
                        ]}
                        onPress={handleContinue}
                    >
                        <Text style={styles.continueButtonText}>
                            {isCorrect ? 'Continue' : 'Try Again'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {showConfetti && (
                <ConfettiCannon
                    ref={confettiRef}
                    count={200}
                    origin={{ x: width / 2, y: 0 }}
                    autoStart={false}
                    fadeOut={true}
                />
            )}
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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    listenMatchContainer: {
        alignItems: 'center',
    },
    audioButton: {
        alignItems: 'center',
        marginBottom: 32,
    },
    audioButtonText: {
        marginTop: 8,
        fontSize: 16,
        color: '#666',
    },
    optionsContainer: {
        width: '100%',
    },
    optionButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    correctOption: {
        backgroundColor: '#4CAF50',
    },
    incorrectOption: {
        backgroundColor: '#F44336',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#4A90E2',
    },
    fillBlankContainer: {
        width: '100%',
    },
    questionText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 24,
    },
    blankContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    blankInput: {
        fontSize: 16,
        color: '#333',
    },
    feedbackContainer: {
        marginTop: 16,
    },
    feedbackText: {
        fontSize: 16,
        textAlign: 'center',
    },
    correctText: {
        color: '#4CAF50',
    },
    incorrectText: {
        color: '#F44336',
    },
    multipleChoiceContainer: {
        width: '100%',
    },
    defaultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unsupportedText: {
        fontSize: 16,
        color: '#666',
    },
    resultContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    continueButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LessonScreen; 