import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Leaderboard from '@/components/Leaderboard';
import FriendsList from '@/components/FriendsList';
import Colors from '@/constants/colors';

type Tab = 'leaderboard' | 'friends';

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');

  const renderTabButton = (tab: Tab, icon: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={activeTab === tab ? Colors.primary : Colors.text}
      />
      <Text
        style={[
          styles.tabLabel,
          activeTab === tab && styles.activeTabLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('leaderboard', 'trophy', 'Leaderboard')}
        {renderTabButton('friends', 'account-group', 'Friends')}
      </View>

      {activeTab === 'leaderboard' ? (
        <Leaderboard />
      ) : (
        <FriendsList />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: Colors.primary + '20',
  },
  tabLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
}); 