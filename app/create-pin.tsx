import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLockStore } from '../src/store/lockStore';
import { Keypad } from '../src/components/Keypad';
import { PinDots } from '../src/components/PinDots';

export default function CreatePinScreen() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { completeFirstLaunch } = useLockStore();
  const router = useRouter();

  const handleKey = (key: string) => {
    if (pin.length < 4) setPin(prev => prev + key);
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const handleSubmit = async () => {
    if (pin.length < 4 || isLoading) return;
    setIsLoading(true);
    await completeFirstLaunch(pin);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../unlockable-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title}>Create your PIN</Text>
        <Text style={styles.subtitle}>You'll use this to unlock the door</Text>
        <PinDots length={pin.length} />
      </View>

      {/* Keypad */}
      <Keypad onPress={handleKey} onDelete={handleDelete} />

      {/* Save */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (pin.length < 4 || isLoading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={pin.length < 4 || isLoading}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.saveButtonText,
              (pin.length < 4 || isLoading) && styles.saveButtonTextDisabled,
            ]}
          >
            {isLoading ? 'Saving...' : 'Set PIN'}
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
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  logo: {
    height: 32,
    width: 160,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    color: '#636366',
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '400',
    marginBottom: 4,
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
