import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

interface MatchingExerciseProps {
  question: string;
  pairs: MatchingPair[];
  showExplanation: boolean;
  onSelectAnswer: (answer: Record<string, string>) => void;
  explanation?: string;
}

export default function MatchingExercise({
  question,
  pairs,
  showExplanation,
  onSelectAnswer,
  explanation,
}: MatchingExerciseProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const handleLeftSelect = (id: string) => {
    if (showExplanation) return;
    setSelectedLeft(id);
  };

  const handleRightSelect = (id: string) => {
    if (showExplanation || !selectedLeft) return;

    const newMatches = {
      ...matches,
      [selectedLeft]: id,
    };

    setMatches(newMatches);
    setSelectedLeft(null);

    // Check if all pairs are matched
    if (Object.keys(newMatches).length === pairs.length) {
      onSelectAnswer(newMatches);
    }
  };

  const isCorrect = (leftId: string, rightId: string) => {
    const pair = pairs.find(p => p.id === leftId);
    return pair && pair.right === rightId;
  };

  const getItemStyle = (id: string, isLeft: boolean) => {
    if (!showExplanation) {
      if (isLeft) {
        return selectedLeft === id ? styles.selectedItem : styles.item;
      }
      return matches[selectedLeft || ''] === id ? styles.selectedItem : styles.item;
    }

    const match = isLeft ? matches[id] : Object.entries(matches).find(([_, rightId]) => rightId === id)?.[0];
    if (!match) return styles.item;

    const correct = isLeft ? isCorrect(id, match) : isCorrect(match, id);
    return correct ? styles.correctItem : styles.incorrectItem;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <ScrollView style={styles.pairsContainer}>
        <View style={styles.columnsContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {pairs.map((pair) => (
              <TouchableOpacity
                key={pair.id}
                style={[styles.itemButton, getItemStyle(pair.id, true)]}
                onPress={() => handleLeftSelect(pair.id)}
                disabled={showExplanation || matches[pair.id]}
              >
                <Text style={styles.itemText}>{pair.left}</Text>
                {showExplanation && matches[pair.id] && (
                  <MaterialCommunityIcons
                    name={isCorrect(pair.id, matches[pair.id]) ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={isCorrect(pair.id, matches[pair.id]) ? '#34C759' : '#FF3B30'}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {pairs.map((pair) => (
              <TouchableOpacity
                key={pair.id}
                style={[styles.itemButton, getItemStyle(pair.id, false)]}
                onPress={() => handleRightSelect(pair.id)}
                disabled={showExplanation || Object.values(matches).includes(pair.id)}
              >
                <Text style={styles.itemText}>{pair.right}</Text>
                {showExplanation && Object.entries(matches).find(([_, rightId]) => rightId === pair.id) && (
                  <MaterialCommunityIcons
                    name={isCorrect(Object.entries(matches).find(([_, rightId]) => rightId === pair.id)?.[0] || '', pair.id) ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={isCorrect(Object.entries(matches).find(([_, rightId]) => rightId === pair.id)?.[0] || '', pair.id) ? '#34C759' : '#FF3B30'}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {showExplanation && explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
  },
  pairsContainer: {
    flex: 1,
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  item: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  correctItem: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  incorrectItem: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  explanationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  explanationText: {
    fontSize: 16,
    color: '#000',
  },
}); 