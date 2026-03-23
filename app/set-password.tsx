import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLockStore, verifyPassword } from '../src/store/lockStore';
import { Keypad } from '../src/components/Keypad';
import { PinDots } from '../src/components/PinDots';

export default function SetPasswordScreen() {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useLockStore();
  const router = useRouter();

  const handleKey = (key: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + key);
      setHasError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setHasError(false);
  };

  const handleSubmit = async () => {
    if (pin.length < 4 || isLoading) return;
    setIsLoading(true);
    const correct = await verifyPassword(pin);
    setIsLoading(false);

    if (correct) {
      await dispatch('PASSWORD_SUBMITTED', pin);
      router.replace('/confirm-password');
    } else {
      setHasError(true);
      setPin('');
    }
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
        <Text style={styles.title}>Change PIN</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.instruction}>Enter your current PIN</Text>
        <PinDots length={pin.length} hasError={hasError} />
        {hasError && (
          <Text style={styles.errorText}>Incorrect PIN. Try again.</Text>
        )}
      </View>

      {/* Keypad */}
      <Keypad onPress={handleKey} onDelete={handleDelete} />

      {/* Continue */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (pin.length < 4 || isLoading) && styles.continueButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={pin.length < 4 || isLoading}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.continueButtonText,
              (pin.length < 4 || isLoading) && styles.continueButtonTextDisabled,
            ]}
          >
            {isLoading ? 'Verifying...' : 'Continue'}
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
  errorText: {
    color: '#ff453a',
    fontSize: 14,
    fontFamily: 'System',
    marginTop: -12,
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
