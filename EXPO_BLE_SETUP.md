# Unlockable - Building on Windows

## The Problem
`react-native-ble-plx` requires native code compilation that Expo's managed workflow doesn't easily support on Windows.

## The Solution: Use EAS Build (Recommended)

EAS Build is Expo's cloud service that handles all the native compilation for you. No need to deal with Gradle, Android SDK, or native linking locally.

### Quick Setup

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo (free account):**
   ```bash
   eas login
   # or eas register if you don't have an account
   ```

3. **Initialize EAS in your project:**
   ```bash
   cd unlockable
   eas build:configure
   # Just press Enter to use defaults
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android
   ```

5. **Build for iOS (on Mac):**
   ```bash
   eas build --platform ios
   ```

This creates an APK that will be emailed to you (or available in the EAS dashboard) with **full native BLE support included**.

### Why This Works

- ✅ EAS handles all Gradle/native compilation complexity
- ✅ Builds run on Expo's servers (not your machine)
- ✅ `react-native-ble-plx` native bindings are automatically included
- ✅ Works perfectly from Windows/Mac/Linux

### Troubleshooting

If you see "Deprecated Gradle features" warnings, that's normal - EAS manages the Gradle setup and handles all deprecation warnings internally.

---

## Alternative: For Development Testing Only

If you just want to test the UI without BLE functionality:

```bash
cd unlockable
npm install
npx expo start
# Scan QR with Expo Go app on your phone
```

This runs in Expo Go which doesn't support native modules, so BLE won't work, but all UI will function normally.

---

## If Your Friend Already Ran Prebuild

If they already ran `npx expo prebuild` and see the `android/` folder, they can either:

**Option A: Clean it up and use EAS instead**
```bash
rm -rf android/ ios/
# Then follow the EAS Build steps above
```

**Option B: Continue with Gradle (more complex)**
Would need to fix Gradle version issues locally - not recommended on Windows.

---

## Recommended Workflow

| What | How |
|------|-----|
| Dev testing (no BLE) | `expo start` + Expo Go app |
| Production build (with BLE) | `eas build --platform android` |
| Testing on specific device | Build APK with EAS, install on phone |

## Cost

- ✅ Free tier: 30 builds/month with EAS
- ✅ All development builds are free
- ✅ Only pay if you want unlimited production builds ($99/month)

Let me know if you need help setting up EAS or have any issues!
