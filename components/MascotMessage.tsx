import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { mascots, mascotTips } from '@/constants/mascots';

type MascotMessageProps = {
  type: 'coco' | 'lora';
  lessonType?: string;
  message?: string;
  onDismiss: () => void;
  autoHide?: boolean;
};

export default function MascotMessage({ 
  type, 
  lessonType, 
  message, 
  onDismiss,
  autoHide = true
}: MascotMessageProps) {
  const [opacity] = useState(new Animated.Value(0));
  const mascot = mascots[type];
  
  // If no message is provided, get a random one based on the mascot and lesson type
  const getMessage = () => {
    if (message) return message;
    
    if (lessonType && mascotTips[lessonType as keyof typeof mascotTips]) {
      const tips = mascotTips[lessonType as keyof typeof mascotTips];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    
    return mascot.greetings[Math.floor(Math.random() * mascot.greetings.length)];
  };
  
  useEffect(() => {
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto-hide after 5 seconds if enabled
    if (autoHide) {
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.messageContainer}>
        <Image 
          source={{ uri: mascot.image }} 
          style={styles.mascotImage} 
        />
        <View style={styles.textContainer}>
          <Text style={styles.mascotName}>{mascot.name}</Text>
          <Text style={styles.message}>{getMessage()}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <MaterialIcons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  messageContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  mascotImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  mascotName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
});