import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLockStore } from '../src/store/lockStore';

export default function TimeoutScreen() {
  const { timeoutRemaining, state } = useLockStore();
  const router = useRouter();

  useEffect(() => {
    if (state === 'LOCKED') {
      router.replace('/');
    }
  }, [state]);

  const minutes = Math.floor(timeoutRemaining / 60);
  const seconds = timeoutRemaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconRing}>
          <Image
            source={require('../icons/locked-out-icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        {/* Text */}
        <Text style={styles.title}>Locked Out</Text>
        <Text style={styles.subtitle}>Too many failed attempts</Text>

        {/* Timer */}
        <View style={styles.timerCard}>
          <Text style={styles.timer}>{formatted}</Text>
          <Text style={styles.timerLabel}>remaining</Text>
        </View>

        <Text style={styles.hint}>
          Please wait for the timer to expire{'\n'}before trying again.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: '#2c2c2e',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  icon: {
    width: 52,
    height: 52,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    color: '#636366',
    fontSize: 16,
    fontFamily: 'System',
    marginBottom: 52,
  },
  timerCard: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timer: {
    color: '#ffffff',
    fontSize: 68,
    fontFamily: 'System',
    fontWeight: '100',
    letterSpacing: -2,
    marginBottom: 4,
  },
  timerLabel: {
    color: '#3a3a3c',
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  hint: {
    color: '#3a3a3c',
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 22,
  },
});
