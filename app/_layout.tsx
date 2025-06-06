import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "splash",
};

export default function RootLayout() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated and if onboarding has been completed
    const checkAppState = async () => {
      try {
        const [onboardingCompleted, userAuthenticated] = await Promise.all([
          AsyncStorage.getItem('onboarding_completed'),
          AsyncStorage.getItem('user_authenticated')
        ]);
        
        setIsOnboardingCompleted(onboardingCompleted === 'true');
        setIsAuthenticated(userAuthenticated === 'true');
      } catch (error) {
        console.error('Error checking app state:', error);
        setIsOnboardingCompleted(false);
        setIsAuthenticated(false);
      }
    };

    // Hide the splash screen after a delay
    const hideSplash = async () => {
      await checkAppState();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);

  // Wait until we know the app state
  if (isOnboardingCompleted === null || isAuthenticated === null) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.background,
            },
            headerShadowVisible: false,
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: Colors.background,
            },
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen 
                name="splash" 
                options={{ 
                  headerShown: false,
                  animation: 'fade',
                }} 
              />
              <Stack.Screen 
                name="login" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="signup" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
            </>
          ) : !isOnboardingCompleted ? (
            <Stack.Screen 
              name="onboarding" 
              options={{ 
                headerShown: false,
                animation: 'fade',
              }} 
            />
          ) : (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="lesson/[id]" 
                options={{ 
                  title: "Lesson",
                  presentation: 'card',
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="vocabulary/[id]" 
                options={{ 
                  title: "Vocabulary",
                  presentation: 'card',
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="badges" 
                options={{ 
                  title: "My Badges",
                  presentation: 'card',
                  animation: 'slide_from_bottom',
                }} 
              />
            </>
          )}
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}