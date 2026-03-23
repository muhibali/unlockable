# BLE Setup for Unlockable - Expo vs Bare React Native

## Current Setup: Managed Expo

The app is currently configured as a **managed Expo app**. This means:
- ✅ Easy to build and deploy
- ❌ Limited support for native modules like `react-native-ble-plx`

### What We Did
1. Made BLE gracefully fail-safe - the app won't crash if BLE isn't available
2. Moved `react-native-ble-plx` to `optionalDependencies` 
3. The app will work perfectly in **mock mode** on Expo builds

## For Testing/Development

### On Your Mac (Development)
```bash
npm install
expo start
# Press 'a' for Android or 'i' for iOS
```

### On Windows (What Your Friend Should Do)

#### Option A: Use Expo Go (Quickest)
```bash
cd unlockable
npm install
npx expo start
# Scan the QR code with Expo Go app on Android phone
```
This will work, but **BLE won't function** (it will silently skip).

#### Option B: Build an APK for Testing (Better)
```bash
cd unlockable
npm install
eas build --platform android --local
```
This requires:
- Node.js and npm installed
- EAS CLI: `npm install -g eas-cli`
- Expo account (free)

## For Production with Full BLE Support

You'll need to **eject to bare React Native** to get native Bluetooth support. This is a one-way process:

```bash
cd unlockable
npx expo prebuild --clean
npx expo run:android
```

After ejecting, you'll have an `android/` folder and can use full native modules.

### Steps to Eject:
1. Backup your project first
2. Run: `npx expo prebuild --clean`
3. This generates `android/` and `ios/` folders
4. Install Android SDK/NDK if needed
5. Run: `npx react-native run-android`

**Note:** Once you eject, you lose some Expo conveniences (like Expo updates), but gain full native control.

## Current Error Explanation

The error your friend saw:
```
PluginError: Failed to resolve plugin for module "react-native-ble-plx"
```

This happens because:
- `react-native-ble-plx` requires native compilation
- Expo managed builds don't have a plugin configuration for it
- Expo's EAS Build service couldn't find native bindings

## BLE Code Behavior

In `src/services/ble.ts`, the code now:

1. **On iOS/Android (with native support):**
   - Attempts to import and use `react-native-ble-plx`
   - Connects to your ESP32 servo motor via Bluetooth

2. **On Expo Web/Fallback (no native support):**
   - Logs warnings
   - App continues working in mock mode
   - BLE commands are silently skipped
   - UI updates still work normally

## Recommended Path Forward

| Scenario | Recommendation |
|----------|--------------|
| Testing on Windows | Use Expo Go app (easiest) or build APK with `eas build` |
| Production release | Eject to bare React Native + use `react-native-ble-plx` |
| Mac development | Current setup works great with `expo run:ios` |

## Commands Summary

```bash
# Current setup (Managed Expo)
npm install
expo start
expo run:android  # or :ios

# After ejecting (Bare React Native)
npx expo prebuild --clean
npx react-native run-android

# Using EAS for production builds
eas build --platform android --local
eas build --platform ios --local
```

Let me know if you want to proceed with Option A (Expo Go), Option B (EAS Build), or Option C (eject to bare React Native)!
