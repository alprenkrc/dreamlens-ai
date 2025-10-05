import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export default function AnimatedBackground() {
  const animationValue = useSharedValue(0);
  
  const stars: Star[] = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.8 + 0.2,
  }));

  useEffect(() => {
    animationValue.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animationValue.value, [0, 1], [0.3, 0.8]),
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0A2E', '#2D1B69', '#6B46C1', '#8B5CF6']}
        style={styles.gradient}
      />
      
      {/* Animated Stars */}
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            animatedStyle,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
});