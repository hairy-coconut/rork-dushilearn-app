import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useProgressStore } from "@/store/progressStore";
import { useBadgeStore } from "@/store/badgeStore";

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
  const { user, login } = useAuthStore();
  const { syncWithSupabase: syncProgress } = useProgressStore();
  const { syncWithSupabase: syncBadges } = useBadgeStore();

  useEffect(() => {
    // Check if user is authenticated and if onboarding has been completed
    const checkAppState = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          // Set user in auth store
          if (profileData) {
            const user = {
              id: session.user.id,
              email: session.user.email || '',
              name: profileData.name || session.user.email?.split('@')[0] || 'User',
              avatarUrl: profileData.avatar_url,
            };
            
            // Update auth store
            login(user.email, ''); // This is just to set the user in the store
          }
          
          setIsAuthenticated(true);
          
          // Sync data from Supabase
          await syncProgress();
          await syncBadges();
        } else {
          setIsAuthenticated(false);
        }
        
        const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
        setIsOnboardingCompleted(onboardingCompleted === 'true');
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