import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

export default function SplashScreen() {
  const router = useRouter();

  const handleLoginPress = () => {
    router.push('/login');
  };

  const handleSignUpPress = () => {
    router.push('/signup');
  };

  const handleTommyCoconutPress = () => {
    Linking.openURL('https://www.tommycoconut.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://i.imgur.com/Yx2JQL0.png' }} 
          style={styles.logo} 
        />
        <Text style={styles.appName}>dushiLearn</Text>
        <Text style={styles.tagline}>Learn Papiamento the fun way!</Text>
      </View>

      <TouchableOpacity 
        style={styles.creatorLink} 
        onPress={handleTommyCoconutPress}
      >
        <Text style={styles.creatorText}>
          Made with ❤️ by Tommy Coconut
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]} 
          onPress={handleLoginPress}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.signupButton]} 
          onPress={handleSignUpPress}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: Colors.textLight,
  },
  creatorLink: {
    marginBottom: 60,
    padding: 10,
  },
  creatorText: {
    fontSize: 16,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: Colors.primary,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});