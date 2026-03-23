import { Platform, PermissionsAndroid } from 'react-native';

let BleManager: any;
let Device: any;

// Polyfill atob/btoa for web/unsupported platforms
const atob = (str: string): string => {
  if (typeof global.atob === 'function') return global.atob(str);
  return Buffer.from(str, 'base64').toString('binary');
};

const btoa = (str: string): string => {
  if (typeof global.btoa === 'function') return global.btoa(str);
  return Buffer.from(str, 'binary').toString('base64');
};

// Only import BLE library on supported platforms (Android/iOS)
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  try {
    const ble = require('react-native-ble-plx');
    BleManager = ble.BleManager;
    Device = ble.Device;
  } catch (e) {
    console.warn('react-native-ble-plx not available on this platform', e);
  }
}

// ─── UUIDs — must match your ESP32 sketch exactly ────────────────────────────
export const SERVICE_UUID      = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
export const COMMAND_CHAR_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'; // app → ESP32
export const STATE_CHAR_UUID   = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'; // ESP32 → app

export const DEVICE_NAME = 'Unlockable';
const SCAN_TIMEOUT_MS = 10000;

class BLEService {
  private manager: any = BleManager ? new BleManager() : null;
  private device: any = null;
  private onStateChange?: (state: string) => void;
  private onConnectionChange?: (connected: boolean) => void;

  // ─── Permissions ────────────────────────────────────────────────────────────
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    const grants = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(grants).every(r => r === 'granted');
  }

  // ─── Connect ────────────────────────────────────────────────────────────────
  async connect(): Promise<boolean> {
    if (!this.manager || !BleManager) {
      console.warn('BLE not supported on this platform');
      return false;
    }

    const hasPerms = await this.requestPermissions();
    if (!hasPerms) return false;

    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        resolve(false);
      }, SCAN_TIMEOUT_MS);

      this.manager.startDeviceScan(null, { allowDuplicates: false }, async (error: any, scanned: any) => {
        if (error) {
          clearTimeout(timeout);
          resolve(false);
          return;
        }
        if (scanned?.name !== DEVICE_NAME) return;

        this.manager.stopDeviceScan();
        clearTimeout(timeout);

        try {
          this.device = await scanned.connect();
          await this.device.discoverAllServicesAndCharacteristics();

          // Watch for disconnection
          this.device.onDisconnected(() => {
            this.device = null;
            this.onConnectionChange?.(false);
          });

          // Subscribe to hardware state updates
          this.device.monitorCharacteristicForService(
            SERVICE_UUID,
            STATE_CHAR_UUID,
            (err: any, char: any) => {
              if (err || !char?.value) return;
              try {
                const decoded = atob(char.value);
                const parsed = JSON.parse(decoded) as { state: string };
                this.onStateChange?.(parsed.state);
              } catch { /* ignore malformed packets */ }
            }
          );

          this.onConnectionChange?.(true);
          resolve(true);
        } catch {
          resolve(false);
        }
      });
    });
  }

  // ─── Send command ────────────────────────────────────────────────────────────
  // Only sends LOCK or UNLOCK — nothing else ever reaches the hardware.
  async sendCommand(action: 'LOCK' | 'UNLOCK'): Promise<void> {
    if (!this.device) return; // silently skip if not connected (mock mode)
    try {
      const payload = btoa(JSON.stringify({ action }));
      await this.device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        COMMAND_CHAR_UUID,
        payload
      );
    } catch { /* connection dropped — the onDisconnected handler will update state */ }
  }

  // ─── Disconnect ─────────────────────────────────────────────────────────────
  async disconnect(): Promise<void> {
    await this.device?.cancelConnection().catch(() => {});
    this.device = null;
  }

  // ─── Callbacks ──────────────────────────────────────────────────────────────
  onHardwareStateChange(cb: (state: string) => void)   { this.onStateChange = cb; }
  onConnectionStateChange(cb: (connected: boolean) => void) { this.onConnectionChange = cb; }

  get connected(): boolean { return this.device !== null; }
}

export const bleService = new BLEService();
