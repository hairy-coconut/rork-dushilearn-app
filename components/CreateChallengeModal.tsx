import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from './constants/colors';
import { socialApi } from './utils/socialApi';

interface CreateChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
}

export default function CreateChallengeModal({
  visible,
  onClose,
  onChallengeCreated,
}: CreateChallengeModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'streak' | 'lessons' | 'exercises'>('streak');
  const [target, setTarget] = useState('');
  const [duration, setDuration] = useState('7');
  const [rewardType, setRewardType] = useState<'coins' | 'badge' | 'theme' | 'premium'>('coins');
  const [rewardValue, setRewardValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title || !description || !target || !rewardValue) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const challenge = {
        title,
        description,
        type,
        target: parseInt(target),
        reward: {
          type: rewardType,
          value: rewardType === 'coins' ? parseInt(rewardValue) : rewardValue,
        },
        duration: parseInt(duration),
      };

      await socialApi.createChallenge(challenge);
      onChallengeCreated();
      onClose();
    } catch (err) {
      setError('Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeButton = (
    selectedType: 'streak' | 'lessons' | 'exercises',
    icon: string,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        type === selectedType && styles.typeButtonActive,
      ]}
      onPress={() => setType(selectedType)}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={type === selectedType ? '#FFFFFF' : Colors.primary}
      />
      <Text
        style={[
          styles.typeButtonText,
          type === selectedType && styles.typeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRewardTypeButton = (
    selectedRewardType: 'coins' | 'badge' | 'theme' | 'premium',
    icon: string,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.rewardTypeButton,
        rewardType === selectedRewardType && styles.rewardTypeButtonActive,
      ]}
      onPress={() => setRewardType(selectedRewardType)}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={rewardType === selectedRewardType ? '#FFFFFF' : Colors.primary}
      />
      <Text
        style={[
          styles.rewardTypeButtonText,
          rewardType === selectedRewardType && styles.rewardTypeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Challenge</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Challenge Type</Text>
            <View style={styles.typeContainer}>
              {renderTypeButton('streak', 'fire', 'Streak')}
              {renderTypeButton('lessons', 'book', 'Lessons')}
              {renderTypeButton('exercises', 'dumbbell', 'Exercises')}
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter challenge title"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter challenge description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Target</Text>
            <TextInput
              style={styles.input}
              value={target}
              onChangeText={setTarget}
              placeholder="Enter target number"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Duration (days)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="Enter duration in days"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Reward Type</Text>
            <View style={styles.rewardTypeContainer}>
              {renderRewardTypeButton('coins', 'coin', 'Coins')}
              {renderRewardTypeButton('badge', 'medal', 'Badge')}
              {renderRewardTypeButton('theme', 'palette', 'Theme')}
              {renderRewardTypeButton('premium', 'star', 'Premium')}
            </View>

            <Text style={styles.label}>Reward Value</Text>
            <TextInput
              style={styles.input}
              value={rewardValue}
              onChangeText={setRewardValue}
              placeholder={
                rewardType === 'coins'
                  ? 'Enter coin amount'
                  : 'Enter reward name'
              }
              placeholderTextColor="#999"
              keyboardType={rewardType === 'coins' ? 'numeric' : 'default'}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>Create Challenge</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  rewardTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rewardTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  rewardTypeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
  },
  rewardTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 