import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export type AudioType = 'lesson' | 'story' | 'pronunciation' | 'conversation' | 'cultural';
export type AudioQuality = 'low' | 'medium' | 'high';

export interface NativeSpeaker {
    id: string;
    name: string;
    region: string;
    accent: string;
    bio: string;
    image_url: string;
    voice_samples: string[];
    specialties: string[];
}

export interface AudioContent {
    id: string;
    type: AudioType;
    title: string;
    description: string;
    speaker_id: string;
    audio_url: string;
    duration: number; // in seconds
    quality: AudioQuality;
    transcript: string;
    translations: Record<string, string>;
    metadata: {
        difficulty: string;
        category: string;
        tags: string[];
        cultural_context?: string;
        pronunciation_notes?: string;
    };
}

export interface UserRecording {
    id: string;
    user_id: string;
    audio_content_id: string;
    recording_url: string;
    duration: number;
    created_at: string;
    feedback?: {
        pronunciation_score: number;
        accuracy_score: number;
        fluency_score: number;
        comments: string[];
    };
}

// Helper Functions
export const getNativeSpeakers = async (): Promise<NativeSpeaker[]> => {
    try {
        const { data, error } = await supabase
            .from('native_speakers')
            .select('*');

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching native speakers:', error);
        return [];
    }
};

export const getAudioContent = async (
    type: AudioType,
    difficulty?: string
): Promise<AudioContent[]> => {
    try {
        let query = supabase
            .from('audio_content')
            .select('*')
            .eq('type', type);

        if (difficulty) {
            query = query.eq('metadata->difficulty', difficulty);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching audio content:', error);
        return [];
    }
};

export const playAudio = async (audioUrl: string): Promise<void> => {
    try {
        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true }
        );
        await sound.playAsync();
    } catch (error) {
        console.error('Error playing audio:', error);
    }
};

export const recordAudio = async (): Promise<string> => {
    try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        // Record for 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();
        if (!uri) throw new Error('No recording URI');

        // Upload to Supabase Storage
        const fileName = `recordings/${Date.now()}.m4a`;
        const { data, error } = await supabase.storage
            .from('audio')
            .upload(fileName, {
                uri,
                type: 'audio/m4a',
                name: fileName,
            });

        if (error) throw error;
        return data.path;
    } catch (error) {
        console.error('Error recording audio:', error);
        throw error;
    }
};

export const saveUserRecording = async (
    userId: string,
    audioContentId: string,
    recordingUrl: string,
    duration: number
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_recordings')
            .insert({
                user_id: userId,
                audio_content_id: audioContentId,
                recording_url: recordingUrl,
                duration,
                created_at: new Date().toISOString(),
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error saving user recording:', error);
        return false;
    }
};

export const getUserRecordings = async (userId: string): Promise<UserRecording[]> => {
    try {
        const { data, error } = await supabase
            .from('user_recordings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user recordings:', error);
        return [];
    }
};

export const analyzePronunciation = async (
    recordingUrl: string,
    referenceText: string
): Promise<{
    pronunciation_score: number;
    accuracy_score: number;
    fluency_score: number;
    comments: string[];
}> => {
    try {
        // This would integrate with a speech recognition API
        // For now, return mock data
        return {
            pronunciation_score: Math.random() * 100,
            accuracy_score: Math.random() * 100,
            fluency_score: Math.random() * 100,
            comments: [
                'Good pronunciation of vowels',
                'Work on consonant clusters',
                'Maintain consistent pace',
            ],
        };
    } catch (error) {
        console.error('Error analyzing pronunciation:', error);
        throw error;
    }
};

export const updateRecordingFeedback = async (
    recordingId: string,
    feedback: UserRecording['feedback']
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_recordings')
            .update({ feedback })
            .eq('id', recordingId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating recording feedback:', error);
        return false;
    }
};

export const getAudioProgress = async (
    userId: string,
    audioContentId: string
): Promise<{
    completed: boolean;
    attempts: number;
    best_score: number;
    last_attempt: string;
}> => {
    try {
        const { data, error } = await supabase
            .from('audio_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('audio_content_id', audioContentId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching audio progress:', error);
        return {
            completed: false,
            attempts: 0,
            best_score: 0,
            last_attempt: new Date().toISOString(),
        };
    }
}; 