import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserSubscriptionStatus, cancelSubscription, updateSubscription } from '../utils/subscription';
import { SubscriptionStatus } from '../types/subscription';
import SubscriptionStatusComponent from '../components/SubscriptionStatus';
import { subscriptionAnalytics } from '../utils/subscriptionAnalytics';

export default function SubscriptionManagementScreen() {
  const navigation = useNavigation();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await getUserSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error('Error loading subscription status:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (subscription) {
      // Track upgrade attempt
      subscriptionAnalytics.trackUpgrade(
        'upgrade_flow',
        'Upgrade Flow',
        subscription.tier_id,
        subscription.tier_name
      );
    }
    navigation.navigate('Subscription' as never);
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await cancelSubscription();
              // Track successful cancellation
              await subscriptionAnalytics.trackCancel(
                subscription.tier_id,
                subscription.tier_name
              );
              await loadSubscriptionStatus();
              Alert.alert('Success', 'Your subscription has been cancelled');
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdatePaymentMethod = () => {
    // TODO: Implement payment method update
    Alert.alert('Coming Soon', 'Payment method update will be available soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Subscription</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.noSubscriptionText}>
            You don't have an active subscription
          </Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.subscribeButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.title}>Subscription</Text>
      </View>

      <ScrollView style={styles.content}>
        <SubscriptionStatusComponent
          status={subscription}
          onUpgradePress={handleUpgrade}
        />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleUpdatePaymentMethod}
          >
            <MaterialCommunityIcons name="credit-card" size={24} color="#4ECDC4" />
            <Text style={styles.actionButtonText}>Update Payment Method</Text>
          </TouchableOpacity>

          {subscription.is_recurring && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelSubscription}
            >
              <MaterialCommunityIcons name="close-circle" size={24} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoSection}>
          <MaterialCommunityIcons name="information" size={24} color="#666" />
          <Text style={styles.infoText}>
            {subscription.is_recurring
              ? 'Your subscription will automatically renew at the end of each billing period.'
              : 'Your subscription will expire at the end of the current period.'}
          </Text>
        </View>
      </ScrollView>
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
  noSubscriptionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    borderBottomWidth: 0,
  },
  cancelButtonText: {
    color: '#FF6B6B',
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
}); 