import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Colors from './constants/colors';
import AudioButton from './AudioButton';
import { WordAudio } from './constants/audio';

type VocabularyCardProps = {
  word: WordAudio;
  onPress?: () => void;
};

export default function VocabularyCard({ word, onPress }: VocabularyCardProps) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.translation}>{word.translation}</Text>
        </View>
        <AudioButton audioUrl={word.audioUrl} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  word: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  translation: {
    fontSize: 14,
    color: Colors.textLight,
  },
});