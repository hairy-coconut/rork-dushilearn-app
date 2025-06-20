import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const UPSELL_MODALS = {
  premiumTease: {
    title: 'Ready for More?',
    message: 'Unlock Premium lessons and learn how to charm locals!',
    cta: 'Upgrade to Premium',
  },
  premiumHardSell: {
    title: 'Take Your Skills to the Next Level',
    message: 'Join Premium and master Papiamentu with advanced lessons.',
    cta: 'Join Premium Now',
  },
  eliteTease: {
    title: 'Ready to Practice with Locals?',
    message: 'Join Elite and connect with native speakers for real-world practice.',
    cta: 'Join Elite Now',
  },
};

interface UpsellModalScreenProps {
  modalType: keyof typeof UPSELL_MODALS;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function UpsellModalScreen({ modalType, onClose, onUpgrade }: UpsellModalScreenProps) {
  const modal = UPSELL_MODALS[modalType];

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={[colors.aqua, colors.coral, colors.banana]}
          style={styles.modalContent}
        >
          <Text style={styles.header}>{modal.title}</Text>
          <Text style={styles.message}>{modal.message}</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={onUpgrade}>
            <Text style={styles.ctaButtonText}>{modal.cta}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Not Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  header: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['3xl'],
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  message: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.jungle,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  ctaButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
  },
  closeButton: {
    paddingVertical: spacing.sm,
  },
  closeButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.surface,
  },
}); 