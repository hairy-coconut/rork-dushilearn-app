import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SubscriptionStatus } from '../types/subscription';

interface SubscriptionStatusProps {
  status: SubscriptionStatus;
  onUpgradePress: () => void;
}

export default function SubscriptionStatus({ status, onUpgradePress }: SubscriptionStatusProps) {
  const isElite = status.tier_name === 'Elite' || status.tier_name === 'Elite Monthly';
  const isPremium = status.tier_name === 'Premium';

  const getTierColor = () => {
    if (isElite) return '#FFD93D';
    if (isPremium) return '#4ECDC4';
    return '#FF6B6B';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tierInfo}>
          <Text style={[styles.tierName, { color: getTierColor() }]}>
            {status.tier_name}
          </Text>
          <Text style={styles.tierDescription}>
            {status.tier_description}
          </Text>
        </View>
        {!isElite && (
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: getTierColor() }]}
            onPress={onUpgradePress}
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <Text style={styles.detailText}>
            Valid until {formatDate(status.end_date)}
          </Text>
        </View>

        {status.is_recurring && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="refresh" size={20} color="#666" />
            <Text style={styles.detailText}>Auto-renewing subscription</Text>
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Your Features</Text>
          {status.features.lessons?.map((lesson, index) => (
            <View key={index} style={styles.featureRow}>
              <MaterialCommunityIcons 
                name="book-open-variant" 
                size={20} 
                color={getTierColor()} 
              />
              <Text style={styles.featureText}>{lesson}</Text>
            </View>
          ))}

          {status.features.features?.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={getTierColor()} 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}

          {status.features.ai_features?.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <MaterialCommunityIcons 
                name="robot" 
                size={20} 
                color="#FFD93D" 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}

          {status.features.lifestyle_features?.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <MaterialCommunityIcons 
                name="star" 
                size={20} 
                color="#FFD93D" 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
  },
  upgradeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  featuresSection: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
}); 