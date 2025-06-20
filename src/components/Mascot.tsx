import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, shadows } from '../theme';

export type MascotType = 'coco' | 'lora';
export type MascotExpression = 'happy' | 'excited' | 'thinking' | 'surprised' | 'sad';

interface MascotProps {
  type: MascotType;
  expression: MascotExpression;
  size?: 'small' | 'medium' | 'large';
  floating?: boolean;
  onAnimationFinish?: () => void;
}

const mascotAnimations = {
  coco: {
    happy: require('../assets/animations/coco-happy.json'),
    excited: require('../assets/animations/coco-excited.json'),
    thinking: require('../assets/animations/coco-thinking.json'),
    surprised: require('../assets/animations/coco-surprised.json'),
    sad: require('../assets/animations/coco-sad.json'),
  },
  lora: {
    happy: require('../assets/animations/lora-happy.json'),
    excited: require('../assets/animations/lora-excited.json'),
    thinking: require('../assets/animations/lora-thinking.json'),
    surprised: require('../assets/animations/lora-surprised.json'),
    sad: require('../assets/animations/lora-sad.json'),
  },
};

const sizeMap = {
  small: 80,
  medium: 120,
  large: 160,
};

export default function Mascot({
  type,
  expression,
  size = 'medium',
  floating = false,
  onAnimationFinish,
}: MascotProps) {
  const floatAnim = new Animated.Value(0);

  useEffect(() => {
    if (floating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [floating]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          width: sizeMap[size],
          height: sizeMap[size],
        },
      ]}
    >
      <View style={[styles.mascotContainer, shadows.base]}>
        <LottieView
          source={mascotAnimations[type][expression]}
          autoPlay
          loop={expression !== 'excited' && expression !== 'surprised'}
          style={styles.animation}
          onAnimationFinish={onAnimationFinish}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: 8,
    ...shadows.base,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
}); 