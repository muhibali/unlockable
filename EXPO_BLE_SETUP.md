# Unlockable — Building on Windows (Android)

## Why you can't just use Expo Go

`react-native-ble-plx` is a native module. Expo Go doesn't include it, so BLE will never
work inside Expo Go — the Connect button will always fail silently. You need a proper build.

---

## Step 1 — Install prerequisites (one time)

1. Install **Node.js LTS** from https://nodejs.org
2. Install **Git** from https://git-scm.com
3. Install **EAS CLI** globally:
   ```
   npm install -g eas-cli
   ```

---

## Step 2 — Get the project

```
git clone <repo-url>
cd unlockable
npm install --legacy-peer-deps
```

---

## Step 3 — Create a free Expo account

Go to https://expo.dev and sign up (free). Then in the terminal:

```
eas login
```

---

## Step 4 — Link the project to your Expo account

Run this once inside the project folder:

```
eas build:configure
```

When prompted:
- **"Which platforms"** → select `Android`
- Accept all defaults / press Enter for everything else

This updates `eas.json` with your account details.

---

## Step 5 — Build the APK (runs on Expo's servers, not your PC)

```
eas build --profile preview --platform android
```

- The build runs in the cloud — you do NOT need Android Studio installed
- It takes ~5–10 minutes
- When finished, a **download link** appears in the terminal (also visible at https://expo.dev under your account)

> **Important:** use `--profile preview` — this produces an `.apk` file you can install
> directly. The default production build produces an `.aab` (App Bundle) that cannot be
> sideloaded onto a phone.

---

## Step 6 — Install on your Android phone

1. Download the APK from the link shown in the terminal
2. On your phone: **Settings → Security → Install unknown apps** → allow your browser/Files app
3. Open the downloaded APK and tap Install

---

## Step 7 — Pair with the ESP32

1. Make sure the ESP32 is powered on and the Arduino sketch is flashed
2. Open the Unlockable app
3. Tap the **Connect** button (top-right of the home screen)
4. The app scans for a BLE device named `Unlockable`
5. Once found, the dot turns green and shows "Connected"

> If the button spins and times out:
> - Make sure the ESP32 is powered and the sketch is running
> - Make sure Bluetooth is on and location permission is granted on your phone
> - On Android 12+: Settings → Apps → Unlockable → Permissions → grant Location and Nearby Devices

---

## Rebuild after code changes

After any code change, just run the build command again:

```
eas build --profile preview --platform android
```

You don't need to reinstall EAS CLI or re-login each time.

---

## Two separate PINs — how they work

| | App PIN | Hardware PIN |
|---|---|---|
| Where set | In the app (first launch / Change PIN) | Hardcoded in Arduino sketch (`correctPassword`) |
| What it does | Authenticates you in the app, sends BLE UNLOCK command | Physical fallback via the 6 buttons on the device |
| Storage | iOS Keychain / Android Keystore (encrypted) | ESP32 RAM (resets to default on power cycle) |

The app PIN and the hardware PIN are **independent**. Changing one does not change the other.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `eas: command not found` | Run `npm install -g eas-cli` again |
| Build fails with "project not found" | Run `eas build:configure` again |
| APK installs but Connect always fails | Make sure you used `--profile preview` (not production), and ESP32 is powered on |
| "Nearby devices" permission denied | Grant via phone Settings → Apps → Unlockable → Permissions |
| ESP32 not discovered | Confirm sketch is uploaded and Serial Monitor shows it started |
