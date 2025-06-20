import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import NotificationCenter from '@/components/NotificationCenter';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
        }}
      />
      <NotificationCenter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
}); 