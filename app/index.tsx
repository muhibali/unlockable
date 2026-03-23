import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useLockStore } from '../src/store/lockStore';

export default function HomeScreen() {
  const { state, dispatch, isFirstLaunch, isReady, isConnected, connectBLE, disconnectBLE } = useLockStore();
  const router = useRouter();
  const navState = useRootNavigationState();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!navState?.key || !isReady) return;
    if (isFirstLaunch) { router.replace('/create-pin'); return; }
    if (state === 'ATTEMPT') router.replace('/attempt');
    else if (state === 'TIMEOUT') router.replace('/timeout');
    else if (state === 'SET_PASSWORD') router.replace('/set-password');
    else if (state === 'CONFIRM_PASSWORD') router.replace('/confirm-password');
  }, [state, navState?.key, isFirstLaunch, isReady]);

  const handleConnect = async () => {
    if (isConnected) { await disconnectBLE(); return; }
    setIsConnecting(true);
    await connectBLE();
    setIsConnecting(false);
  };

  const isUnlocked = state === 'UNLOCKED';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../unlockable-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* BLE status */}
        <TouchableOpacity style={styles.bleButton} onPress={handleConnect} activeOpacity={0.7}>
          {isConnecting ? (
            <ActivityIndicator size="small" color="#636366" />
          ) : (
            <View style={styles.bleInner}>
              <View style={[styles.bleDot, isConnected && styles.bleDotConnected]} />
              <Text style={[styles.bleText, isConnected && styles.bleTextConnected]}>
                {isConnected ? 'Connected' : 'Connect'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Center state display */}
      <View style={styles.center}>
        <View style={[styles.lockRing, isUnlocked && styles.lockRingActive]}>
          <Image
            source={isUnlocked
              ? require('../icons/unlocked-icon.png')
              : require('../icons/locked-icon.png')
            }
            style={styles.lockIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.stateLabel}>{isUnlocked ? 'Unlocked' : 'Locked'}</Text>
        <Text style={styles.stateSubtitle}>
          {isUnlocked ? 'The door is open' : 'The door is secured'}
        </Text>
        {!isConnected && (
          <Text style={styles.mockNote}>Hardware not connected · simulation mode</Text>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {!isUnlocked && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => dispatch('START_ATTEMPT')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Unlock</Text>
          </TouchableOpacity>
        )}

        {isUnlocked && (
          <TouchableOpacity
            style={styles.lockButton}
            onPress={() => dispatch('MANUAL_LOCK')}
            activeOpacity={0.85}
          >
            <Text style={styles.lockButtonText}>Lock</Text>
          </TouchableOpacity>
        )}

        {state === 'LOCKED' && (
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={() => dispatch('START_SET_PASSWORD')}
            activeOpacity={0.7}
          >
            <Text style={styles.ghostButtonText}>Change PIN</Text>
          </TouchableOpacity>
        )}
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
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  logo: {
    height: 32,
    width: 160,
  },
  bleButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  bleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3a3a3c',
  },
  bleDotConnected: {
    backgroundColor: '#30d158',
  },
  bleText: {
    color: '#3a3a3c',
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '500',
  },
  bleTextConnected: {
    color: '#30d158',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  lockRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: '#2c2c2e',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  lockRingActive: {
    borderColor: '#ffffff',
    backgroundColor: '#000000',
  },
  lockIcon: {
    width: 52,
    height: 52,
  },
  stateLabel: {
    color: '#ffffff',
    fontSize: 34,
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  stateSubtitle: {
    color: '#636366',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '400',
  },
  mockNote: {
    color: '#3a3a3c',
    fontSize: 12,
    fontFamily: 'System',
    marginTop: 12,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 52,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockButton: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
  lockButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#636366',
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '400',
  },
});
