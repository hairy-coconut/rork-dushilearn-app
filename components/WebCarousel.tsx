import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface WebCarouselProps {
  data: any[];
  renderItem: (item: any) => React.ReactNode;
  itemWidth?: number;
}

export const WebCarousel: React.FC<WebCarouselProps> = ({
  data,
  renderItem,
  itemWidth = screenWidth * 0.8,
}) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <div style={styles.scrollContainer}>
        {data.map((item, index) => (
          <div key={index} style={[styles.itemContainer, { width: itemWidth }]}>
            {renderItem({ item, index })}
          </div>
        ))}
      </div>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  scrollContainer: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  itemContainer: {
    scrollSnapAlign: 'center',
    flexShrink: 0,
  },
}); 