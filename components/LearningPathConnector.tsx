import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LearningPathConnectorProps {
    status: 'locked' | 'available' | 'completed';
    isLast?: boolean;
    index: number;
}

export default function LearningPathConnector({
    status,
    isLast,
    index,
}: LearningPathConnectorProps) {
    const { theme } = useTheme();
    const widthAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
            delay: index * 100,
        }).start();
    }, []);

    const getConnectorColor = () => {
        switch (status) {
            case 'locked':
                return '#666666';
            case 'available':
                return theme.colors.primary;
            case 'completed':
                return '#4CAF50';
        }
    };

    if (isLast) return null;

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.connector,
                    {
                        backgroundColor: getConnectorColor(),
                        width: widthAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        }),
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 4,
    },
    connector: {
        height: '100%',
    },
}); 