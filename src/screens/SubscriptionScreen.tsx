import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getSubscriptionTiers, getUserSubscriptionStatus, createSubscription } from '../utils/subscription';
import { SubscriptionTierData } from '../types/subscription';
import AnimatedSubscriptionCard from '../components/AnimatedSubscriptionCard';
import { subscriptionAnalytics } from '../utils/subscriptionAnalytics';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [tiers, setTiers] = useState<SubscriptionTierData[]>([]);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTierData | null>(null);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
    // Track when users view the subscription plans
    subscriptionAnalytics.trackViewPlans();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [availableTiers, subscriptionStatus] = await Promise.all([
        getSubscriptionTiers(),
        getUserSubscriptionStatus()
      ]);

      setTiers(availableTiers);
      if (subscriptionStatus) {
        setCurrentTier(subscriptionStatus.tier_name);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleTierSelect = (tier: SubscriptionTierData) => {
    if (tier.name === currentTier) {
      Alert.alert('Current Plan', 'You are already subscribed to this plan');
      return;
    }
    setSelectedTier(tier);
    // Track when users select a plan
    subscriptionAnalytics.trackSelectPlan(tier.id, tier.name, tier.price);
  };

  const handleSubscribe = async () => {
    if (!selectedTier) return;

    try {
      setLoading(true);
      await createSubscription(selectedTier.id);
      // Track successful subscription
      await subscriptionAnalytics.trackSubscribe(
        selectedTier.id,
        selectedTier.name,
        selectedTier.price
      );
      
      Alert.alert(
        'Success',
        `Successfully subscribed to ${selectedTier.name}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating subscription:', error);
      // Track failed subscription attempt
      await subscriptionAnalytics.trackPaymentFailed(
        selectedTier.id,
        selectedTier.name,
        error instanceof Error ? error.message : 'Unknown error'
      );
      Alert.alert('Error', 'Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Plan</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>
          Unlock more features and accelerate your Papiamento learning journey
        </Text>

        {tiers.map((tier, index) => (
          <AnimatedSubscriptionCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTier?.id === tier.id}
            onSelect={handleTierSelect}
            isCurrentTier={tier.name === currentTier}
            index={index}
          />
        ))}

        <View style={styles.infoSection}>
          <MaterialCommunityIcons name="information" size={24} color="#666" />
          <Text style={styles.infoText}>
            All plans include access to our community and basic learning features.
            Choose the plan that best fits your learning goals!
          </Text>
        </View>
      </ScrollView>

      {selectedTier && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <Text style={styles.subscribeButtonText}>
              Subscribe to {selectedTier.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  subscribeButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 