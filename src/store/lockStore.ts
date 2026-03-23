import { create } from 'zustand';
import { LockState, LockEvent } from '../fsm/types';
import { transition } from '../fsm/machine';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { bleService } from '../services/ble';

const MAX_ATTEMPTS = 3;
const TIMEOUT_DURATION = 30; // seconds

interface LockStore {
  state: LockState;
  attempts: number;
  timeoutRemaining: number;
  pendingPassword: string;
  isFirstLaunch: boolean;
  isReady: boolean;
  isConnected: boolean;
  dispatch: (event: LockEvent, payload?: string) => Promise<void>;
  startTimeout: () => void;
  initialize: () => Promise<void>;
  completeFirstLaunch: (pin: string) => Promise<void>;
  connectBLE: () => Promise<boolean>;
  disconnectBLE: () => Promise<void>;
}

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

export const useLockStore = create<LockStore>((set, get) => {
  // Wire BLE callbacks into the store
  bleService.onConnectionStateChange(connected => set({ isConnected: connected }));

  return {
    state: 'LOCKED',
    attempts: 0,
    timeoutRemaining: 0,
    pendingPassword: '',
    isFirstLaunch: false,
    isReady: false,
    isConnected: false,

    initialize: async () => {
      const flag = new File(Paths.document, 'setup_complete');
      if (!flag.exists) {
        await SecureStore.deleteItemAsync('lock_password').catch(() => {});
        set({ isFirstLaunch: true, isReady: true });
      } else {
        set({ isFirstLaunch: false, isReady: true });
      }
    },

    completeFirstLaunch: async (pin: string) => {
      const hashed = await hashPassword(pin);
      await SecureStore.setItemAsync('lock_password', hashed);
      new File(Paths.document, 'setup_complete').write('1');
      set({ isFirstLaunch: false });
    },

    connectBLE: async () => {
      const success = await bleService.connect();
      set({ isConnected: success });
      return success;
    },

    disconnectBLE: async () => {
      await bleService.disconnect();
      set({ isConnected: false });
    },

    dispatch: async (event: LockEvent, payload?: string) => {
      const { state, attempts } = get();

      if (event === 'START_ATTEMPT') {
        set({ state: transition(state, 'START_ATTEMPT') });
        return;
      }

      if (event === 'WRONG_PASSWORD') {
        const newAttempts = attempts + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
          set({ state: 'TIMEOUT', attempts: newAttempts });
          get().startTimeout();
        } else {
          set({ state: transition(state, 'WRONG_PASSWORD'), attempts: newAttempts });
        }
        return;
      }

      if (event === 'CORRECT_PASSWORD') {
        set({ state: transition(state, 'CORRECT_PASSWORD'), attempts: 0 });
        bleService.sendCommand('UNLOCK'); // tell hardware to unlock
        return;
      }

      if (event === 'MANUAL_LOCK') {
        set({ state: transition(state, 'MANUAL_LOCK') });
        bleService.sendCommand('LOCK'); // tell hardware to lock
        return;
      }

      if (event === 'PASSWORD_SUBMITTED' && payload) {
        set({ state: transition(state, 'PASSWORD_SUBMITTED'), pendingPassword: payload });
        return;
      }

      if (event === 'CONFIRM_PASSWORD_MATCH' && payload) {
        const hashed = await hashPassword(payload);
        await SecureStore.setItemAsync('lock_password', hashed);
        set({ state: transition(state, 'CONFIRM_PASSWORD_MATCH'), pendingPassword: '' });
        return;
      }

      if (event === 'CONFIRM_PASSWORD_MISMATCH') {
        set({ state: transition(state, 'CONFIRM_PASSWORD_MISMATCH'), pendingPassword: '' });
        return;
      }

      set({ state: transition(state, event) });
    },

    startTimeout: () => {
      set({ timeoutRemaining: TIMEOUT_DURATION });
      const interval = setInterval(() => {
        const { timeoutRemaining } = get();
        if (timeoutRemaining <= 1) {
          clearInterval(interval);
          bleService.sendCommand('LOCK'); // re-lock hardware when timeout expires
          set({ state: 'LOCKED', attempts: 0, timeoutRemaining: 0 });
        } else {
          set({ timeoutRemaining: timeoutRemaining - 1 });
        }
      }, 1000);
    },
  };
});

export async function verifyPassword(input: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync('lock_password');
  if (!stored) return false;
  const inputHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
  return inputHash === stored;
}
