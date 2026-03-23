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

export default function ConfirmPasswordScreen() {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const { dispatch, pendingPassword } = useLockStore();
  const router = useRouter();

  const handleKey = (key: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + key);
      setHasError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setHasError(false);
  };

  const handleSubmit = async () => {
    if (pin.length < 4) return;

    if (pin === pendingPassword) {
      await dispatch('CONFIRM_PASSWORD_MATCH', pin);
      router.replace('/');
    } else {
      setHasError(true);
      setPin('');
      await dispatch('CONFIRM_PASSWORD_MISMATCH');
      router.replace('/set-password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { dispatch('CONFIRM_PASSWORD_MISMATCH'); router.replace('/set-password'); }}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm PIN</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.instruction}>Re-enter your new PIN</Text>
        <PinDots length={pin.length} hasError={hasError} />
        {hasError && (
          <Text style={styles.errorText}>PINs don't match. Try again.</Text>
        )}
      </View>

      {/* Keypad */}
      <Keypad onPress={handleKey} onDelete={handleDelete} />

      {/* Save */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            pin.length < 4 && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={pin.length < 4}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.saveButtonText,
              pin.length < 4 && styles.saveButtonTextDisabled,
            ]}
          >
            Save PIN
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
  backButton: {},
  backText: {
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
  saveButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#1c1c1e',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#3a3a3c',
  },
});
