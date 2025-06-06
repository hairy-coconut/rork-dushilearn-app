import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');
const CONFETTI_COLORS = [Colors.primary, Colors.secondary, Colors.success, '#FFD700', '#FF6B6B'];
const CONFETTI_COUNT = 50;

type ConfettiPieceProps = {
  color: string;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  size: number;
};

const ConfettiPiece = ({ color, x, y, rotation, size }: ConfettiPieceProps) => {
  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          width: size,
          height: size / 2,
          transform: [
            { translateX: x },
            { translateY: y },
            { rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            }
          ],
        },
      ]}
    />
  );
};

type ConfettiEffectProps = {
  visible: boolean;
  onComplete?: () => void;
};

export default function ConfettiEffect({ visible, onComplete }: ConfettiEffectProps) {
  const confettiPieces = useRef<Array<{
    x: Animated.Value;
    y: Animated.Value;
    rotation: Animated.Value;
    color: string;
    size: number;
  }>>([]);
  
  // Initialize confetti pieces
  useEffect(() => {
    if (visible && confettiPieces.current.length === 0) {
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        confettiPieces.current.push({
          x: new Animated.Value(Math.random() * width),
          y: new Animated.Value(-20),
          rotation: new Animated.Value(0),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          size: Math.random() * 10 + 5,
        });
      }
      
      // Start animation
      const animations = confettiPieces.current.map((piece) => {
        const duration = Math.random() * 3000 + 2000;
        return Animated.parallel([
          Animated.timing(piece.y, {
            toValue: height + 20,
            duration,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(piece.rotation, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        ]);
      });
      
      Animated.stagger(100, animations).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece, index) => (
        <ConfettiPiece
          key={index}
          color={piece.color}
          x={piece.x}
          y={piece.y}
          rotation={piece.rotation}
          size={piece.size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});