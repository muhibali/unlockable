import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLockStore } from '../src/store/lockStore';
import { Keypad } from '../src/components/Keypad';
import { PinDots } from '../src/components/PinDots';

export default function SetPasswordScreen() {
  const [pin, setPin] = useState('');
  const { dispatch } = useLockStore();
  const router = useRouter();

  const handleKey = (key: string) => {
    if (pin.length < 6) setPin(prev => prev + key);
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    await dispatch('PASSWORD_SUBMITTED', pin);
    router.replace('/confirm-password');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { dispatch('MANUAL_LOCK'); router.replace('/'); }}
          style={styles.cancelButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Set PIN</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.instruction}>Choose a new PIN (4–6 digits)</Text>
        <PinDots length={pin.length} />
      </View>

      {/* Keypad */}
      <Keypad onPress={handleKey} onDelete={handleDelete} />

      {/* Continue */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            pin.length < 4 && styles.continueButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={pin.length < 4}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.continueButtonText,
              pin.length < 4 && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cancelButton: {},
  cancelText: {
    color: '#636366',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '400',
  },
  title: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 60,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  instruction: {
    color: '#636366',
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '400',
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 52,
    paddingTop: 20,
  },
  continueButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#1c1c1e',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#3a3a3c',
  },
});
