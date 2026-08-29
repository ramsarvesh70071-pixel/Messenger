import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function Dot({ delay, color, size }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(-5, { duration: 300 }), withTiming(0, { duration: 300 })), -1, false)
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

export default function TypingDots({ size = 6, color = '#aab2c8' }) {
  return (
    <View style={styles.row}>
      <Dot delay={0} color={color} size={size} />
      <Dot delay={150} color={color} size={size} />
      <Dot delay={300} color={color} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignItems: 'center' },
});
