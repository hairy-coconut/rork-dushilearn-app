import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, isLoading, error, resetError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Reset error when component mounts
    resetError();
  }, []);

  useEffect(() => {
    // Redirect to onboarding if authenticated
    if (isAuthenticated) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated]);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters');
      return;
    }

    await signUp(email, password, name);
  };
  
  const handleTestSignup = async () => {
    setName('Test User');
    setEmail('test@example.com');
    setPassword('password');
    setTimeout(() => {
      signUp('test@example.com', 'password', 'Test User');
    }, 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sign Up</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/7niiuhw0axuryyp3p745i' }} 
          style={styles.logo} 
        />
        <Text style={styles.appName}>dushiLearn</Text>
        <Text style={styles.tagline}>Your daily dose of Papiamentu paradise 🌴</Text>
      </View>

      <View style={styles.formContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password (min. 6 characters)"
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <Text style={styles.termsText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>

        <TouchableOpacity 
          style={[styles.signupButton, isLoading && styles.disabledButton]} 
          onPress={handleSignup}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.signupButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.testSignupButton} 
          onPress={handleTestSignup}
          disabled={isLoading}
        >
          <Text style={styles.testSignupText}>Use Test Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  termsText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  testSignupButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
  },
  testSignupText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    padding: 8,
  },
  footerText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  loginText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});