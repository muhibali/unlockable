import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Platform } from 'react-native';

interface KeypadProps {
  onPress: (key: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['', '⌫', ''],
];

export function Keypad({ onPress, onDelete, disabled = false }: KeypadProps) {
  const handlePress = (key: string) => {
    if (disabled) return;
    if (Platform.OS === 'ios') Vibration.vibrate(10);
    if (key === '⌫') onDelete();
    else onPress(key);
  };

  return (
    <View style={styles.container}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, colIndex) => {
            if (key === '') return <View key={colIndex} style={styles.placeholder} />;
            const isDelete = key === '⌫';
            return (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.key,
                  isDelete && styles.deleteKey,
                  disabled && styles.keyDisabled,
                ]}
                onPress={() => handlePress(key)}
                activeOpacity={0.6}
                disabled={disabled}
              >
                <Text style={[styles.keyText, isDelete && styles.deleteText, disabled && styles.textDisabled]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 76,
    height: 76,
  },
  deleteKey: {
    backgroundColor: 'transparent',
  },
  keyDisabled: {
    opacity: 0.3,
  },
  keyText: {
    color: '#ffffff',
    fontSize: 26,
    fontFamily: 'System',
    fontWeight: '300',
  },
  deleteText: {
    color: '#8e8e93',
    fontSize: 22,
    fontWeight: '400',
  },
  textDisabled: {
    color: '#555555',
  },
});
