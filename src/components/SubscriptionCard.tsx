import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SubscriptionTierData } from '../types/subscription';

interface SubscriptionCardProps {
  tier: SubscriptionTierData;
  isSelected?: boolean;
  onSelect: (tier: SubscriptionTierData) => void;
  isCurrentTier?: boolean;
}

export default function SubscriptionCard({ 
  tier, 
  isSelected, 
  onSelect,
  isCurrentTier 
}: SubscriptionCardProps) {
  const isElite = tier.name === 'Elite' || tier.name === 'Elite Monthly';
  const isPremium = tier.name === 'Premium';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isElite && styles.eliteContainer,
        isPremium && styles.premiumContainer,
        isCurrentTier && styles.currentTierContainer
      ]}
      onPress={() => onSelect(tier)}
    >
      {isCurrentTier && (
        <View style={styles.currentTierBadge}>
          <Text style={styles.currentTierText}>Current Plan</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[
          styles.title,
          isElite && styles.eliteTitle,
          isPremium && styles.premiumTitle
        ]}>
          {tier.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${tier.price}</Text>
          {tier.is_recurring && (
            <Text style={styles.period}>/month</Text>
          )}
        </View>
      </View>

      <Text style={styles.description}>{tier.description}</Text>

      <View style={styles.features}>
        {tier.features.lessons?.map((lesson, index) => (
          <View key={index} style={styles.featureRow}>
            <MaterialCommunityIcons 
              name="check-circle" 
              size={20} 
              color={isElite ? '#FFD93D' : isPremium ? '#4ECDC4' : '#FF6B6B'} 
            />
            <Text style={styles.featureText}>{lesson}</Text>
          </View>
        ))}

        {tier.features.features?.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <MaterialCommunityIcons 
              name="check-circle" 
              size={20} 
              color={isElite ? '#FFD93D' : isPremium ? '#4ECDC4' : '#FF6B6B'} 
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}

        {tier.features.ai_features?.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <MaterialCommunityIcons 
              name="robot" 
              size={20} 
              color="#FFD93D" 
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}

        {tier.features.lifestyle_features?.map((feature, index) => (
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

      <TouchableOpacity
        style={[
          styles.selectButton,
          isSelected && styles.selectedButton,
          isElite && styles.eliteButton,
          isPremium && styles.premiumButton,
          isCurrentTier && styles.currentTierButton
        ]}
        onPress={() => onSelect(tier)}
      >
        <Text style={[
          styles.selectButtonText,
          isSelected && styles.selectedButtonText,
          isElite && styles.eliteButtonText,
          isPremium && styles.premiumButtonText,
          isCurrentTier && styles.currentTierButtonText
        ]}>
          {isCurrentTier ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#4ECDC4',
  },
  eliteContainer: {
    borderColor: '#FFD93D',
  },
  premiumContainer: {
    borderColor: '#4ECDC4',
  },
  currentTierContainer: {
    borderColor: '#FF6B6B',
  },
  currentTierBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentTierText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eliteTitle: {
    color: '#FFD93D',
  },
  premiumTitle: {
    color: '#4ECDC4',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  period: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  selectButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4ECDC4',
  },
  eliteButton: {
    backgroundColor: '#FFD93D',
  },
  premiumButton: {
    backgroundColor: '#4ECDC4',
  },
  currentTierButton: {
    backgroundColor: '#FF6B6B',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
  },
  eliteButtonText: {
    color: '#333',
  },
  premiumButtonText: {
    color: '#fff',
  },
  currentTierButtonText: {
    color: '#fff',
  },
}); 