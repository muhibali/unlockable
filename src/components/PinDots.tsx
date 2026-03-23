import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface PinDotsProps {
  length: number;
  maxLength?: number;
  hasError?: boolean;
}

export function PinDots({ length, maxLength = 6, hasError = false }: PinDotsProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [hasError]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < length && styles.dotFilled,
            hasError && i < length && styles.dotError,
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginVertical: 28,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3a3a3c',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  dotError: {
    backgroundColor: '#ff453a',
    borderColor: '#ff453a',
  },
});
