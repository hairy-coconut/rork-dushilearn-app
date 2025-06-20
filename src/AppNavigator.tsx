import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import PricingScreen from './screens/PricingScreen';
import LandingScreen from './screens/LandingScreen';
// Placeholder screens for now
const LessonsScreen = () => <View style={styles.screen}><></></View>;
const ProgressScreen = () => <View style={styles.screen}><></></View>;
const ProfileScreen = () => <View style={styles.screen}><></></View>;
import BottomNavBar from './components/BottomNavBar';
import { colors } from './theme';

const SCREENS = {
  Home: HomeScreen,
  Lessons: LessonsScreen,
  Progress: ProgressScreen,
  Profile: ProfileScreen,
  Pricing: PricingScreen,
  Landing: LandingScreen,
};

type TabKey = keyof typeof SCREENS;

export default function AppNavigator() {
  const [currentTab, setCurrentTab] = useState<TabKey>('Home');
  const ScreenComponent = SCREENS[currentTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenComponent />
        <BottomNavBar currentTab={currentTab} onTabPress={setCurrentTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
}); 