import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Colors from '../constants/colors';

type ProgressBarProps = {
  progress: number; // 0 to 1
  label?: string;
  color?: string;
  height?: number;
};

export default function ProgressBar({ 
  progress, 
  label, 
  color = Colors.primary,
  height = 8
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress, 0), 1) * 100;
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, { height }]}>
        <View 
          style={[
            styles.progress, 
            { 
              width: `${percentage}%`,
              backgroundColor: color,
              height
            }
          ]} 
        />
      </View>
      <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  track: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1,
  },
  progress: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
});