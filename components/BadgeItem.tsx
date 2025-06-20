import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Colors from '../constants/colors';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
};

type BadgeItemProps = {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
};

export default function BadgeItem({ badge, size = 'medium' }: BadgeItemProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 60;
      case 'large':
        return 100;
      default:
        return 80;
    }
  };
  
  const badgeSize = getSize();
  
  return (
    <View style={[
      styles.container,
      !badge.earned && styles.unearnedContainer
    ]}>
      <View style={[
        styles.badgeCircle,
        { width: badgeSize, height: badgeSize },
        !badge.earned && styles.unearnedBadge
      ]}>
        <Image 
          source={{ uri: badge.icon }} 
          style={[
            styles.badgeIcon,
            { width: badgeSize * 0.6, height: badgeSize * 0.6 },
            !badge.earned && styles.unearnedIcon
          ]} 
        />
      </View>
      <Text style={[
        styles.badgeName,
        !badge.earned && styles.unearnedText
      ]}>
        {badge.name}
      </Text>
      {size !== 'small' && (
        <Text style={[
          styles.badgeDescription,
          !badge.earned && styles.unearnedText
        ]}>
          {badge.description}
        </Text>
      )}
      {badge.earned && badge.earnedDate && size !== 'small' && (
        <Text style={styles.earnedDate}>
          Earned on {badge.earnedDate}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  unearnedContainer: {
    opacity: 0.7,
  },
  badgeCircle: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unearnedBadge: {
    backgroundColor: Colors.inactive,
    shadowColor: 'rgba(0,0,0,0.1)',
  },
  badgeIcon: {
    tintColor: 'white',
  },
  unearnedIcon: {
    tintColor: '#E0E0E0',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  earnedDate: {
    fontSize: 10,
    color: Colors.success,
    marginTop: 4,
  },
  unearnedText: {
    color: Colors.inactive,
  },
});