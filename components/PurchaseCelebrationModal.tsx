import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { ShopItem } from '../utils/shop';

const { width } = Dimensions.get('window');

const RARITY_GRADIENTS = {
  common: ['#4a4a4a', '#2a2a2a'],
  rare: ['#4a90e2', '#2a5298'],
  epic: ['#9b4dca', '#6a1b9a'],
  legendary: ['#ffd700', '#ff8c00'],
};

interface PurchaseCelebrationModalProps {
  visible: boolean;
  item: ShopItem | null;
  onClose: () => void;
}

export const PurchaseCelebrationModal: React.FC<PurchaseCelebrationModalProps> = ({ visible, item, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible && item) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound();
      setTimeout(() => {
        confettiRef.current && confettiRef.current.start();
      }, 300);
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
    // eslint-disable-next-line
  }, [visible, item]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/success.mp3'),
        { shouldPlay: true }
      );
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch {}
  };

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={RARITY_GRADIENTS[item.rarity] || RARITY_GRADIENTS.common}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={56}
                color="#fff"
                style={styles.icon}
              />
              <View style={styles.rarityBadge}>
                <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.title}>Congratulations!</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <ConfettiCannon
              count={80}
              origin={{ x: width / 2, y: 0 }}
              autoStart={false}
              fadeOut
              ref={confettiRef}
            />
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.85,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  rarityBadge: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  itemName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    color: '#fff',
    fontSize: 15,
    opacity: 0.9,
    marginBottom: 18,
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 4,
  },
}); 