import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SubscriptionTierData } from '../types/subscription';

interface AnimatedSubscriptionCardProps {
  tier: SubscriptionTierData;
  isSelected: boolean;
  onSelect: (tier: SubscriptionTierData) => void;
  isCurrentTier?: boolean;
  index: number;
}

export default function AnimatedSubscriptionCard({
  tier,
  isSelected,
  onSelect,
  isCurrentTier,
  index,
}: AnimatedSubscriptionCardProps) {
  const scaleAnim = new Animated.Value(1);
  const translateYAnim = new Animated.Value(50);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getTierColor = () => {
    if (tier.name === 'Elite' || tier.name === 'Elite Monthly') return '#FFD93D';
    if (tier.name === 'Premium') return '#4ECDC4';
    return '#FF6B6B';
  };

  const renderFeature = (feature: string, icon: string, color: string) => (
    <View key={feature} style={styles.featureRow}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
          opacity: opacityAnim,
          borderColor: getTierColor(),
        },
        isSelected && styles.selectedContainer,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => onSelect(tier)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.tierName, { color: getTierColor() }]}>
              {tier.name}
            </Text>
            <Text style={styles.price}>
              {tier.price === 0 ? 'Free' : `$${tier.price}/month`}
            </Text>
          </View>
          {isCurrentTier && (
            <View style={[styles.currentBadge, { backgroundColor: getTierColor() }]}>
              <Text style={styles.currentBadgeText}>Current Plan</Text>
            </View>
          )}
        </View>

        <Text style={styles.description}>{tier.description}</Text>

        <View style={styles.featuresContainer}>
          {tier.features.lessons?.map((lesson) =>
            renderFeature(lesson, 'book-open-variant', getTierColor())
          )}

          {tier.features.features?.map((feature) =>
            renderFeature(feature, 'check-circle', getTierColor())
          )}

          {tier.features.ai_features?.map((feature) =>
            renderFeature(feature, 'robot', '#FFD93D')
          )}

          {tier.features.lifestyle_features?.map((feature) =>
            renderFeature(feature, 'star', '#FFD93D')
          )}
        </View>

        <View style={[styles.selectButton, { backgroundColor: getTierColor() }]}>
          <Text style={styles.selectButtonText}>
            {isCurrentTier ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  touchable: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
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
  selectButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 