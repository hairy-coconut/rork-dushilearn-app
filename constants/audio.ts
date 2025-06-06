import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Type for audio data
export type WordAudio = {
  word: string;
  translation: string;
  audioUrl: string;
};

// Audio data for Papiamento words
export const wordAudios: Record<string, WordAudio[]> = {
  "greetings": [
    {
      word: "Bon dia",
      translation: "Good morning/Hello",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/bon_dia_pa_us_1.mp3"
    },
    {
      word: "Bon tardi",
      translation: "Good afternoon",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/bon_tardi_pa_us_1.mp3"
    },
    {
      word: "Bon nochi",
      translation: "Good night",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/bon_nochi_pa_us_1.mp3"
    },
    {
      word: "Kon ta bai",
      translation: "How are you?",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/kon_ta_bai_pa_us_1.mp3"
    },
    {
      word: "Danki",
      translation: "Thank you",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/danki_pa_us_1.mp3"
    }
  ],
  "introductions": [
    {
      word: "Mi nomber ta",
      translation: "My name is",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/mi_nomber_ta_pa_us_1.mp3"
    },
    {
      word: "Mi ta di",
      translation: "I am from",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/mi_ta_di_pa_us_1.mp3"
    },
    {
      word: "Kiko bo nomber ta?",
      translation: "What is your name?",
      audioUrl: "https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/pa/kiko_bo_nomber_ta_pa_us_1.mp3"
    }
  ]
};

// Function to play audio
export const playAudio = async (audioUrl: string) => {
  try {
    if (Platform.OS === 'web') {
      // For web, use the native Audio API
      const audio = new window.Audio(audioUrl);
      await audio.play();
    } else {
      // For mobile, use Expo Audio
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      await sound.playAsync();
      
      // Unload sound when finished
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    }
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};