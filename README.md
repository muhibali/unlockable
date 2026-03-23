# Unlockable

A React Native mobile app that interfaces with a smart door lock system powered by an ESP32. The app controls the lock through a finite state machine (FSM), with secure PIN-based access, attempt tracking, and timeout logic.

> **Platform note:** iOS builds require a Mac. Windows users can run the app on Android only.

---

## Prerequisites

### Everyone

**Node.js**
1. Go to https://nodejs.org
2. Download and install the **LTS** version
3. Verify it worked:
   ```bash
   node --version
   npm --version
   ```
   Both should print a version number.

**Git**
- Mac: run `git --version` in Terminal — if not installed, it will prompt you to install it
- Windows: download from https://git-scm.com and install with default settings

---

### Mac — iOS Setup

**1. Xcode**
1. Open the **App Store**, search for **Xcode**, and install it (~15GB, free)
2. Open Xcode once to accept the license agreement
3. Then run in Terminal:
   ```bash
   xcode-select --install
   ```

**2. CocoaPods**

Try this first:
```bash
sudo gem install cocoapods
```

If that fails, install Homebrew (https://brew.sh) then:
```bash
brew install cocoapods
```

Verify: `pod --version`

**3. Fix CocoaPods encoding**

Add this to your shell config so it persists across sessions:
```bash
echo 'export LANG=en_US.UTF-8' >> ~/.zshrc
source ~/.zshrc
```

---

### Windows — Android Setup

**1. Java Development Kit (JDK)**
1. Download JDK 17 from https://adoptium.net
2. Run the installer — tick the box to set `JAVA_HOME` automatically

**2. Android Studio**
1. Download from https://developer.android.com/studio and install it
2. On first launch, go through the setup wizard (it downloads the Android SDK)
3. Once open, go to **More Actions → SDK Manager** and make sure these are installed:
   - Android SDK Platform 35
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

**3. Set environment variables**

Open **System Properties → Environment Variables** and add:

| Variable | Value |
|---|---|
| `ANDROID_HOME` | `C:\Users\<you>\AppData\Local\Android\Sdk` |

Then add these to your `Path` variable:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

Restart your terminal after doing this.

**4. Create an Android Emulator**
1. In Android Studio go to **More Actions → Virtual Device Manager**
2. Click **Create Device**, pick any Pixel model, select a system image (API 35), and click Finish
3. Start the emulator by clicking the play button — keep it running while you build

---

## Project Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd unlockable
```

### 2. Install JavaScript dependencies

```bash
npm install
```

### 3. Mac only — Install iOS native dependencies

```bash
cd ios && LANG=en_US.UTF-8 pod install && cd ..
```

This takes a few minutes the first time.

---

## Running the App

### Mac — iOS Simulator

```bash
npx expo run:ios
```

### Mac — Physical iPhone

1. Connect your iPhone via USB
2. Open `ios/Unlockable.xcworkspace` in Xcode
3. Select your device from the top device picker
4. Under **Signing & Capabilities**, set your Apple ID as the signing team
5. Run:
   ```bash
   npx expo run:ios --device
   ```

### Windows — Android Emulator

Make sure your emulator is already running in Android Studio, then:
```bash
npx expo run:android
```

### Windows — Physical Android Device

1. On your phone go to **Settings → About Phone** and tap **Build Number** 7 times to enable Developer Options
2. Go to **Settings → Developer Options** and enable **USB Debugging**
3. Connect via USB and run:
   ```bash
   npx expo run:android --device
   ```

---

## Project Structure

```
unlockable/
├── app/                      # All screens (expo-router)
│   ├── index.tsx             # Home screen (Locked / Unlocked)
│   ├── attempt.tsx           # PIN entry screen
│   ├── timeout.tsx           # Locked out screen with countdown
│   ├── set-password.tsx      # Set new PIN screen
│   └── confirm-password.tsx  # Confirm new PIN screen
├── src/
│   ├── fsm/
│   │   └── lockMachine.ts    # Finite state machine logic
│   └── store/
│       └── lockStore.ts      # Zustand global state store
├── icons/                    # Lock state icons
├── unlockable-logo.png       # In-app logo
└── unlockable-app-logo.png   # Home screen app icon
```

---

## How It Works

The app is built around a **Finite State Machine** with these states:

| State | Description |
|---|---|
| `LOCKED` | Default state, door is secured |
| `UNLOCKED` | Door is open |
| `ATTEMPT` | User is entering their PIN |
| `TIMEOUT` | Temporarily locked out after 3 failed attempts |
| `SET_PASSWORD` | User is creating a new PIN |
| `CONFIRM_PASSWORD` | User is confirming the new PIN |

The UI always reflects the current FSM state — no direct state mutations happen outside the machine.

---

## Troubleshooting

### Mac

**`pod install` fails with encoding error**
```bash
LANG=en_US.UTF-8 pod install
```

**`npx expo run:ios` says Xcode not found**
```bash
xcode-select --install
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

**Build fails after installing a new npm package**

Any package with native code needs pods re-installed:
```bash
cd ios && LANG=en_US.UTF-8 pod install && cd ..
```

### Windows

**`adb` not found**

Make sure `ANDROID_HOME` and `Path` are set correctly (see prerequisites), then restart your terminal.

**Emulator not detected**

Make sure the Android emulator is fully booted before running `expo run:android`. You should see the Android home screen in the emulator window.

**`JAVA_HOME` not set error**

Re-run the JDK installer and make sure you ticked the option to set environment variables, or set it manually:
- Variable: `JAVA_HOME`
- Value: path to your JDK folder, e.g. `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`

### Everyone

**Metro bundler port conflict**
```bash
npx expo run:ios --port 8082
# or
npx expo run:android --port 8082
```
