import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Linking, Animated, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Gentle bounce animation for the logo
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
      delay: 300,
    }).start(() => {
      setIsReady(true);
    });
  }, []);

  const handleLoginPress = () => {
    if (isReady) {
      router.push('/login');
    }
  };

  const handleSignUpPress = () => {
    if (isReady) {
      router.push('/signup');
    }
  };

  const handleTommyCoconutPress = () => {
    if (isReady) {
      Linking.openURL('https://www.tommycoconut.com');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.Image 
          source={require('../assets/images/coco-mascot.png')}
          style={[styles.logo, { transform: [{ scale: logoScale }] }]} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>dushiLearn</Text>
        <Text style={styles.tagline}>Talk like a local. Learn with island vibes. 🌴</Text>
        <Text style={styles.microCopy}>Get ready—your tropical adventure begins!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.signupButton]} 
          onPress={handleSignUpPress}
          activeOpacity={0.8}
          disabled={!isReady}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]} 
          onPress={handleLoginPress}
          activeOpacity={0.8}
          disabled={!isReady}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.creatorLink} 
        onPress={handleTommyCoconutPress}
        disabled={!isReady}
      >
        <Text style={styles.creatorText}>
          Made with ❤️ by Tommy Coconut
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    maxWidth: '90%',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: 'auto',
    marginBottom: 40,
  },
  button: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signupButton: {
    backgroundColor: Colors.primary,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  creatorLink: {
    padding: 10,
  },
  creatorText: {
    fontSize: 14,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
  microCopy: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});