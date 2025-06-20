import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { purchaseStreakFreeze } from '../utils/streak';
import { getCurrentUser } from '../utils/supabase';

interface StreakFreezePurchaseProps {
  onPurchaseComplete: () => void;
  onClose: () => void;
}

export default function StreakFreezePurchase({ onPurchaseComplete, onClose }: StreakFreezePurchaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (source: 'ad' | 'coins') => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }

      await purchaseStreakFreeze(user.id, source);
      onPurchaseComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase streak freeze');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color="#666" />
        </TouchableOpacity>

        <MaterialCommunityIcons
          name="snowflake"
          size={48}
          color="#4ECDC4"
          style={styles.icon}
        />

        <Text style={styles.title}>Protect Your Streak!</Text>
        <Text style={styles.description}>
          Don't let your streak break! Purchase a streak freeze to protect your progress for one day.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.option, styles.adOption]}
            onPress={() => handlePurchase('ad')}
            disabled={loading}
          >
            <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
            <Text style={styles.optionText}>Watch Ad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.coinsOption]}
            onPress={() => handlePurchase('coins')}
            disabled={loading}
          >
            <MaterialCommunityIcons name="coin" size={24} color="#fff" />
            <Text style={styles.optionText}>Use 50 Coins</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 15,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    minWidth: 140,
    justifyContent: 'center',
  },
  adOption: {
    backgroundColor: '#4ECDC4',
    marginRight: 10,
  },
  coinsOption: {
    backgroundColor: '#FFD93D',
    marginLeft: 10,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
}); 