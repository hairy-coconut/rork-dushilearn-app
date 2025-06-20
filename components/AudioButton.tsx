import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { playAudio } from '@/constants/audio';

type AudioButtonProps = {
  audioUrl: string;
  size?: number;
  color?: string;
};

export default function AudioButton({ 
  audioUrl, 
  size = 24, 
  color = Colors.primary 
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlay = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    await playAudio(audioUrl);
    setIsPlaying(false);
  };
  
  return (
    <TouchableOpacity 
      style={[styles.button, { width: size * 1.5, height: size * 1.5 }]} 
      onPress={handlePlay}
      disabled={isPlaying}
    >
      {isPlaying ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <MaterialIcons name="volume-up" size={size} color={color} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});