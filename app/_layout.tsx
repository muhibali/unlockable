import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useLockStore } from '../src/store/lockStore';

export default function RootLayout() {
  const initialize = useLockStore(s => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'ios_from_right',
        }}
      />
    </View>
  );
}
